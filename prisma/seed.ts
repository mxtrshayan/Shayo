import "dotenv/config";
import { prisma } from "../src/lib/prisma";
const catalogue = [
  {
    name: "AeroFit Pro Smartwatch",
    category: "Smartwatches",
    pricePaisa: 749900,
    originalPrice: 899900,
    stockQuantity: 12,
    sku: "SHY-WAT-001",
    image: "/images/watch.webp",
    shortDescription: "A considered companion for your everyday routine.",
    description:
      "A clean, modern smartwatch for your daily rotation. Its understated graphite finish pairs easily with workdays and weekends. Contact our team to confirm current features, compatibility, and available variants.",
  },
  {
    name: "Sonic Buds Air",
    category: "Wireless Earbuds",
    pricePaisa: 429900,
    originalPrice: 549900,
    stockQuantity: 24,
    sku: "SHY-EAR-001",
    image: "/images/buds.webp",
    shortDescription: "Your playlist. Your pace. A little space for yourself.",
    description:
      "Compact wireless earbuds with a pocket-friendly charging case. A simple audio essential for your everyday carry. Ask our team about current battery specifications, device compatibility, and available colours before ordering.",
  },
  {
    name: "Beam Mini Speaker",
    category: "Speakers",
    pricePaisa: 369900,
    stockQuantity: 8,
    sku: "SHY-SPK-001",
    image: "/images/speaker.webp",
    shortDescription: "Bring a little good energy wherever the day takes you.",
    description:
      "A compact speaker with a tactile, fabric-inspired design. Made for the little listening moments at home and on the move. Confirm connectivity, battery details, and available finishes with our team.",
  },
  {
    name: "FlowCharge 20K",
    category: "Power Banks",
    pricePaisa: 549900,
    originalPrice: 649900,
    stockQuantity: 16,
    sku: "SHY-PBK-001",
    image: "/images/power.webp",
    shortDescription: "Keep a little extra energy close at hand.",
    description:
      "A streamlined portable charging essential with an understated graphite finish. Contact our team to confirm supported devices, rated capacity, charging speeds, and included accessories.",
  },
  {
    name: "Studio One Headphones",
    category: "Headphones",
    pricePaisa: 899900,
    originalPrice: 1099900,
    stockQuantity: 15,
    sku: "SHY-HDP-001",
    image: "/images/studio-headphones.webp",
    shortDescription: "A softer landing for your favourite sounds.",
    description:
      "An over-ear audio essential with an ivory finish, metal-inspired details, and warm orange accents. For your playlist, your focus time, and your daily commute. Ask our team to confirm audio features, battery details, connectivity, and available variants.",
  },
  {
    name: "SwiftCharge 65W",
    category: "Chargers & Cables",
    pricePaisa: 299900,
    stockQuantity: 20,
    sku: "SHY-CHG-001",
    image: "/images/charger.webp",
    shortDescription: "Less clutter. A little more ready for the day.",
    description:
      "A compact charging essential with a clean ivory finish. Confirm device compatibility, supported output, included cables, and plug type with our team before placing your order.",
  },
];
async function main() {
  for (const item of catalogue) {
    const slug = item.category.toLowerCase().replaceAll(" ", "-");
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: item.category, slug },
    });
    const product = await prisma.product.upsert({
      where: { sku: item.sku },
      update: {
        shortDescription: item.shortDescription,
        description: item.description,
      },
      create: {
        name: item.name,
        slug: item.name.toLowerCase().replaceAll(" ", "-"),
        sku: item.sku,
        shortDescription: item.shortDescription,
        description: item.description,
        pricePaisa: item.pricePaisa,
        originalPrice: item.originalPrice,
        stockQuantity: item.stockQuantity,
        categoryId: category.id,
        featured: true,
        published: true,
      },
    });
    const image = await prisma.productImage.findFirst({
      where: { productId: product.id, isPrimary: true },
    });
    if (image)
      await prisma.productImage.update({
        where: { id: image.id },
        data: { path: item.image, alt: item.name, mimeType: "image/webp" },
      });
    else
      await prisma.productImage.create({
        data: {
          productId: product.id,
          path: item.image,
          alt: item.name,
          mimeType: "image/webp",
          sizeBytes: 0,
          isPrimary: true,
        },
      });
  }
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {},
  });
  console.log(
    "Updated six development catalogue products and generated visuals. Existing prices, stock, orders, and settings preserved.",
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
