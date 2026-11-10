import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorizedAdmin, readBody, validOrigin } from "../security";
const imagePath = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      !value ||
      /^\/(?!\/)[a-zA-Z0-9/_ .%-]+\.(png|jpe?g|webp|avif)$/i.test(value) ||
      /^https:\/\//i.test(value),
    "Use a local image path or HTTPS image URL.",
  );
const productSchema = z
  .object({
    id: z.string().min(1).optional(),
    name: z.string().trim().min(2).max(120),
    category: z.string().trim().min(2).max(60),
    sku: z.string().trim().min(2).max(60),
    price: z.number().positive().max(10000000),
    originalPrice: z.number().positive().max(10000000).nullable().optional(),
    stockQuantity: z.number().int().min(0).max(1000000),
    lowStockAt: z.number().int().min(0).max(1000000).default(5),
    shortDescription: z.string().trim().min(2).max(240),
    description: z.string().trim().min(2).max(5000),
    warranty: z.string().trim().max(120).optional(),
    imageUrl: imagePath.default(""),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
  })
  .refine((v) => !v.originalPrice || v.originalPrice >= v.price, {
    message: "Compare-at price must be at least the selling price.",
    path: ["originalPrice"],
  });
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export async function GET() {
  if (!(await authorizedAdmin()))
    return NextResponse.json(
      { error: "Sign in to continue." },
      { status: 401 },
    );
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}
export async function POST(request: Request) {
  const adminId = await authorizedAdmin();
  if (!adminId)
    return NextResponse.json(
      { error: "Sign in to continue." },
      { status: 401 },
    );
  if (!validOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const parsed = productSchema.safeParse(await readBody(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check product details." },
      { status: 400 },
    );
  const input = parsed.data;
  if (!slugify(input.name) || !slugify(input.category) || !slugify(input.sku))
    return NextResponse.json(
      { error: "Name, category and SKU must contain letters or numbers." },
      { status: 400 },
    );
  try {
    const product = await prisma.$transaction(async (tx) => {
      const previous = input.id
        ? await tx.product.findUnique({ where: { id: input.id } })
        : null;
      if (input.id && !previous) throw new Error("Product not found.");
      const category = await tx.category.upsert({
        where: { slug: slugify(input.category) },
        update: { name: input.category },
        create: { name: input.category, slug: slugify(input.category) },
      });
      const data = {
        name: input.name,
        slug: previous?.slug ?? `${slugify(input.name)}-${slugify(input.sku)}`,
        sku: input.sku,
        categoryId: category.id,
        pricePaisa: Math.round(input.price * 100),
        originalPrice: input.originalPrice
          ? Math.round(input.originalPrice * 100)
          : null,
        stockQuantity: input.stockQuantity,
        lowStockAt: input.lowStockAt,
        shortDescription: input.shortDescription,
        description: input.description,
        warranty: input.warranty || null,
        featured: input.featured,
        published: input.published,
      };
      const saved = input.id
        ? await tx.product.update({ where: { id: input.id }, data })
        : await tx.product.create({ data });
      const delta = input.stockQuantity - (previous?.stockQuantity ?? 0);
      if (delta)
        await tx.inventoryMovement.create({
          data: {
            productId: saved.id,
            quantity: delta,
            reason: previous ? "Admin stock adjustment" : "Opening inventory",
          },
        });
      const primary = await tx.productImage.findFirst({
        where: { productId: saved.id },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      });
      if (input.imageUrl) {
        if (primary)
          await tx.productImage.update({
            where: { id: primary.id },
            data: { path: input.imageUrl, alt: input.name, isPrimary: true },
          });
        else
          await tx.productImage.create({
            data: {
              productId: saved.id,
              path: input.imageUrl,
              alt: input.name,
              mimeType: "image/url",
              sizeBytes: 0,
              isPrimary: true,
            },
          });
      } else if (primary)
        await tx.productImage.delete({ where: { id: primary.id } });
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: input.id ? "UPDATE" : "CREATE",
          entity: "Product",
          entityId: saved.id,
          metadata: JSON.stringify({ sku: input.sku, stockDelta: delta }),
        },
      });
      return saved;
    });
    return NextResponse.json({ product }, { status: input.id ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json(
      {
        error: message.includes("Unique")
          ? "This SKU or category already exists."
          : message === "Product not found."
            ? message
            : "Unable to save product. Check the details and try again.",
      },
      { status: 400 },
    );
  }
}
export async function DELETE(request: Request) {
  const adminId = await authorizedAdmin();
  if (!adminId)
    return NextResponse.json(
      { error: "Sign in to continue." },
      { status: 401 },
    );
  if (!validOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return NextResponse.json(
      { error: "Product ID is required." },
      { status: 400 },
    );
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product)
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: { published: false, featured: false },
    });
    await tx.adminAuditLog.create({
      data: { adminId, action: "ARCHIVE", entity: "Product", entityId: id },
    });
  });
  return NextResponse.json({
    ok: true,
    message: "Product archived. Order and inventory history is preserved.",
  });
}
