"use client";

import { ArrowLeft, ArrowRight, ExternalLink, Moon, Sparkles, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPage() {
  const [dark, setDark] = useState(false);

  return (
    <main className={dark ? "site dark about-page" : "site about-page"}>
      <div className="announcement"><Sparkles size={14} /> Thoughtful tech for better days</div>
      <header className="header">
        <Link className="logo" href="/">SHAYO<span>.</span></Link>
        <nav className="nav products-nav"><Link href="/products">Shop</Link><Link href="/#categories">Categories</Link><Link className="active-nav" href="/about">About</Link><Link href="/#contact">Contact</Link></nav>
        <button className="icon-button" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
      </header>

      <section className="about-hero">
        <Link className="back-link" href="/"><ArrowLeft size={15} /> Back to home</Link>
        <div className="eyebrow">Built for Pakistan, made for every day</div>
        <h1>Useful tech.<br /><em>Honest prices.</em></h1>
        <p className="urdu-line" lang="ur" dir="rtl">اچھی ٹیکنالوجی، مناسب قیمت پر۔</p>
        <p>SHAYO brings valuable, everyday gadgets to Pakistan at sasti, fair prices — with simple ordering, nationwide delivery, and support that feels human.</p>
      </section>

      <section className="about-story">
        <div className="about-story-label"><span>SHAYO</span><i>×</i><span>SHYON<br />LABS</span></div>
        <div><div className="eyebrow">A sister company of ShyonLabs</div><h2>Tech that works<br /><em>for your life.</em></h2><p>SHAYO is founded by the same person behind <a href="https://www.shyonlabs.tech/" target="_blank" rel="noreferrer">ShyonLabs</a>, an AI-powered software and digital products studio. SHAYO is its sister company, bringing that same care for thoughtful design and useful technology into the world of consumer gadgets.</p><p>We believe good tech should not feel out of reach. That is why we look for valuable products, practical features, and affordable prices for Pakistani customers — from smartwatches and earbuds to chargers and everyday accessories.</p><p className="urdu-copy" lang="ur" dir="rtl">کم قیمت، بہترین فائدہ، روزمرہ زندگی کے لیے۔</p><a className="sister-link" href="https://www.shyonlabs.tech/" target="_blank" rel="noreferrer">Explore ShyonLabs <ExternalLink size={14} /></a></div>
      </section>

      <section className="about-values section"><div className="eyebrow">Why Pakistan chooses SHAYO</div><h2>Seedhi baat.<br /><em>Achhi technology.</em></h2><p className="about-intro">We keep shopping simple, prices sensible, and the experience familiar for customers across Pakistan.</p><div className="about-value-grid"><div><strong>01</strong><h3>Qeemat jo samajh aaye</h3><p>Valuable products at affordable prices, with clear pricing and no confusing surprises at checkout.</p></div><div><strong>02</strong><h3>Pakistan-wide convenience</h3><p>Order from home, choose COD or wallet payment, and get delivery support wherever you are in Pakistan.</p></div><div><strong>03</strong><h3>Tech you can use</h3><p>We focus on practical gadgets that improve work, travel, entertainment, and everyday routines.</p></div></div></section>

      <section className="about-cta"><div><div className="eyebrow">Ready when you are</div><h2>Find something<br /><em>made for your day.</em></h2></div><Link className="primary-button" href="/products">Shop SHAYO <ArrowRight size={17} /></Link></section>
      <SiteFooter />
    </main>
  );
}
