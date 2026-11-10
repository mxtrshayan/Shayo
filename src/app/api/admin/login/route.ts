import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdminSession } from "@/lib/auth";
import { readBody, validOrigin } from "../security";
const schema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  if (!validOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const parsed = schema.safeParse(await readBody(request));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  const email = parsed.data.email.toLowerCase();
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.until < now) attempts.delete(key);
  const attempt = attempts.get(email);
  if (attempt && attempt.count >= 10)
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  try {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (
      !admin ||
      !(await bcrypt.compare(parsed.data.password, admin.passwordHash))
    ) {
      attempts.set(email, {
        count: (attempt?.count ?? 0) + 1,
        until: attempt?.until ?? now + 900000,
      });
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    }
    await createAdminSession(admin.id);
    attempts.delete(email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Sign-in is temporarily unavailable. Check server configuration.",
      },
      { status: 503 },
    );
  }
}
