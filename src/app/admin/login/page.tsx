"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowUpRight, LockKeyhole } from "lucide-react";
import s from "../admin.module.css";
export default function AdminLogin() {
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [show, setShow] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      window.location.assign("/admin");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Connection failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className={s.login}>
      <section className={s.loginStory}>
        <Link href="/" className={s.brand}>
          SHAYO<span>.</span>
        </Link>
        <div>
          <div className={s.eyebrow} style={{ color: "#99998e" }}>
            Behind the good tech
          </div>
          <h2>
            Your store.
            <br />
            Your next
            <br />
            <span>big thing.</span>
          </h2>
          <p>
            A considered space to manage the products, people and little details
            behind every great order.
          </p>
        </div>
        <span style={{ fontSize: 11, color: "#99998e" }}>
          SHAYO — Everyday tech, thoughtfully chosen.
        </span>
      </section>
      <section className={s.loginMain}>
        <div className={s.loginCard}>
          <Link href="/" className={`${s.brand} ${s.mobileBrand}`}>
            SHAYO<span>.</span>
          </Link>
          <div className={s.eyebrow}>
            <LockKeyhole
              size={13}
              style={{ display: "inline", marginRight: 7 }}
            />
            Private workspace
          </div>
          <h1>Welcome back.</h1>
          <p className={s.muted}>
            A good day for good business.
            <br />
            Sign in to your store workspace.
          </p>
          <form onSubmit={submit}>
            <label className={s.field}>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                required
                maxLength={200}
              />
            </label>
            <label className={s.field}>
              Password
              <div className={s.passwordField}>
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={200}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {error && (
              <p
                className={s.message}
                data-error
                role="alert"
                style={{ margin: 0 }}
              >
                {error}
              </p>
            )}
            <button className={s.button} disabled={loading}>
              {loading ? "Signing you in…" : "Sign in to workspace"}
              <ArrowUpRight size={17} />
            </button>
          </form>
          <Link href="/" className={s.back}>
            ← Back to the storefront
          </Link>
          <p className={s.note} style={{ marginTop: 35 }}>
            Administrator access only. Contact the store owner if you need an
            account.
          </p>
        </div>
      </section>
    </main>
  );
}
