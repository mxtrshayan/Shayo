import { prisma } from "../src/lib/prisma";

const catalogue = [
  { name: "AeroFit Pro Smartwatch", category: "Smartwatches", pricePaisa: 749900, originalPrice: 899900, stockQuantity: 12, sku: "SHY-WAT-001", image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=85" },
  { name: "Sonic Buds Air", category: "Wireless Earbuds", pricePaisa: 429900, originalPrice: 549900, stockQuantity: 24, sku: "SHY-EAR-001", image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85" },
  { name: "Beam Mini Speaker", category: "Speakers", pricePaisa: 369900, stockQuantity: 8, sku: "SHY-SPK-001", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85" },
  { name: "FlowCharge 20K", category: "Power Banks", pricePaisa: 549900, originalPrice: 649900, stockQuantity: 16, sku: "SHY-PBK-001", image: "https://images.unsplash.com/photo-1609592424773-9aa8f7b4a8c8?auto=format&fit=crop&w=900&q=85" },
];

async function main() {
  for (const item of catalogue) {
    const category = await prisma.category.upsert({
      where: { slug: item.category.toLowerCase().replaceAll(" ", "-") },
      update: {},
      create: { name: item.category, slug: item.category.toLowerCase().replaceAll(" ", "-") },
    });
    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      update: { stockQuantity: item.stockQuantity, published: true },
      create: {
        name: item.name, slug: item.name.toLowerCase().replaceAll(" ", "-"),
        sku: item.sku, shortDescription: "Development catalogue product.",
        description: "A development sample product for the SHAYO local store.",
        pricePaisa: item.pricePaisa, originalPrice: item.originalPrice, stockQuantity: item.stockQuantity,
        categoryId: category.id, featured: true, published: true,
      },
    });
    await prisma.productImage.upsert({
      where: { id: `${product.id}-primary` },
      update: { path: item.image },
      create: { id: `${product.id}-primary`, productId: product.id, path: item.image, alt: item.name, mimeType: "image/jpeg", sizeBytes: 0, isPrimary: true },
    });
  }
  await prisma.storeSettings.upsert({ where: { id: "default" }, update: {}, create: {} });
  console.log("Seeded development catalogue.");
}

main().finally(() => prisma.$disconnect());
