import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase();
  const products = await prisma.product.findMany({
    where: { published: true, ...(query ? { OR: [{ name: { contains: query } }, { sku: { contains: query } }, { category: { name: { contains: query } } }] } : {}) },
    include: { category: true, images: { where: { isPrimary: true }, take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category.name,
      price: product.pricePaisa / 100,
      oldPrice: product.originalPrice ? product.originalPrice / 100 : undefined,
      stock: product.stockQuantity,
      image: product.images[0]?.path ?? null,
      badge: product.featured ? "Featured" : undefined,
    })),
  });
}
