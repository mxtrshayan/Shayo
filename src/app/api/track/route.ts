import { z } from "zod";
import { prisma } from "@/lib/prisma";

const lookupSchema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(6).max(60),
  phone: z
    .string()
    .trim()
    .regex(/^03\d{9}$/),
});

export async function POST(request: Request) {
  const parsed = lookupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      {
        error:
          "Enter your order number and the mobile number used at checkout.",
      },
      { status: 400 },
    );
  const order = await prisma.order.findFirst({
    where: parsed.data,
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      createdAt: true,
      totalPaisa: true,
      deliveryFeePaisa: true,
      subtotalPaisa: true,
      items: {
        select: {
          productName: true,
          quantity: true,
          unitPricePaisa: true,
          lineTotalPaisa: true,
        },
      },
      statusHistory: {
        select: { status: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!order)
    return Response.json(
      { error: "No matching order found. Check both details and try again." },
      { status: 404 },
    );
  return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
}
