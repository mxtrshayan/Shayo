"use client";
import Link from "next/link";
import { Heart, Plus, ArrowUpRight } from "lucide-react";
import { useShop } from "./shop-provider";
import { money, type Product } from "@/lib/shop";
export function ProductCard({
  product: p,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const shop = useShop();
  const saved = shop.saved.includes(p.id);
  return (
    <article
      className="product-card reveal"
      style={{ animationDelay: `${(index % 4) * 70}ms` }}
    >
      <div className="product-visual">
        <Link href={`/products/${p.slug}`} aria-label={`View ${p.name}`}>
          <img
            src={p.image || "/images/studio-headphones.webp"}
            alt={p.name}
            loading="lazy"
          />
        </Link>
        <span className="product-label">
          {p.stock < 1
            ? "OUT OF STOCK"
            : p.oldPrice
              ? "A GOOD FIND"
              : p.badge
                ? "THE SHAYO EDIT"
                : "EVERYDAY ESSENTIAL"}
        </span>
        <button
          className={`save-btn ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${p.name}`}
          aria-pressed={saved}
          onClick={() => shop.toggleSave(p.id)}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <Link className="quick-view" href={`/products/${p.slug}`}>
          A closer look <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="product-info">
        <small>{p.category}</small>
        <Link href={`/products/${p.slug}`}>
          <h3>{p.name}</h3>
        </Link>
        <div className="product-price">
          <strong>{money(p.price)}</strong>
          {p.oldPrice && p.oldPrice > p.price && <del>{money(p.oldPrice)}</del>}
          <button
            disabled={p.stock < 1}
            className="add-round"
            aria-label={`Add ${p.name} to bag`}
            onClick={() => shop.add(p)}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
