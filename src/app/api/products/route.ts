import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams
    .get("q")
    ?.trim()
    .toLowerCase();
  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { sku: { contains: query } },
              { category: { name: { contains: query } } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      specifications: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      warranty: product.warranty,
      category: product.category.name,
      price: product.pricePaisa / 100,
      oldPrice: product.originalPrice ? product.originalPrice / 100 : undefined,
      stock: product.stockQuantity,
      image: product.images[0]?.path ?? null,
      images: product.images.map(({ path, alt }) => ({ path, alt })),
      specifications: product.specifications.map(({ label, value }) => ({
        label,
        value,
      })),
      badge: product.featured ? "Featured" : undefined,
    })),
  });
}
