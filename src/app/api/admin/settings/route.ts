import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorizedAdmin, readBody, validOrigin } from "../security";
const phone = z
  .string()
  .trim()
  .regex(/^\+?\d[\d -]{8,18}\d$/, "Enter a valid contact number.");
const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => !v || /^https:\/\//.test(v), "Use an HTTPS link.")
  .default("");
const schema = z
  .object({
    storeName: z.string().trim().min(2).max(80),
    tagline: z.string().trim().min(2).max(160),
    whatsappNumber: phone,
    easypaisaTitle: z.string().trim().min(2).max(80),
    easypaisaNumber: phone,
    jazzcashTitle: z.string().trim().max(80).default(""),
    jazzcashNumber: z.string().trim().max(20).default(""),
    deliveryFeePaisa: z.number().int().min(0).max(100000000),
    freeDeliveryPaisa: z.number().int().min(0).max(1000000000),
    lowStockThreshold: z.number().int().min(0).max(1000000),
    facebookUrl: url,
    instagramUrl: url,
    linkedinUrl: url,
  })
  .refine((v) => Boolean(v.jazzcashTitle) === Boolean(v.jazzcashNumber), {
    message: "Add both JazzCash account title and number, or leave both empty.",
  });
export async function GET() {
  if (!(await authorizedAdmin()))
    return NextResponse.json(
      { error: "Sign in to continue." },
      { status: 401 },
    );
  return NextResponse.json({
    settings: await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {},
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
      { error: parsed.error.issues[0]?.message ?? "Check store settings." },
      { status: 400 },
    );
  try {
    const settings = await prisma.$transaction(async (tx) => {
      const data = {
        ...parsed.data,
        jazzcashTitle: parsed.data.jazzcashTitle || null,
        jazzcashNumber: parsed.data.jazzcashNumber || null,
      };
      const saved = await tx.storeSettings.upsert({
        where: { id: "default" },
        update: data,
        create: { id: "default", ...data },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: "UPDATE",
          entity: "StoreSettings",
          entityId: "default",
        },
      });
      return saved;
    });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: "Unable to save settings. Try again." },
      { status: 500 },
    );
  }
}
