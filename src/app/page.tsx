"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Headphones,
  Watch,
  Speaker,
  Zap,
  Truck,
  ShieldCheck,
  MessageCircle,
  PackageCheck,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";
import { StoreShell } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { useShop } from "@/components/shop-provider";
import { money, whatsapp } from "@/lib/shop";
const categories = [
  ["All the good stuff", "All", PackageCheck],
  ["Plug into your world", "Headphones", Headphones],
  ["A little more connected", "Smartwatches", Watch],
  ["Sound that goes places", "Speakers", Speaker],
  ["Keep your day going", "Power Banks", Zap],
] as const;
export default function Home() {
  const shop = useShop(),
    [category, setCategory] = useState("All"),
    [faq, setFaq] = useState<number | null>(0);
  const stage = useRef<HTMLDivElement>(null);
  const featured = shop.products
    .filter((p) => category === "All" || p.category === category)
    .slice(0, 4);
  return (
    <StoreShell>
      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <i /> THE EVERYDAY, UPGRADED.
          </div>
          <h1>
            Good tech.
            <br />
            Great days.<span className="hero-period">*</span>
          </h1>
          <p>
            For your commute. Your playlist. Your everyday.
            <br className="desktop-break" /> Discover little upgrades that make
            a big difference.
          </p>
          <Link className="button primary" href="/products">
            Find your next favourite <ArrowUpRight size={19} />
          </Link>
          <div className="hero-footnote">
            <span className="tiny-star">✳</span> Thoughtfully picked. Fairly
            priced.
            <br />
            Delivered anywhere in Pakistan.
          </div>
        </div>
        <div
          className="hero-scene"
          ref={stage}
          onPointerMove={(e) => {
            if (!stage.current) return;
            const b = stage.current.getBoundingClientRect();
            stage.current.style.setProperty(
              "--rx",
              `${-(e.clientY - b.top - b.height / 2) / 55}deg`,
            );
            stage.current.style.setProperty(
              "--ry",
              `${(e.clientX - b.left - b.width / 2) / 55}deg`,
            );
          }}
          onPointerLeave={() => {
            stage.current?.style.setProperty("--rx", "0deg");
            stage.current?.style.setProperty("--ry", "0deg");
          }}
        >
          <span className="scene-top">THE SOUND OF A BETTER DAY</span>
          <div className="scene-orbit" />
          <div className="hero-product">
            <img
              src="/images/studio-headphones.webp"
              alt="Ivory Studio One wireless headphones with orange ear cushions"
              fetchPriority="high"
            />
          </div>
          <div className="floating-note">
            <span className="status-dot" /> YOUR WORLD. ON MUTE.
            <Headphones size={16} />
          </div>
          <div className="scene-bottom">
            <div>
              <small>MEET YOUR NEW DAILY ESSENTIAL</small>
              <strong>Studio One Headphones</strong>
            </div>
            <Link
              href="/products/studio-one-headphones"
              className="scene-arrow"
              aria-label="Explore Studio One headphones"
            >
              <ArrowUpRight size={24} />
            </Link>
          </div>
          <span className="scene-index">01 — THE AUDIO EDIT</span>
        </div>
      </section>
      <div className="benefits-strip">
        <div>
          <Truck size={18} />
          <span>Pakistan-wide delivery</span>
        </div>
        <span className="strip-dot">✳</span>
        <div>
          <PackageCheck size={18} />
          <span>Cash on delivery</span>
        </div>
        <span className="strip-dot">✳</span>
        <div>
          <ShieldCheck size={18} />
          <span>Thoughtfully selected</span>
        </div>
        <span className="strip-dot">✳</span>
        <div>
          <MessageCircle size={18} />
          <span>Real people. Real support.</span>
        </div>
      </div>
      <section className="collection-section page-width" id="collection">
        <div className="section-top">
          <div>
            <span className="eyebrow">SMALL UPGRADES. BIG ENERGY.</span>
            <h2>
              Your everyday,
              <br />
              <span>with a little extra.</span>
            </h2>
          </div>
          <div className="section-description">
            <p>
              The useful. The beautiful. The why-didn’t-I-get-this-sooner.
              <br />
              Meet the things you’ll reach for, every single day.
            </p>
            <Link className="arrow-link" href="/products">
              Explore the whole collection <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="category-tabs" aria-label="Filter featured products">
          {[
            "All",
            "Wireless Earbuds",
            "Headphones",
            "Smartwatches",
            "Speakers",
            "Power Banks",
          ].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={category === c ? "selected" : ""}
            >
              {c === "All" ? "All the good stuff" : c}
            </button>
          ))}
        </div>
        {shop.loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" />
            ))}
          </div>
        ) : shop.error ? (
          <div role="alert" className="empty-state">
            <p>{shop.error}</p>
            <button className="button" onClick={() => shop.refresh()}>
              Try again
            </button>
          </div>
        ) : featured.length ? (
          <div className="product-grid">
            {featured.map((p, i) => (
              <ProductCard product={p} index={i} key={p.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>More good things are on their way.</p>
            <Link href="/products" className="arrow-link">
              Browse all products <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
      <section className="audio-feature page-width">
        <div className="audio-copy">
          <div className="eyebrow">
            <i /> LESS NOISE. MORE YOU.
          </div>
          <h2>
            Find your
            <br />
            <em>happy frequency.</em>
          </h2>
          <p>
            For the main-character walk. The deep-focus hour.
            <br />
            The one song you always play twice.
          </p>
          <Link
            className="button cream"
            href="/products?category=Wireless%20Earbuds"
          >
            Meet your sound <ArrowUpRight size={18} />
          </Link>
          <small>THE AUDIO ESSENTIALS — SHAYO</small>
        </div>
        <div className="audio-visual">
          <div className="sound-ring ring-one" />
          <div className="sound-ring ring-two" />
          <div className="sound-ring ring-three" />
          <img
            src="/images/buds.webp"
            alt="Sonic Buds Air wireless earbuds and charging case"
            loading="lazy"
          />
          <span className="audio-caption">
            A LITTLE SPACE
            <br />
            FOR YOURSELF.
          </span>
        </div>
      </section>
      <section className="category-section page-width">
        <div className="section-top">
          <div>
            <span className="eyebrow">WHAT’S YOUR EVERYDAY MISSING?</span>
            <h2>
              There’s a good
              <br />
              <span>thing for that.</span>
            </h2>
          </div>
          <Link href="/products" className="arrow-link">
            Find your thing <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.slice(1).map(([caption, c, Icon], i) => (
            <Link
              href={`/products?category=${encodeURIComponent(c)}`}
              className="category-tile"
              key={c}
            >
              <span className="category-number">0{i + 1}</span>
              <Icon size={38} strokeWidth={1} />
              <div>
                <small>{caption}</small>
                <h3>{c === "Power Banks" ? "Power & charging" : c}</h3>
              </div>
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </div>
      </section>
      <section className="brand-note">
        <div className="page-width brand-note-inner">
          <span className="brand-asterisk">✳</span>
          <div>
            <div className="eyebrow">NOT MORE STUFF. MORE GOOD DAYS.</div>
            <h2>
              Life’s complicated.
              <br />
              Your tech shouldn’t be.
            </h2>
            <p>
              We’re SHAYO. We find well-designed, useful tech and make it easy
              to get your hands on. Clear prices. A simpler checkout. People you
              can actually talk to.
            </p>
            <Link href="/about" className="arrow-link">
              A little more about us <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="brand-side-note">
            BUILT FOR YOUR WORLD.
            <br />
            ROOTED IN PAKISTAN.
            <br />
            <span>اچھی ٹیک، اچھے دن۔</span>
          </div>
        </div>
      </section>
      <section className="faq-section page-width">
        <div>
          <span className="eyebrow">GOOD QUESTIONS. STRAIGHT ANSWERS.</span>
          <h2>
            A little clarity.
            <br />
            <span>A lot less hassle.</span>
          </h2>
          <p>Still wondering about something?</p>
          <a
            className="arrow-link"
            href={whatsapp(shop.settings.whatsappNumber)}
          >
            Let’s talk on WhatsApp <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="faq-list">
          {[
            [
              "Do you deliver to my city?",
              "We deliver across Pakistan. Delivery cost is shown before you place your order, and we confirm timing with you after ordering.",
            ],
            [
              "Can I pay when my order arrives?",
              "Yes. Choose cash on delivery at checkout and pay the courier when your order arrives. Enabled wallet transfer options are also shown at checkout.",
            ],
            [
              "How much is delivery?",
              `Delivery is ${money(shop.settings.deliveryFeePaisa / 100)}. Orders of ${money(shop.settings.freeDeliveryPaisa / 100)} or more qualify for free delivery. Your exact total is always shown before ordering.`,
            ],
            [
              "How can I get help with my order?",
              "Use Track your order with your order number and mobile number, or message our team on WhatsApp. For product issues or return requests, contact us with your order details.",
            ],
          ].map(([q, a], i) => (
            <div className="faq-item" key={q}>
              <button
                aria-expanded={faq === i}
                aria-controls={`faq-${i}`}
                onClick={() => setFaq(faq === i ? null : i)}
              >
                {q}
                {faq === i ? <Minus size={18} /> : <Plus size={18} />}
              </button>
              {faq === i && <p id={`faq-${i}`}>{a}</p>}
            </div>
          ))}
        </div>
      </section>
      <div className="closing-line page-width">
        <span>GOOD TECH. GOOD ENERGY. GOOD TO GO.</span>
        <Link href="/products">
          Make your everyday better <ArrowRight size={18} />
        </Link>
      </div>
    </StoreShell>
  );
}
