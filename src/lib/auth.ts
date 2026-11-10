import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const cookieName = "shayo_admin_session";

function sessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!value || value.length < 32)) {
    throw new Error(
      "Set SESSION_SECRET to at least 32 random characters before enabling admin access in production.",
    );
  }
  return new TextEncoder().encode(value ?? "local-development-change-me");
}

export async function createAdminSession(adminId: string) {
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(sessionSecret());
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function getAdminId() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ["HS256"],
    });
    if (typeof payload.adminId !== "string") return null;
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
      select: { id: true },
    });
    return admin?.id ?? null;
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}
