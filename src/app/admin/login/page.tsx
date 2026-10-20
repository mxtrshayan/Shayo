"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) setError((await response.json()).error ?? "Unable to log in.");
    else router.push("/admin");
    setLoading(false);
  }
  return <main className="admin-login"><div className="admin-login-card"><Link className="logo" href="/">SHAYO<span>.</span></Link><div className="admin-eyebrow">Private workspace</div><h1>Welcome back.</h1><p className="admin-muted">Log in to manage your store.</p><form onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={loading}>{loading ? "Checking..." : "Log in"}</button></form><Link className="back-store" href="/">← Back to storefront</Link></div></main>;
}
