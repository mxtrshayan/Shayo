"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Product = { id: string; name: string; sku: string; category: { name: string }; pricePaisa: number; stockQuantity: number; published: boolean; featured: boolean; images: { path: string }[] };
const empty = { name: "", category: "", sku: "", price: "", originalPrice: "", stockQuantity: "0", shortDescription: "", description: "", warranty: "", imageUrl: "", featured: false, published: true };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  async function load() { const response = await fetch("/api/admin/products"); if (response.ok) setProducts((await response.json()).products); }
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);
  function change(key: string, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage("");
    const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editing, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined, stockQuantity: Number(form.stockQuantity) }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "Unable to save product."); return; }
    setForm(empty); setEditing(undefined); setMessage("Product saved."); void load();
  }
  async function remove(id: string) { if (!window.confirm("Delete this product?")) return; const response = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" }); setMessage(response.ok ? "Product deleted." : (await response.json()).error); void load(); }
  function edit(product: Product) { setEditing(product.id); setForm({ ...empty, name: product.name, category: product.category.name, sku: product.sku, price: String(product.pricePaisa / 100), stockQuantity: String(product.stockQuantity), imageUrl: product.images[0]?.path ?? "", featured: product.featured, published: product.published }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  return <main className="admin-shell"><header className="admin-header"><Link className="logo" href="/admin">SHAYO<span>.</span></Link><nav className="admin-nav"><Link href="/admin/products">Products</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/settings">Settings</Link></nav><form action="/api/admin/logout" method="post"><button className="admin-link">Log out</button></form></header><section className="admin-content"><Link className="admin-back" href="/admin">← Dashboard</Link><div className="admin-eyebrow">Catalogue</div><h1>Manage products.</h1><p className="admin-muted">Add products with a public image URL, set inventory, and control visibility.</p><form className="admin-form admin-panel" onSubmit={submit}><h2>{editing ? "Edit product" : "Add product"}</h2><div className="admin-form-grid">{(["name","category","sku","price","originalPrice","stockQuantity","imageUrl","warranty"] as const).map((key) => <label key={key}>{key === "imageUrl" ? "Image URL" : key.replace(/([A-Z])/g, " $1")}<input value={form[key]} onChange={(event) => change(key, event.target.value)} required={["name","category","sku","price","stockQuantity"].includes(key)} /></label>)}<label className="wide">Short description<input value={form.shortDescription} onChange={(event) => change("shortDescription", event.target.value)} required /></label><label className="wide">Description<textarea value={form.description} onChange={(event) => change("description", event.target.value)} required /></label></div><div className="admin-checks"><label><input type="checkbox" checked={form.featured} onChange={(event) => change("featured", event.target.checked)} /> Featured</label><label><input type="checkbox" checked={form.published} onChange={(event) => change("published", event.target.checked)} /> Published</label></div>{message && <p className="admin-message">{message}</p>}<button className="primary-button">{editing ? "Update product" : "Create product"}</button>{editing && <button type="button" className="admin-secondary" onClick={() => { setEditing(undefined); setForm(empty); }}>Cancel edit</button>}</form><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.name}<small>{product.category.name}</small></td><td>{product.sku}</td><td>PKR {(product.pricePaisa / 100).toLocaleString()}</td><td>{product.stockQuantity}</td><td>{product.published ? "Published" : "Hidden"}</td><td><button className="table-action" onClick={() => edit(product)}>Edit</button><button className="table-action danger" onClick={() => remove(product.id)}>Delete</button></td></tr>)}</tbody></table></div></section></main>;
}
