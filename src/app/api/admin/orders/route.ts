import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({ orderId: z.string(), status: z.enum(["PENDING_CONFIRMATION", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]), paymentStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional() });

export async function GET() {
  if (!(await getAdminId())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const orders = await prisma.order.findMany({ include: { items: true, payment: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
  const { orderId, status, paymentStatus } = parsed.data;
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id: orderId }, data: { status, ...(paymentStatus ? { paymentStatus } : {}) } });
    await tx.orderStatusHistory.create({ data: { orderId, status, note: "Updated from admin panel." } });
    if (paymentStatus) await tx.payment.update({ where: { orderId }, data: { status: paymentStatus, verifiedAt: paymentStatus === "VERIFIED" ? new Date() : null } });
    await tx.adminAuditLog.create({ data: { adminId, action: "UPDATE", entity: "Order", entityId: orderId, metadata: JSON.stringify({ status, paymentStatus }) } });
    return updated;
  });
  return NextResponse.json({ order });
}
