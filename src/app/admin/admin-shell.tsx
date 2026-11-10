"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import s from "./admin.module.css";
const links = [
  { href: "/admin", title: "Overview", Icon: LayoutDashboard },
  { href: "/admin/products", title: "Products", Icon: Package },
  { href: "/admin/orders", title: "Orders", Icon: ShoppingBag },
  { href: "/admin/settings", title: "Settings", Icon: Settings },
];
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <main className={s.shell}>
      <aside className={s.sidebar}>
        <Link href="/admin" className={s.brand}>
          SHAYO<span>.</span>
        </Link>
        <div>
          <div className={s.eyebrow}>Store workspace</div>
          <nav className={s.navigation} aria-label="Administration">
            {links.map(({ href, title, Icon }) => (
              <Link href={href} key={href} data-active={pathname === href}>
                <Icon size={18} />
                {title}
              </Link>
            ))}
          </nav>
        </div>
        <div className={s.sidebarFooter}>
          <Link href="/">
            View storefront <ArrowUpRight size={13} />
          </Link>
          <form action="/api/admin/logout" method="post">
            <button>Sign out</button>
          </form>
        </div>
      </aside>
      <div className={s.workspace}>
        <header className={s.topbar}>
          <span>
            SHAYO /{" "}
            {links.find((link) => link.href === pathname)?.title ?? "Workspace"}
          </span>
          <div className={s.actions}>
            <span>Store administrator</span>
            <div className={s.avatar}>S</div>
            <form action="/api/admin/logout" method="post">
              <button
                className={s.secondary}
                style={{ padding: "7px 10px", fontSize: 11 }}
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
        <div className={s.content}>{children}</div>
      </div>
    </main>
  );
}
