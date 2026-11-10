import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight, Package, ShoppingBag, Settings } from "lucide-react";
import s from "../admin.module.css";
export const instant = false;
const money = (v: number) => `Rs. ${(v / 100).toLocaleString("en-PK")}`;
export default async function AdminPage() {
  await connection();
  const [orders, products, pending, revenue, recent, lowStock] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.order.count({ where: { status: "PENDING_CONFIRMATION" } }),
      prisma.order.aggregate({
        _sum: { totalPaisa: true },
        where: { status: "DELIVERED" },
      }),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      prisma.product.findMany({
        where: { published: true },
        orderBy: { stockQuantity: "asc" },
        take: 6,
      }),
    ]);
  return (
    <>
      <div className={s.titleRow}>
        <div>
          <div className={s.eyebrow}>Your store, at a glance</div>
          <h1>Let’s make good things happen.</h1>
          <p className={s.muted}>
            A little clarity for your everyday operations.
          </p>
        </div>
        <Link href="/" className={s.secondary}>
          View store <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className={s.metrics}>
        {[
          {
            label: "Delivered revenue",
            value: money(revenue._sum.totalPaisa ?? 0),
            note: "Completed orders",
          },
          { label: "Total orders", value: orders, note: "Across all statuses" },
          {
            label: "Awaiting confirmation",
            value: pending,
            note: "Ready for your attention",
          },
          {
            label: "Live products",
            value: products,
            note: "Available in the storefront",
          },
        ].map((m) => (
          <div className={s.metric} key={m.label}>
            <span>{m.label}</span>
            <strong>{m.value}</strong>
            <small>{m.note}</small>
          </div>
        ))}
      </div>
      <div className={s.split}>
        <section className={s.panel}>
          <div className={s.titleRow} style={{ marginBottom: 15 }}>
            <div>
              <h2>Latest orders</h2>
              <p className={s.muted}>The newest additions to your day.</p>
            </div>
            <Link className={s.back} href="/admin/orders" style={{ margin: 0 }}>
              View all →
            </Link>
          </div>
          {recent.length ? (
            <div className={s.activity}>
              {recent.map((o) => (
                <Link href="/admin/orders" key={o.id}>
                  <div>
                    <b>{o.orderNumber}</b>
                    <small>
                      {o.customerName} · {o.city}
                    </small>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <b>{money(o.totalPaisa)}</b>
                    <small>{o.status.replaceAll("_", " ").toLowerCase()}</small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={s.empty}>
              <ShoppingBag size={30} style={{ margin: "0 auto 12px" }} />
              <p>Your first order starts here.</p>
              <Link href="/admin/products" className={s.secondary}>
                Prepare your catalogue
              </Link>
            </div>
          )}
        </section>
        <section className={s.panel}>
          <h2>Inventory watch</h2>
          <p className={s.muted}>Your products with the lowest stock.</p>
          <div className={s.activity}>
            {lowStock.map((p) => (
              <Link href="/admin/products" key={p.id}>
                <div>
                  <b>{p.name}</b>
                  <small>{p.sku}</small>
                </div>
                <span
                  className={s.badge}
                  data-warning={p.stockQuantity <= p.lowStockAt}
                >
                  {p.stockQuantity} left
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <section className={s.panel}>
        <h2>Make yourself at home.</h2>
        <p className={s.muted}>
          Everything you need to keep your store moving.
        </p>
        <div className={s.toolbar} style={{ marginTop: 20, marginBottom: 0 }}>
          <Link className={s.secondary} href="/admin/products">
            <Package size={16} />
            Manage products
          </Link>
          <Link className={s.secondary} href="/admin/orders">
            <ShoppingBag size={16} />
            Review orders
          </Link>
          <Link className={s.secondary} href="/admin/settings">
            <Settings size={16} />
            Store settings
          </Link>
        </div>
      </section>
    </>
  );
}
