import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function AdminPage() {
  await connection();
  if (!(await getAdminId())) redirect("/admin/login");
  const [orders, products, pending, delivered] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: "PENDING_CONFIRMATION" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
  ]);
  return (
    <main className="admin-shell">
      <header className="admin-header"><Link className="logo" href="/">SHAYO<span>.</span></Link><form action="/api/admin/logout" method="post"><button className="admin-link">Log out</button></form></header>
      <section className="admin-content"><div className="admin-eyebrow">Store operations</div><h1>Good morning, admin.</h1><p className="admin-muted">Keep an eye on what is moving through SHAYO.</p>
        <div className="metrics"><div><span>Total orders</span><strong>{orders}</strong></div><div><span>Products</span><strong>{products}</strong></div><div><span>Pending review</span><strong>{pending}</strong></div><div><span>Delivered</span><strong>{delivered}</strong></div></div>
        <div className="admin-panel"><div><h2>Quick actions</h2><p className="admin-muted">The local database is connected and ready for catalogue and order operations.</p></div><div className="admin-actions"><a href="/admin/products">Manage products <span>→</span></a><a href="/admin/orders">Review orders <span>→</span></a><a href="/admin/settings">Store settings <span>→</span></a></div></div>
      </section>
    </main>
  );
}
