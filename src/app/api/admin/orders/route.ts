import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorizedAdmin, readBody, validOrigin } from "../security";
const schema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING_CONFIRMATION",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
  paymentStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  note: z.string().trim().max(300).optional(),
});
export async function GET() {
  if (!(await authorizedAdmin()))
    return NextResponse.json(
      { error: "Sign in to continue." },
      { status: 401 },
    );
  return NextResponse.json({
    orders: await prisma.order.findMany({
      include: {
        items: true,
        payment: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  });
}
export async function PATCH(request: Request) {
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
  const parsed = schema.safeParse(await readBody(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid order update." },
      { status: 400 },
    );
  const { orderId, status, paymentStatus, note } = parsed.data;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!existing) throw new Error("Order not found.");
      if (existing.status === "CANCELLED" && status !== "CANCELLED")
        throw new Error(
          "Cancelled orders cannot be reopened. Create a new order instead.",
        );
      if (existing.status === "DELIVERED" && status !== "DELIVERED")
        throw new Error("Delivered orders cannot change fulfilment status.");
      if (status === "CANCELLED" && existing.status !== "CANCELLED")
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              reason: "Order cancelled; stock restored",
              orderId,
            },
          });
        }
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status, ...(paymentStatus ? { paymentStatus } : {}) },
      });
      if (existing.status !== status || note)
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            status,
            note: note || "Updated by store administrator.",
          },
        });
      if (paymentStatus)
        await tx.payment.upsert({
          where: { orderId },
          update: {
            status: paymentStatus,
            verifiedAt: paymentStatus === "VERIFIED" ? new Date() : null,
          },
          create: {
            orderId,
            method: existing.paymentMethod,
            status: paymentStatus,
            verifiedAt: paymentStatus === "VERIFIED" ? new Date() : null,
          },
        });
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: "UPDATE",
          entity: "Order",
          entityId: orderId,
          metadata: JSON.stringify({ status, paymentStatus, note }),
        },
      });
      return updated;
    });
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error &&
          /^(Order not found|Cancelled orders|Delivered orders)/.test(
            error.message,
          )
            ? error.message
            : "Unable to update order.",
      },
      { status: 400 },
    );
  }
}
