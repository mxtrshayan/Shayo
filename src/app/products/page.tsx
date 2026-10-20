"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { ArrowLeft, ArrowRight, Heart, Moon, Search, ShoppingBag, Sun } from "lucide-react";

type Product = { id: number; name: string; category: string; price: number; oldPrice?: number; image: string; badge?: string; color: string };

const products: Product[] = [
  { id: 1, name: "AeroFit Pro Smartwatch", category: "Smartwatches", price: 7499, oldPrice: 8999, image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=85", badge: "Best seller", color: "#dce9ff" },
  { id: 2, name: "Sonic Buds Air", category: "Wireless Earbuds", price: 4299, oldPrice: 5499, image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85", badge: "New", color: "#e7e4ff" },
  { id: 3, name: "Beam Mini Speaker", category: "Speakers", price: 3699, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85", color: "#dff6f1" },
  { id: 4, name: "FlowCharge 20K", category: "Power Banks", price: 5499, oldPrice: 6499, image: "https://images.unsplash.com/photo-1609592424773-9aa8f7b4a8c8?auto=format&fit=crop&w=900&q=85", badge: "Popular", color: "#fff0d9" },
  { id: 5, name: "Studio One Headphones", category: "Headphones", price: 8999, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", color: "#f0e5ff" },
  { id: 6, name: "SwiftCharge 65W", category: "Chargers & Cables", price: 2999, image: "https://images.unsplash.com/photo-1625841704674-cc967e23b7a1?auto=format&fit=crop&w=900&q=85", color: "#e7f0ff" },
];

const money = (value: number) => `PKR ${value.toLocaleString("en-PK")}`;

export default function ProductsPage() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All products");
  const [cartCount, setCartCount] = useState(0);
  const [saved, setSaved] = useState<number[]>([]);
  const categories = ["All products", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = useMemo(() => products.filter((product) => (category === "All products" || product.category === category) && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);

  return <main className={dark ? "site dark products-page" : "site products-page"}>
    <div className="announcement">Free delivery on orders over PKR 5,000 <span>•</span> Cash on delivery available nationwide</div>
    <header className="header"><Link className="logo" href="/">SHAYO<span>.</span></Link><nav className="nav products-nav"><Link className="active-nav" href="/products">Shop</Link><Link href="/#categories">Categories</Link><Link href="/about">About</Link><Link href="/#contact">Contact</Link></nav><div className="header-actions"><label className="search"><Search size={17} /><input aria-label="Search products" placeholder="Search gadgets..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><button className="icon-button" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button><button className="bag-button" aria-label={`${cartCount} items in cart`}><ShoppingBag size={19} /><b>{cartCount}</b></button></div></header>
    <section className="products-hero"><Link className="back-link" href="/"><ArrowLeft size={15} /> Back to home</Link><div className="eyebrow">The complete collection</div><h1>Find your<br /><em>new favourite.</em></h1><p>Useful, well-designed tech for work, play, and all the little moments in between.</p></section>
    <section className="products-list section"><div className="products-toolbar"><strong>{filtered.length} products</strong><div className="filter-row">{categories.map((item) => <button className={category === item ? "filter active" : "filter"} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}><div className="product-image" style={{ background: product.color }}><Image src={product.image} alt={product.name} width={600} height={600} /><button className={saved.includes(product.id) ? "heart saved" : "heart"} aria-label={`Save ${product.name}`} onClick={() => setSaved(saved.includes(product.id) ? saved.filter((id) => id !== product.id) : [...saved, product.id])}><Heart size={17} fill={saved.includes(product.id) ? "currentColor" : "none"} /></button>{product.badge && <span className="badge">{product.badge}</span>}</div><div className="product-meta"><span>{product.category}</span><h3>{product.name}</h3><div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}<button className="add-button" onClick={() => setCartCount(cartCount + 1)} aria-label={`Add ${product.name} to cart`}>+</button></div></div></article>)}</div>{filtered.length === 0 && <div className="empty-products"><Search size={24} /><h2>No gadgets found</h2><p>Try a different search or clear the category filter.</p><button className="primary-button" onClick={() => { setQuery(""); setCategory("All products"); }}>Clear filters <ArrowRight size={16} /></button></div>}</section>
    <SiteFooter />
  </main>;
}
