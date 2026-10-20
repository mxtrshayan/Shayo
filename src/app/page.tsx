"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import {
  ArrowRight,
  Check,
  Heart,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Truck,
  X,
  Zap,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  color: string;
};

const products: Product[] = [
  { id: 1, name: "AeroFit Pro Smartwatch", category: "Smartwatches", price: 7499, oldPrice: 8999, image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=85", badge: "Best seller", color: "#dce9ff" },
  { id: 2, name: "Sonic Buds Air", category: "Wireless Earbuds", price: 4299, oldPrice: 5499, image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85", badge: "New", color: "#e7e4ff" },
  { id: 3, name: "Beam Mini Speaker", category: "Speakers", price: 3699, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85", color: "#dff6f1" },
  { id: 4, name: "FlowCharge 20K", category: "Power Banks", price: 5499, oldPrice: 6499, image: "https://images.unsplash.com/photo-1609592424773-9aa8f7b4a8c8?auto=format&fit=crop&w=900&q=85", badge: "Popular", color: "#fff0d9" },
  { id: 5, name: "Studio One Headphones", category: "Headphones", price: 8999, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", color: "#f0e5ff" },
  { id: 6, name: "SwiftCharge 65W", category: "Chargers & Cables", price: 2999, image: "https://images.unsplash.com/photo-1625841704674-cc967e23b7a1?auto=format&fit=crop&w=900&q=85", color: "#e7f0ff" },
];

const categories = ["All products", "Smartwatches", "Wireless Earbuds", "Speakers", "Headphones", "Power Banks"];
const money = (value: number) => `PKR ${value.toLocaleString("en-PK")}`;

export default function Home() {
  const [category, setCategory] = useState("All products");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Product[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);

  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "All products" || product.category === category;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [category, query]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className={dark ? "site dark" : "site"}>
      <div className="announcement"><Sparkles size={14} /> Free delivery on orders over PKR 5,000 <span>•</span> Cash on delivery available nationwide</div>
      <header className="header">
        <Link className="logo" href="/">SHAYO<span>.</span></Link>
        <nav className={menuOpen ? "nav open" : "nav"}>
          <a href="/products">Shop</a><a href="#categories">Categories</a><a href="/about">About</a><a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <label className="search"><Search size={17} /><input aria-label="Search products" placeholder="Search gadgets..." value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <button className="icon-button" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
          <a className="icon-button desktop-only" aria-label="Wishlist" href="/products"><Heart size={19} /></a>
          <button className="bag-button" aria-label="Open cart" onClick={() => setCartOpen(true)}><ShoppingBag size={19} /><b>{cart.length}</b></button>
          <button className="menu-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> The everyday tech edit</div>
          <h1>Better tech.<br /><em>Better days.</em></h1>
          <p className="urdu-kicker" lang="ur" dir="rtl">سستی اور اچھی ٹیکنالوجی آپ کے ہاتھوں میں۔</p>
          <p>Thoughtfully chosen gadgets that fit your life, look good doing it, and arrive at your door anywhere in Pakistan.</p>
          <div className="hero-actions"><a className="primary-button" href="#shop">Explore collection <ArrowRight size={17} /></a><a className="text-link" href="#why-shayo">Why SHAYO <span>↗</span></a></div>
          <div className="hero-proof"><div className="avatars"><span>SA</span><span>HM</span><span>AK</span></div><div><strong>4.9/5</strong><small>Loved by 2,000+ customers</small></div></div>
        </div>
        <div className="hero-art">
          <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
          <div className="product-stage"><div className="watch-face"><div className="watch-time">10<span>:</span>09</div><div className="watch-date">MON 24 JUN</div><div className="watch-ring" /></div><div className="watch-strap" /></div>
          <div className="floating-card"><Zap size={16} fill="currentColor" /><span>Up to 7 days<br /><b>battery life</b></span></div>
          <div className="hero-label">AEROFIT PRO <span>01 / 06</span></div>
        </div>
      </section>

      <section className="trust-row"><div><Truck size={20} /><span><b>Fast delivery</b><small>Across Pakistan</small></span></div><div><Check size={20} /><span><b>Quality checked</b><small>Every product, always</small></span></div><div><ShoppingBag size={20} /><span><b>Easy checkout</b><small>COD & wallet payments</small></span></div><div><Heart size={20} /><span><b>Real support</b><small>Here when you need us</small></span></div></section>

      <section className="section" id="shop">
        <div className="section-heading"><div><div className="eyebrow">Curated for you</div><h2>Good things,<br /><em>in small packages.</em></h2></div><a className="text-link" href="/products">View all products <ArrowRight size={16} /></a></div>
        <div className="filter-row" id="categories">{categories.map((item) => <button key={item} className={category === item ? "filter active" : "filter"} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}><div className="product-image" style={{ background: product.color }}><Image src={product.image} alt={product.name} width={600} height={600} /><button className={saved.includes(product.id) ? "heart saved" : "heart"} aria-label={`Save ${product.name}`} onClick={() => setSaved(saved.includes(product.id) ? saved.filter((id) => id !== product.id) : [...saved, product.id])}><Heart size={17} fill={saved.includes(product.id) ? "currentColor" : "none"} /></button>{product.badge && <span className="badge">{product.badge}</span>}</div><div className="product-meta"><span>{product.category}</span><h3>{product.name}</h3><div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}<button className="add-button" onClick={() => { setCart([...cart, product]); setCartOpen(true); }} aria-label={`Add ${product.name} to cart`}>+</button></div></div></article>)}</div>
      </section>

      <section className="feature-banner"><div><div className="eyebrow">Your new daily essential</div><h2>Small upgrades.<br /><em>Big difference.</em></h2><p className="urdu-kicker" lang="ur" dir="rtl">روزمرہ کی زندگی کے لیے بہتر ٹیک۔</p><p>From your first notification to your last playlist, find tech that keeps up.</p><a className="primary-button light" href="#shop">Shop the edit <ArrowRight size={17} /></a></div><div className="banner-art"><div className="earbud left" /><div className="earbud right" /><div className="sound-wave wave-one" /><div className="sound-wave wave-two" /></div></section>

      <section className="why section" id="why-shayo"><div className="section-heading"><div><div className="eyebrow">The SHAYO standard</div><h2>Tech shopping,<br /><em>done properly.</em></h2></div></div><div className="why-grid"><div><span className="why-number">01</span><h3>Only the good stuff</h3><p>We keep the catalogue focused on useful, well-designed products we would happily use ourselves. Every item is selected for everyday value, not just flashy features.</p><a className="why-link" href="/products">Explore the collection <ArrowRight size={14} /></a></div><div><span className="why-number">02</span><h3>Clear, honest pricing</h3><p>No confusing surprises at checkout. What you see is what you pay, with delivery details upfront and real discounts calculated from the original price.</p><a className="why-link" href="#shop">See current offers <ArrowRight size={14} /></a></div><div><span className="why-number">03</span><h3>Human support</h3><p>Questions before or after your order? Reach us directly on WhatsApp at 03162609779. We keep support simple, friendly, and genuinely useful.</p><a className="why-link" href="https://wa.me/923162609779" target="_blank" rel="noreferrer">Chat with SHAYO <ArrowRight size={14} /></a></div></div></section>

      <section className="sister-banner"><div><div className="eyebrow">Part of the same creative family</div><h2>Powered by ideas.<br /><em>Built for real life.</em></h2><p>SHAYO is a sister company of ShyonLabs, the AI-powered software and digital products studio. Together, we connect thoughtful digital thinking with useful everyday tech.</p><a className="sister-link" href="https://www.shyonlabs.tech/" target="_blank" rel="noreferrer">Visit ShyonLabs <ArrowRight size={15} /></a></div><div className="sister-mark"><span>SHAYO</span><i>×</i><span>SHYON<br />LABS</span></div></section>

      <SiteFooter />

      {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(e) => e.stopPropagation()}><div className="drawer-heading"><h2>Your bag <small>{cart.length} items</small></h2><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={38} /><h3>Your bag is waiting</h3><p>Add something useful to get started.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Continue shopping</button></div> : <><div className="cart-items">{cart.map((item, index) => <div className="cart-item" key={`${item.id}-${index}`}><Image src={item.image} alt="" width={67} height={67} /><div><span>{item.category}</span><h3>{item.name}</h3><strong>{money(item.price)}</strong></div><button aria-label="Remove item" onClick={() => setCart(cart.filter((_, i) => i !== index))}><X size={15} /></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{money(cartTotal)}</strong></div><div><span>Delivery</span><strong>{cartTotal >= 5000 ? "Free" : money(250)}</strong></div><div className="total"><span>Total</span><strong>{money(cartTotal + (cartTotal >= 5000 ? 0 : 250))}</strong></div><button className="primary-button checkout">Continue to checkout <ArrowRight size={17} /></button><small>Secure checkout · COD available</small></div></>}</aside></div>}
    </main>
  );
}
