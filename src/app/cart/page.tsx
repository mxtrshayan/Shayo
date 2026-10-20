"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, X } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

type CartItem = { id: number; name: string; category: string; price: number; image: string };
const money = (value: number) => `PKR ${value.toLocaleString("en-PK")}`;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem("shayo-cart") ?? "[]");
        if (Array.isArray(stored)) setItems(stored);
      } catch {
        window.localStorage.removeItem("shayo-cart");
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("shayo-cart", JSON.stringify(items));
  }, [items, hydrated]);
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price, 0), [items]);
  const delivery = subtotal >= 5000 ? 0 : 250;

  return <main className="site cart-page">
    <header className="header"><Link className="logo" href="/">SHAYO<span>.</span></Link><Link className="back-link" href="/products"><ArrowLeft size={15} /> Continue shopping</Link></header>
    <section className="cart-page-content">
      <div className="eyebrow">Your selection</div><h1>Your cart.</h1>
      {items.length === 0 ? <div className="empty-cart-page"><ShoppingBag size={38} /><h2>Your cart is empty</h2><p>Add useful tech and it will appear here.</p><Link className="primary-button" href="/products">Browse products</Link></div> : <div className="cart-layout"><div className="cart-page-items">{items.map((item, index) => <article className="cart-page-item" key={`${item.id}-${index}`}><div><span>{item.category}</span><h2>{item.name}</h2><strong>{money(item.price)}</strong></div><button aria-label={`Remove ${item.name}`} onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}><X size={17} /></button></article>)}</div><aside className="cart-page-summary"><h2>Summary</h2><p><span>Subtotal</span><strong>{money(subtotal)}</strong></p><p><span>Delivery</span><strong>{delivery ? money(delivery) : "Free"}</strong></p><p className="cart-total"><span>Total</span><strong>{money(subtotal + delivery)}</strong></p><p className="cart-note">Checkout is ready for COD. Contact support if you need help placing your order.</p></aside></div>}
    </section>
    <SiteFooter />
  </main>;
}
