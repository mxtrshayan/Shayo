"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

const initial = { storeName: "", tagline: "", whatsappNumber: "", easypaisaTitle: "", easypaisaNumber: "", jazzcashTitle: "", jazzcashNumber: "", deliveryFeePaisa: 0, freeDeliveryPaisa: 0, lowStockThreshold: 0 };
export default function AdminSettings() {
  const [form, setForm] = useState(initial); const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/admin/settings").then((response) => response.json()).then((data) => { if (data.settings) setForm(data.settings); }); }, []);
  function change(key: string, value: string) { setForm((current) => ({ ...current, [key]: ["deliveryFeePaisa","freeDeliveryPaisa","lowStockThreshold"].includes(key) ? Number(value) : value })); }
  async function submit(event: FormEvent) { event.preventDefault(); const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); setMessage(response.ok ? "Settings saved." : (await response.json()).error); }
  return <main className="admin-shell"><header className="admin-header"><Link className="logo" href="/admin">SHAYO<span>.</span></Link><nav className="admin-nav"><Link href="/admin/products">Products</Link><Link href="/admin/orders">Orders</Link><Link href="/admin/settings">Settings</Link></nav><form action="/api/admin/logout" method="post"><button className="admin-link">Log out</button></form></header><section className="admin-content"><Link className="admin-back" href="/admin">← Dashboard</Link><div className="admin-eyebrow">Configuration</div><h1>Store settings.</h1><p className="admin-muted">Control customer-facing store details, payment numbers, and delivery rules.</p><form className="admin-form admin-panel" onSubmit={submit}><div className="admin-form-grid">{Object.keys(initial).map((key) => <label key={key}>{key.replace(/([A-Z])/g, " $1")}<input value={String(form[key as keyof typeof form] ?? "")} onChange={(event) => change(key, event.target.value)} required={!key.includes("jazzcash")} /></label>)}</div>{message && <p className="admin-message">{message}</p>}<button className="primary-button">Save settings</button></form></section></main>;
}
