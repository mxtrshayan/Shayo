import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function authorizedAdmin() {
  const id = await getAdminId();
  if (!id) return null;
  return (
    (await prisma.adminUser.findUnique({ where: { id }, select: { id: true } }))
      ?.id ?? null
  );
}
export function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
export async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
