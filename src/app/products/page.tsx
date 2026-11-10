"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { StoreShell } from "@/components/store-shell";
import { ProductCard } from "@/components/product-card";
import { useShop } from "@/components/shop-provider";
function Collection() {
  const params = useSearchParams(),
    shop = useShop();
  const [category, setCategory] = useState(params.get("category") || "All"),
    [query, setQuery] = useState(""),
    [sort, setSort] = useState("featured");
  const onlySaved = params.get("saved") === "1";
  const categories = ["All", ...new Set(shop.products.map((p) => p.category))];
  const products = shop.products
    .filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!onlySaved || shop.saved.includes(p.id)) &&
        `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : 0,
    );
  return (
    <StoreShell>
      <section className="collection-hero page-width">
        <div className="eyebrow">THE SHAYO COLLECTION</div>
        <h1>
          {onlySaved ? "Your saved" : "Find your"}
          <br />
          <span>{onlySaved ? "good things." : "everyday upgrade."}</span>
        </h1>
        <p>
          Good design. Useful details. Prices that make sense.
          <br />A thoughtfully chosen collection, made for your real life.
        </p>
        <span className="collection-asterisk">✳</span>
      </section>
      <section className="catalog page-width">
        <div className="catalog-toolbar">
          <label className="catalog-search">
            <Search size={18} />
            <input
              autoFocus={params.get("search") === "1"}
              placeholder="Find your next favourite…"
              aria-label="Search collection"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="icon-btn"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X size={15} />
              </button>
            )}
          </label>
          <label className="sort-control">
            <SlidersHorizontal size={15} />
            <span className="sr-only">Sort products</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured picks</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
        <div className="category-tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c === "All" ? "All the good stuff" : c}
            </button>
          ))}
        </div>
        <p className="result-count">
          {products.length} good {products.length === 1 ? "thing" : "things"}
          {onlySaved ? " saved for later" : ""}
        </p>
        {shop.loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((i) => (
              <div className="skeleton" key={i} />
            ))}
          </div>
        ) : shop.error ? (
          <div className="empty-state" role="alert">
            <p>{shop.error}</p>
            <button onClick={() => shop.refresh()} className="button primary">
              Try again
            </button>
          </div>
        ) : products.length ? (
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard product={p} key={p.id} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={35} />
            <h2>
              {onlySaved ? "Save something you love." : "No matches just yet."}
            </h2>
            <p>
              {onlySaved
                ? "Tap the heart on any product to keep it here."
                : "Try a different search or explore another category."}
            </p>
            <button
              className="button primary"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </StoreShell>
  );
}
function CollectionRoute() {
  const params = useSearchParams();
  return <Collection key={params.toString()} />;
}
export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="empty-state">Finding the good stuff…</div>}
    >
      <CollectionRoute />
    </Suspense>
  );
}
