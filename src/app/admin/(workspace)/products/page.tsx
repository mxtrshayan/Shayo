"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Archive,
  X,
  Upload,
} from "lucide-react";
import s from "../../admin.module.css";
type Product = {
  id: string;
  name: string;
  sku: string;
  category: { name: string };
  pricePaisa: number;
  originalPrice: number | null;
  stockQuantity: number;
  lowStockAt: number;
  published: boolean;
  featured: boolean;
  shortDescription: string;
  description: string;
  warranty: string | null;
  images: { path: string }[];
};
const empty = {
  name: "",
  category: "",
  sku: "",
  price: "",
  originalPrice: "",
  stockQuantity: "0",
  lowStockAt: "5",
  shortDescription: "",
  description: "",
  warranty: "",
  imageUrl: "",
  featured: false,
  published: true,
};
export default function Products() {
  const [products, setProducts] = useState<Product[]>([]),
    [form, setForm] = useState(empty),
    [editing, setEditing] = useState<string>(),
    [showForm, setShowForm] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [uploading, setUploading] = useState(false),
    [uploadError, setUploadError] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProducts(data.products);
    } catch {
      setMessage("Unable to load products. Refresh to try again.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  function change(key: keyof typeof empty, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function reset() {
    setUploadError("");
    setForm(empty);
    setEditing(undefined);
    setShowForm(false);
  }
  function edit(product: Product) {
    setUploadError("");
    setEditing(product.id);
    setForm({
      name: product.name,
      category: product.category.name,
      sku: product.sku,
      price: String(product.pricePaisa / 100),
      originalPrice: product.originalPrice
        ? String(product.originalPrice / 100)
        : "",
      stockQuantity: String(product.stockQuantity),
      lowStockAt: String(product.lowStockAt),
      shortDescription: product.shortDescription,
      description: product.description,
      warranty: product.warranty ?? "",
      imageUrl: product.images[0]?.path ?? "",
      featured: product.featured,
      published: product.published,
    });
    setShowForm(true);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (uploading) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editing,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
          stockQuantity: Number(form.stockQuantity),
          lowStockAt: Number(form.lowStockAt),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      reset();
      setMessage("Product saved. Your storefront is up to date.");
      setError(false);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save product.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  async function archive(product: Product) {
    if (
      !window.confirm(
        `Archive ${product.name}? It will be hidden from the store and its order history preserved.`,
      )
    )
      return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/admin/products?id=${encodeURIComponent(product.id)}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage("Product archived. You can republish it by editing.");
      setError(false);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to archive product.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  async function uploadImage(file: File) {
    setUploadError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Images must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to upload image.");
      change("imageUrl", data.path);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Upload failed. Check your connection and try again.",
      );
    } finally {
      setUploading(false);
    }
  }
  const visible = products.filter(
    (p) =>
      `${p.name} ${p.sku} ${p.category.name}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "live" && p.published) ||
        (filter === "hidden" && !p.published) ||
        (filter === "low" && p.stockQuantity <= p.lowStockAt)),
  );
  return (
    <>
      <div className={s.titleRow}>
        <div>
          <div className={s.eyebrow}>The collection</div>
          <h1>Good tech. Great presentation.</h1>
          <p className={s.muted}>
            Manage your catalogue, stock and what customers see.
          </p>
        </div>
        <button
          className={s.button}
          disabled={uploading}
          onClick={() => {
            reset();
            setShowForm(true);
          }}
        >
          <Plus size={16} />
          Add product
        </button>
      </div>
      {message && (
        <p role="status" className={s.message} data-error={error}>
          {message}
        </p>
      )}
      {showForm && (
        <form className={s.panel} onSubmit={submit}>
          <div className={s.titleRow}>
            <div>
              <h2>{editing ? "Edit product" : "A new addition"}</h2>
              <p className={s.muted}>Prices are in Pakistani rupees (PKR).</p>
            </div>
            <button
              type="button"
              className={s.secondary}
              disabled={uploading}
              onClick={reset}
              aria-label="Close product form"
            >
              <X size={16} />
            </button>
          </div>
          <div className={s.grid}>
            {(
              [
                { key: "name", label: "Product name", required: true },
                { key: "category", label: "Category", required: true },
                { key: "sku", label: "SKU", required: true },
                {
                  key: "price",
                  label: "Selling price (PKR)",
                  type: "number",
                  required: true,
                },
                {
                  key: "originalPrice",
                  label: "Compare-at price (PKR)",
                  type: "number",
                },
                {
                  key: "stockQuantity",
                  label: "Stock quantity",
                  type: "number",
                  required: true,
                },
                {
                  key: "lowStockAt",
                  label: "Low-stock alert at",
                  type: "number",
                  required: true,
                },
                { key: "warranty", label: "Warranty / returns promise" },
                { key: "imageUrl", label: "Product image URL or local path" },
              ] as const
            ).map((field) => (
              <label
                className={
                  field.key === "imageUrl" ? `${s.field} ${s.wide}` : s.field
                }
                key={field.key}
              >
                {field.label}
                <input
                  type={"type" in field ? field.type : "text"}
                  min={field.key === "price" ? "0.01" : "0"}
                  step={
                    ["price", "originalPrice"].includes(field.key)
                      ? "0.01"
                      : "1"
                  }
                  required={"required" in field && field.required}
                  value={form[field.key]}
                  onChange={(event) => change(field.key, event.target.value)}
                />
              </label>
            ))}
            <div
              className={s.wide}
              style={{
                border: "1px dashed #d9d7ce",
                borderRadius: 12,
                padding: 20,
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Product image preview"
                  style={{
                    width: 110,
                    height: 110,
                    objectFit: "contain",
                    borderRadius: 10,
                    background: "#f5f4ef",
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className={s.field}>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Upload size={16} />{" "}
                    {uploading
                      ? "Uploading and optimizing…"
                      : "Upload a product image"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploading || busy}
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) void uploadImage(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                <p className={s.note}>
                  JPG, PNG or WebP · up to 5 MB and 20 megapixels. Images are
                  optimized automatically. Save the product to apply your image.
                </p>
                {uploadError && (
                  <p
                    role="alert"
                    style={{ color: "#ae392c", fontSize: 12, marginTop: 10 }}
                  >
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
            <label className={`${s.field} ${s.wide}`}>
              Short description
              <input
                maxLength={240}
                required
                value={form.shortDescription}
                onChange={(e) => change("shortDescription", e.target.value)}
              />
            </label>
            <label className={`${s.field} ${s.wide}`}>
              Full description
              <textarea
                maxLength={5000}
                required
                value={form.description}
                onChange={(e) => change("description", e.target.value)}
              />
            </label>
          </div>
          <div className={s.checks}>
            <label>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => change("published", e.target.checked)}
              />
              Visible in store
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => change("featured", e.target.checked)}
              />
              Featured collection
            </label>
          </div>
          <div className={s.actions}>
            <button className={s.button} disabled={busy || uploading}>
              {uploading
                ? "Uploading image…"
                : busy
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Create product"}
            </button>
            <button
              className={s.secondary}
              type="button"
              disabled={uploading}
              onClick={reset}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className={s.toolbar}>
        <Search size={18} color="#797970" />
        <input
          className={s.search}
          aria-label="Search products"
          placeholder="Search by name, SKU or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={s.select}
          aria-label="Filter products"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All products ({products.length})</option>
          <option value="live">Visible in store</option>
          <option value="hidden">Hidden / archived</option>
          <option value="low">Low stock</option>
        </select>
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className={s.productCell}>
                    {p.images[0] ? (
                      <img src={p.images[0].path} alt="" className={s.thumb} />
                    ) : (
                      <div
                        className={s.thumb}
                        style={{ display: "grid", placeItems: "center" }}
                      >
                        <Package size={19} />
                      </div>
                    )}
                    <div>
                      <b>{p.name}</b>
                      <small>
                        {p.category.name} · {p.sku}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  Rs. {(p.pricePaisa / 100).toLocaleString("en-PK")}
                  {p.originalPrice && (
                    <small>
                      <s>
                        Rs. {(p.originalPrice / 100).toLocaleString("en-PK")}
                      </s>
                    </small>
                  )}
                </td>
                <td>
                  <span
                    className={s.badge}
                    data-warning={p.stockQuantity <= p.lowStockAt}
                  >
                    {p.stockQuantity === 0
                      ? "Out of stock"
                      : `${p.stockQuantity} available`}
                  </span>
                </td>
                <td>
                  {p.published ? "Live" : "Hidden"}
                  {p.featured && <small>Featured</small>}
                </td>
                <td>
                  <div className={s.actions}>
                    <button
                      className={s.secondary}
                      disabled={uploading}
                      onClick={() => edit(p)}
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    {p.published && (
                      <button
                        className={s.danger}
                        disabled={busy}
                        onClick={() => archive(p)}
                        aria-label={`Archive ${p.name}`}
                      >
                        <Archive size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <div className={s.loading}>Loading your catalogue…</div>
        ) : (
          visible.length === 0 && (
            <div className={s.empty}>
              No products match this view.
              <br />
              Add a product or try a different search.
            </div>
          )
        )}
      </div>
    </>
  );
}
