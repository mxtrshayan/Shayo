import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive().max(20) })).min(1),
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().regex(/^03\d{9}$/, "Enter a valid Pakistani mobile number."),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(8).max(300),
  instructions: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["COD", "EASYPAISA", "JAZZCASH"]),
  transactionRef: z.string().trim().max(100).optional(),
  idempotencyKey: z.string().uuid(),
});

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order." }, { status: 400 });
  const input = parsed.data;
  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  if (input.paymentMethod === "JAZZCASH" && (!settings?.jazzcashNumber || !settings.jazzcashTitle)) {
    return NextResponse.json({ error: "JazzCash is not configured yet." }, { status: 400 });
  }
  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (existing) return existing;
      const products = await Promise.all(input.items.map((item) => tx.product.findUnique({ where: { id: item.productId } })));
      if (products.some((product) => !product)) throw new Error("One or more products are unavailable.");
      const lines = input.items.map((item, index) => {
        const product = products[index]!;
        if (product.stockQuantity < item.quantity) throw new Error(`${product.name} does not have enough stock.`);
        return { product, quantity: item.quantity, lineTotalPaisa: product.pricePaisa * item.quantity };
      });
      const subtotalPaisa = lines.reduce((sum, line) => sum + line.lineTotalPaisa, 0);
      const deliveryFeePaisa = subtotalPaisa >= (settings?.freeDeliveryPaisa ?? 500000) ? 0 : (settings?.deliveryFeePaisa ?? 25000);
      const orderNumber = `SHY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const created = await tx.order.create({
        data: {
          orderNumber, customerName: input.customerName, phone: input.phone, city: input.city, address: input.address,
          instructions: input.instructions, subtotalPaisa, deliveryFeePaisa, totalPaisa: subtotalPaisa + deliveryFeePaisa,
          paymentMethod: input.paymentMethod, idempotencyKey: input.idempotencyKey,
          items: { create: lines.map((line) => ({ productId: line.product.id, productName: line.product.name, sku: line.product.sku, quantity: line.quantity, unitPricePaisa: line.product.pricePaisa, lineTotalPaisa: line.lineTotalPaisa })) },
          payment: { create: { method: input.paymentMethod, transactionRef: input.transactionRef } },
          statusHistory: { create: { status: "PENDING_CONFIRMATION", note: "Order placed by customer." } },
        },
      });
      for (const line of lines) {
        await tx.product.update({ where: { id: line.product.id }, data: { stockQuantity: { decrement: line.quantity } } });
        await tx.inventoryMovement.create({ data: { productId: line.product.id, quantity: -line.quantity, reason: "Order placed", orderId: created.id } });
      }
      return created;
    });
    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to place order." }, { status: 400 });
  }
}
