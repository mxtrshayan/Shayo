import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";
import { validOrigin } from "../security";
export async function POST(request: Request) {
  if (!validOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
