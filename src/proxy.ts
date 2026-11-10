import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

// Redirect before page streaming starts so the login document loads its own
// styles and navigation state. The workspace and APIs still authorize against
// the database; this is only the early, optimistic session check.
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const token = request.cookies.get("shayo_admin_session")?.value;
  const configured = process.env.SESSION_SECRET;
  const secret =
    configured ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "local-development-change-me");
  if (
    token &&
    secret &&
    (process.env.NODE_ENV !== "production" || secret.length >= 32)
  ) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        { algorithms: ["HS256"] },
      );
      if (typeof payload.adminId === "string") return NextResponse.next();
    } catch {
      /* An invalid or expired session needs a fresh sign-in. */
    }
  }
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.delete("shayo_admin_session");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
