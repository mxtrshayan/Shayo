import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
    select: {
      storeName: true,
      tagline: true,
      whatsappNumber: true,
      deliveryFeePaisa: true,
      freeDeliveryPaisa: true,
      easypaisaTitle: true,
      easypaisaNumber: true,
      jazzcashTitle: true,
      jazzcashNumber: true,
      facebookUrl: true,
      instagramUrl: true,
      linkedinUrl: true,
    },
  });
  return Response.json({
    settings: settings ?? {
      storeName: "SHAYO",
      tagline: "Your everyday tech, delivered.",
      whatsappNumber: "03162609779",
      deliveryFeePaisa: 25000,
      freeDeliveryPaisa: 500000,
      easypaisaTitle: null,
      easypaisaNumber: null,
      jazzcashTitle: null,
      jazzcashNumber: null,
      facebookUrl: null,
      instagramUrl: null,
      linkedinUrl: null,
    },
  });
}
