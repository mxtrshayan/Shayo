"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Truck,
  X,
  MessageCircle,
} from "lucide-react";
import { useShop } from "./shop-provider";
import { money, whatsapp } from "@/lib/shop";
export function StoreShell({ children }: { children: ReactNode }) {
  const shop = useShop(),
    [menu, setMenu] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        ".section-top,.category-tile,.brand-note-inner,.faq-item,.footer-topline",
      )
      .forEach((el) => {
        el.classList.add("scroll-reveal");
        observer.observe(el);
      });
    return () => observer.disconnect();
  }, []);
  const count = shop.lines.reduce((s, x) => s + x.quantity, 0),
    items = shop.lines.map((x) => ({
      ...x,
      p: shop.products.find((p) => p.id === x.productId),
    })),
    total = items.reduce((s, x) => s + (x.p?.price ?? 0) * x.quantity, 0),
    remaining = Math.max(0, shop.settings.freeDeliveryPaisa / 100 - total);
  useEffect(() => {
    if (!shop.bagOpen) return;
    const previous = document.activeElement as HTMLElement;
    close.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") shop.setBagOpen(false);
      if (e.key === "Tab") {
        const focusable = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".bag-panel a,.bag-panel button",
          ),
        );
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, [shop.bagOpen, shop.setBagOpen]);
  return (
    <div className="store">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="announcement">
        A little upgrade goes a long way.{" "}
        <span>
          Free delivery over {money(shop.settings.freeDeliveryPaisa / 100)}
        </span>
        <ArrowUpRight size={12} />
      </div>
      <header className="store-header">
        <Link href="/" className="wordmark" aria-label="SHAYO home">
          {shop.settings.storeName.toLowerCase()}
          <span>®</span>
        </Link>
        <nav
          className={menu ? "store-nav is-open" : "store-nav"}
          aria-label="Main navigation"
        >
          <Link href="/products" onClick={() => setMenu(false)}>
            The collection
          </Link>
          <Link
            href="/products?category=Wireless%20Earbuds"
            onClick={() => setMenu(false)}
          >
            Audio essentials
          </Link>
          <Link href="/about" onClick={() => setMenu(false)}>
            Our story
          </Link>
          <Link href="/track" onClick={() => setMenu(false)}>
            Track your order
          </Link>
        </nav>
        <div className="header-tools">
          <Link
            href="/products?search=1"
            className="icon-btn"
            aria-label="Search products"
          >
            <Search size={19} />
          </Link>
          <Link
            href="/products?saved=1"
            className="icon-btn wishlist-nav"
            aria-label="Saved products"
          >
            <Heart size={19} />
            {shop.saved.length > 0 && <i />}
          </Link>
          <button
            className="bag-trigger"
            onClick={() => shop.setBagOpen(true)}
            aria-label={`Open shopping bag, ${count} items`}
          >
            <ShoppingBag size={18} />
            <span className="bag-word">Bag</span>
            <b>{count}</b>
          </button>
          <button
            className="icon-btn mobile-menu"
            aria-label="Toggle menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="store-footer">
        <div className="footer-topline">
          <p>
            Better tech.
            <br />
            <span>Better every day.</span>
          </p>
          <a
            href={whatsapp(shop.settings.whatsappNumber)}
            target="_blank"
            rel="noreferrer"
            className="round-link"
            aria-label="Chat with SHAYO on WhatsApp"
          >
            <ArrowUpRight size={30} />
          </a>
        </div>
        <div className="footer-columns">
          <div>
            <Link href="/" className="wordmark">
              {shop.settings.storeName.toLowerCase()}
              <span>®</span>
            </Link>
            <p>
              Thoughtful little upgrades.
              <br />
              Delivered across Pakistan.
            </p>
            <a
              href={whatsapp(shop.settings.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={14} /> Say hello on WhatsApp
            </a>
          </div>
          <div>
            <b>Explore</b>
            <Link href="/products">The collection</Link>
            <Link href="/products?saved=1">Your saved picks</Link>
            <Link href="/about">Our story</Link>
          </div>
          <div>
            <b>Here to help</b>
            <Link href="/track">Track an order</Link>
            <Link href="/help">Delivery & returns</Link>
            <Link href="/help#privacy">Privacy</Link>
            <a href={whatsapp(shop.settings.whatsappNumber)}>Get in touch ↗</a>
          </div>
          <div>
            <b>A simpler way to pay</b>
            <p>
              Cash on delivery, nationwide.
              <br />
              Wallet transfers when enabled.
            </p>
            <div className="payment-tags">
              <span>COD</span>
              <span>PKR</span>
              <span>PAKISTAN</span>
            </div>
            <Link href="https://www.shyonlabs.tech/" target="_blank">
              Part of ShyonLabs ↗
            </Link>
          </div>
        </div>
        <div className="footer-bottomline">
          <span>© 2026 SHAYO. A little better, every day.</span>
          <span>Designed with care in Pakistan.</span>
          <Link href="/admin">Store admin ↗</Link>
        </div>
      </footer>
      {shop.toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {shop.toast}
          <button
            className="icon-btn"
            onClick={() => shop.setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {shop.bagOpen && (
        <div className="bag-overlay" onClick={() => shop.setBagOpen(false)}>
          <aside
            className="bag-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bag-head">
              <h2 id="bag-title">
                Your good picks <span>({count})</span>
              </h2>
              <button
                ref={close}
                className="icon-btn"
                onClick={() => shop.setBagOpen(false)}
                aria-label="Close bag"
              >
                <X />
              </button>
            </div>
            {count ? (
              <>
                <div className="delivery-progress">
                  <Truck size={17} />
                  <p>
                    {remaining ? (
                      <>
                        You’re <b>{money(remaining)}</b> away from free
                        delivery.
                      </>
                    ) : (
                      <>
                        Good news. <b>Delivery is on us.</b>
                      </>
                    )}
                  </p>
                  <div>
                    <i
                      style={{
                        width: `${Math.min(100, (total / (shop.settings.freeDeliveryPaisa / 100)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="bag-lines">
                  {items.map((x) => (
                    <div className="bag-line" key={x.productId}>
                      <img
                        src={x.p?.image || "/images/studio-headphones.webp"}
                        alt={x.p?.name || "Unavailable product"}
                      />
                      <div>
                        <small>{x.p?.category}</small>
                        <h3>
                          {x.p?.name || "This product is no longer available"}
                        </h3>
                        <b>{money(x.p?.price ?? 0)}</b>
                        <div className="quantity">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() =>
                              shop.quantity(x.productId, x.quantity - 1)
                            }
                          >
                            <Minus size={12} />
                          </button>
                          <span>{x.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            disabled={
                              x.quantity >= (x.p?.stock ?? 0) ||
                              x.quantity >= 20
                            }
                            onClick={() =>
                              shop.quantity(x.productId, x.quantity + 1)
                            }
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="icon-btn"
                        aria-label="Remove product"
                        onClick={() => shop.quantity(x.productId, 0)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bag-bottom">
                  <p>
                    <span>Subtotal</span>
                    <b>{money(total)}</b>
                  </p>
                  <small>
                    Delivery calculated at checkout. All prices in PKR.
                  </small>
                  <Link
                    href="/checkout"
                    className="button primary full"
                    onClick={() => shop.setBagOpen(false)}
                  >
                    Let’s check out <ArrowRight size={17} />
                  </Link>
                  <button
                    className="underlink"
                    onClick={() => shop.setBagOpen(false)}
                  >
                    Keep exploring
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <ShoppingBag size={40} />
                <h3>A little room for something good.</h3>
                <p>Your next everyday essential is waiting.</p>
                <Link
                  className="button primary"
                  href="/products"
                  onClick={() => shop.setBagOpen(false)}
                >
                  Explore the collection <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
