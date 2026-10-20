import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  storeName: z.string().trim().min(2).max(80), tagline: z.string().trim().min(2).max(160), whatsappNumber: z.string().trim().min(10).max(20),
  easypaisaTitle: z.string().trim().min(2).max(80), easypaisaNumber: z.string().trim().min(10).max(20), jazzcashTitle: z.string().trim().max(80), jazzcashNumber: z.string().trim().max(20),
  deliveryFeePaisa: z.coerce.number().int().min(0), freeDeliveryPaisa: z.coerce.number().int().min(0), lowStockThreshold: z.coerce.number().int().min(0),
});

export async function GET() {
  if (!(await getAdminId())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ settings: await prisma.storeSettings.upsert({ where: { id: "default" }, update: {}, create: {} }) });
}

export async function PATCH(request: Request) {
  const adminId = await getAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings." }, { status: 400 });
  const settings = await prisma.storeSettings.update({ where: { id: "default" }, data: { ...parsed.data, jazzcashTitle: parsed.data.jazzcashTitle || null, jazzcashNumber: parsed.data.jazzcashNumber || null } });
  await prisma.adminAuditLog.create({ data: { adminId, action: "UPDATE", entity: "StoreSettings", entityId: "default" } });
  return NextResponse.json({ settings });
}
