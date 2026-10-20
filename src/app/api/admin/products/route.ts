import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  sku: z.string().trim().min(2).max(60),
  price: z.coerce.number().positive(),
  originalPrice: z.coerce.number().positive().optional(),
  stockQuantity: z.coerce.number().int().min(0),
  shortDescription: z.string().trim().min(2).max(240),
  description: z.string().trim().min(2).max(3000),
  warranty: z.string().trim().max(120).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export async function GET() {
  if (!(await getAdminId())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product." }, { status: 400 });
  const input = parsed.data;
  const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${input.sku.toLowerCase()}`;
  try {
    const product = await prisma.$transaction(async (tx) => {
      const category = await tx.category.upsert({ where: { slug: input.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") }, update: { name: input.category }, create: { name: input.category, slug: input.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") } });
      const data = {
        name: input.name, slug, sku: input.sku, shortDescription: input.shortDescription, description: input.description,
        pricePaisa: Math.round(input.price * 100), originalPrice: input.originalPrice ? Math.round(input.originalPrice * 100) : null,
        stockQuantity: input.stockQuantity, categoryId: category.id, warranty: input.warranty || null, featured: input.featured, published: input.published,
      };
      const saved = input.id ? await tx.product.update({ where: { id: input.id }, data }) : await tx.product.create({ data });
      if (input.imageUrl) {
        await tx.productImage.deleteMany({ where: { productId: saved.id } });
        await tx.productImage.create({ data: { productId: saved.id, path: input.imageUrl, alt: input.name, mimeType: "image/url", sizeBytes: 0, isPrimary: true } });
      }
      await tx.adminAuditLog.create({ data: { adminId, action: input.id ? "UPDATE" : "CREATE", entity: "Product", entityId: saved.id } });
      return saved;
    });
    return NextResponse.json({ product }, { status: input.id ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.message.includes("Unique") ? "Name or SKU already exists." : "Unable to save product." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
  try {
    await prisma.product.delete({ where: { id } });
    await prisma.adminAuditLog.create({ data: { adminId, action: "DELETE", entity: "Product", entityId: id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "This product cannot be deleted because it is referenced by an order." }, { status: 409 });
  }
}
