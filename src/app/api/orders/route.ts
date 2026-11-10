import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(100),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1)
    .max(50),
  customerName: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(
      /^03\d{9}$/,
      "Enter a valid Pakistani mobile number, such as 03001234567.",
    ),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(8).max(300),
  instructions: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["COD", "EASYPAISA", "JAZZCASH"]),
  transactionRef: z.string().trim().max(100).optional(),
  idempotencyKey: z.string().uuid(),
});

class CheckoutError extends Error {}

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order." },
      { status: 400 },
    );
  const input = parsed.data;
  const quantities = new Map<string, number>();
  for (const item of input.items)
    quantities.set(
      item.productId,
      (quantities.get(item.productId) ?? 0) + item.quantity,
    );
  if ([...quantities.values()].some((quantity) => quantity > 20)) {
    return NextResponse.json(
      { error: "You can order up to 20 of each product." },
      { status: 400 },
    );
  }
  if (
    input.paymentMethod !== "COD" &&
    (!input.transactionRef || input.transactionRef.length < 4)
  ) {
    return NextResponse.json(
      {
        error:
          "Enter the transaction reference from your completed wallet transfer.",
      },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { items: true },
      });
      if (existing) {
        const matches =
          existing.phone === input.phone &&
          existing.customerName === input.customerName &&
          existing.address === input.address &&
          existing.city === input.city &&
          existing.paymentMethod === input.paymentMethod &&
          existing.items.length === quantities.size &&
          existing.items.every(
            (item) => quantities.get(item.productId) === item.quantity,
          );
        if (!matches)
          throw new CheckoutError(
            "This checkout reference has already been used. Refresh and try again.",
          );
        return existing;
      }
      const settings = await tx.storeSettings.findUnique({
        where: { id: "default" },
      });
      if (
        input.paymentMethod === "EASYPAISA" &&
        (!settings?.easypaisaNumber || !settings.easypaisaTitle)
      ) {
        throw new CheckoutError(
          "Easypaisa is not available. Please choose cash on delivery.",
        );
      }
      if (
        input.paymentMethod === "JAZZCASH" &&
        (!settings?.jazzcashNumber || !settings.jazzcashTitle)
      ) {
        throw new CheckoutError(
          "JazzCash is not available. Please choose cash on delivery.",
        );
      }
      const products = await tx.product.findMany({
        where: { id: { in: [...quantities.keys()] }, published: true },
      });
      if (products.length !== quantities.size)
        throw new CheckoutError(
          "A product in your bag is no longer available. Please update your bag.",
        );
      const lines = products.map((product) => {
        const quantity = quantities.get(product.id)!;
        if (product.stockQuantity < quantity)
          throw new CheckoutError(
            `${product.name} has only ${product.stockQuantity} available. Please update your bag.`,
          );
        return {
          product,
          quantity,
          lineTotalPaisa: product.pricePaisa * quantity,
        };
      });
      const subtotalPaisa = lines.reduce(
        (sum, line) => sum + line.lineTotalPaisa,
        0,
      );
      const deliveryFeePaisa =
        subtotalPaisa >= (settings?.freeDeliveryPaisa ?? 500000)
          ? 0
          : (settings?.deliveryFeePaisa ?? 25000);
      // The conditional update also protects stock if another checkout wins a race.
      for (const line of lines) {
        const reserved = await tx.product.updateMany({
          where: {
            id: line.product.id,
            published: true,
            stockQuantity: { gte: line.quantity },
          },
          data: { stockQuantity: { decrement: line.quantity } },
        });
        if (reserved.count !== 1)
          throw new CheckoutError(
            `${line.product.name} just sold out. Please update your bag.`,
          );
      }
      const orderNumber = `SHY-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName,
          phone: input.phone,
          city: input.city,
          address: input.address,
          instructions: input.instructions,
          subtotalPaisa,
          deliveryFeePaisa,
          totalPaisa: subtotalPaisa + deliveryFeePaisa,
          paymentMethod: input.paymentMethod,
          idempotencyKey: input.idempotencyKey,
          items: {
            create: lines.map((line) => ({
              productId: line.product.id,
              productName: line.product.name,
              sku: line.product.sku,
              quantity: line.quantity,
              unitPricePaisa: line.product.pricePaisa,
              lineTotalPaisa: line.lineTotalPaisa,
            })),
          },
          payment: {
            create: {
              method: input.paymentMethod,
              transactionRef:
                input.paymentMethod === "COD" ? null : input.transactionRef,
            },
          },
          statusHistory: {
            create: {
              status: "PENDING_CONFIRMATION",
              note: "Order placed by customer.",
            },
          },
        },
      });
      await tx.inventoryMovement.createMany({
        data: lines.map((line) => ({
          productId: line.product.id,
          quantity: -line.quantity,
          reason: "Order placed",
          orderId: created.id,
        })),
      });
      return created;
    });
    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        totalPaisa: order.totalPaisa,
        status: order.status,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CheckoutError)
      return NextResponse.json({ error: error.message }, { status: 400 });
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P2034", "P2002"].includes(error.code)
    ) {
      return NextResponse.json(
        {
          error:
            "Another checkout is being processed. Please try again in a moment.",
        },
        { status: 409 },
      );
    }
    console.error("Checkout failed", error);
    return NextResponse.json(
      {
        error:
          "We could not place your order. Please try again, or contact support.",
      },
      { status: 500 },
    );
  }
}
