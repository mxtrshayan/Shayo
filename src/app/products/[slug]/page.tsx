"use client";
import { Suspense, use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { StoreShell } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { useShop } from "@/components/shop-provider";
import { money, whatsapp } from "@/lib/shop";
function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params),
    shop = useShop(),
    [qty, setQty] = useState(1),
    [image, setImage] = useState<string | null>(null);
  const p = shop.products.find((p) => p.slug === slug);
  if (shop.loading)
    return (
      <StoreShell>
        <div className="page-width detail-grid">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </StoreShell>
    );
  if (!p)
    return (
      <StoreShell>
        <div className="empty-state">
          <h1>
            {shop.error
              ? "Unable to load this product."
              : "This good thing is unavailable."}
          </h1>
          <Link href="/products" className="button primary">
            Explore the collection
          </Link>
        </div>
      </StoreShell>
    );
  return (
    <StoreShell>
      <div className="page-width detail-page">
        <Link href="/products" className="arrow-link back">
          <ArrowLeft size={15} /> Back to the good stuff
        </Link>
        <div className="detail-grid">
          <div>
            <div className="detail-image">
              <img
                src={image || p.image || "/images/studio-headphones.webp"}
                alt={p.name}
              />
              <span className="product-label">THE EVERYDAY EDIT</span>
            </div>
            {p.images?.length > 1 && (
              <div className="image-thumbnails">
                {p.images.map((i) => (
                  <button
                    key={i.path}
                    onClick={() => setImage(i.path)}
                    aria-label={`View ${i.alt}`}
                  >
                    <img src={i.path} alt={i.alt} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="detail-copy">
            <div className="eyebrow">{p.category.toUpperCase()}</div>
            <h1>{p.name}</h1>
            <p className="detail-description">{p.shortDescription}</p>
            <div className="detail-price">
              <strong>{money(p.price)}</strong>
              {p.oldPrice && p.oldPrice > p.price && (
                <>
                  <del>{money(p.oldPrice)}</del>
                  <span>Save {money(p.oldPrice - p.price)}</span>
                </>
              )}
            </div>
            <div className={`stock-status ${p.stock < 1 ? "sold-out" : ""}`}>
              <i />
              {p.stock > 0
                ? p.stock <= 5
                  ? `Only ${p.stock} left — make it yours.`
                  : "In stock. Ready for your everyday."
                : "Out of stock. More good things soon."}
            </div>
            <div className="detail-buy">
              <div className="quantity">
                <button
                  disabled={qty <= 1}
                  onClick={() => setQty(qty - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span>{qty}</span>
                <button
                  disabled={qty >= Math.min(p.stock, 20)}
                  onClick={() => setQty(qty + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                className="button primary"
                disabled={p.stock < 1}
                onClick={() => {
                  shop.add(p, qty);
                  shop.setBagOpen(true);
                }}
              >
                Add to your bag <Plus size={18} />
              </button>
              <button
                className="detail-save icon-btn"
                aria-label="Save product"
                aria-pressed={shop.saved.includes(p.id)}
                onClick={() => shop.toggleSave(p.id)}
              >
                <Heart
                  size={20}
                  fill={shop.saved.includes(p.id) ? "currentColor" : "none"}
                />
              </button>
            </div>
            <div className="detail-promises">
              <div>
                <Truck size={18} />
                <span>
                  Nationwide delivery. Free over{" "}
                  {money(shop.settings.freeDeliveryPaisa / 100)}.
                </span>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Cash on delivery. Clear prices. Easy ordering.</span>
              </div>
              <div>
                <MessageCircle size={18} />
                <a href={whatsapp(shop.settings.whatsappNumber)}>
                  A question before you choose? Talk to us ↗
                </a>
              </div>
            </div>
            <details open>
              <summary>The good details</summary>
              <p>{p.description}</p>
              <small>
                AI-generated product visuals are illustrative. Confirm exact
                appearance and specifications with our team before ordering.
              </small>
            </details>
            {p.specifications?.length > 0 && (
              <details>
                <summary>A closer look at the specs</summary>
                <dl>
                  {p.specifications.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            {p.warranty && (
              <details>
                <summary>Warranty & care</summary>
                <p>{p.warranty}</p>
              </details>
            )}
          </div>
        </div>
        <div className="related-section">
          <div className="section-top">
            <h2>
              A few more
              <br />
              <span>good companions.</span>
            </h2>
            <Link href="/products" className="arrow-link">
              Explore all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {shop.products
              .filter((x) => x.id !== p.id)
              .slice(0, 4)
              .map((x) => (
                <ProductCard product={x} key={x.id} />
              ))}
          </div>
        </div>
      </div>
    </StoreShell>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <StoreShell>
          <div className="page-width detail-grid">
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        </StoreShell>
      }
    >
      <ProductDetail params={params} />
    </Suspense>
  );
}
