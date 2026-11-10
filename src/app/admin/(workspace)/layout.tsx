import { redirect } from "next/navigation";
import { connection } from "next/server";
import { authorizedAdmin } from "@/app/api/admin/security";
import AdminShell from "../admin-shell";
export const instant = false;
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  if (!(await authorizedAdmin())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
