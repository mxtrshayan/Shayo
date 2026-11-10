"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Package, Check, Truck } from "lucide-react";
import { StoreShell } from "@/components/store-shell";
import { money } from "@/lib/shop";
type Order = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  totalPaisa: number;
  deliveryFeePaisa: number;
  items: { productName: string; quantity: number; lineTotalPaisa: number }[];
  statusHistory: { status: string; createdAt: string }[];
};
const labels: Record<string, string> = {
  PENDING_CONFIRMATION: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  PROCESSING: "Getting ready",
  SHIPPED: "On its way",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Not verified",
};
export default function Track() {
  const [order, setOrder] = useState<Order | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    const f = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: f.get("orderNumber"),
          phone: f.get("phone"),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setOrder(d.order);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <StoreShell>
      <section className="track-page page-width">
        <div className="eyebrow">GOOD THINGS ARE WORTH KEEPING TRACK OF.</div>
        <h1>
          Where’s my
          <br />
          <span>everyday upgrade?</span>
        </h1>
        <p>
          Enter your order number and the mobile number you used at checkout.
        </p>
        <form className="track-form" onSubmit={submit}>
          <label>
            Order number
            <input
              name="orderNumber"
              required
              placeholder="SHY-2026-…"
              autoCapitalize="characters"
            />
          </label>
          <label>
            Mobile number
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              pattern="03[0-9]{9}"
              required
              placeholder="03XXXXXXXXX"
            />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? "Checking…" : "Find my order"}
            <ArrowRight size={17} />
          </button>
        </form>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {order && (
          <div className="tracking-result" aria-live="polite">
            <div className="tracking-heading">
              <div>
                <small>
                  {new Date(order.createdAt).toLocaleDateString("en-PK", {
                    dateStyle: "long",
                  })}
                </small>
                <h2>{order.orderNumber}</h2>
              </div>
              <span className="tracking-badge">
                {labels[order.status] || order.status}
              </span>
            </div>
            <div className="tracking-columns">
              <div className="timeline">
                {order.statusHistory.map((h, i) => (
                  <div key={`${h.createdAt}-${i}`}>
                    <span>
                      {h.status === "DELIVERED" ? (
                        <Check size={16} />
                      ) : h.status === "SHIPPED" ? (
                        <Truck size={16} />
                      ) : (
                        <Package size={16} />
                      )}
                    </span>
                    <div>
                      <b>{labels[h.status] || h.status}</b>
                      <small>
                        {new Date(h.createdAt).toLocaleString("en-PK")}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tracking-items">
                {order.items.map((item, i) => (
                  <p key={i}>
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <b>{money(item.lineTotalPaisa / 100)}</b>
                  </p>
                ))}
                <p>
                  <span>Delivery</span>
                  <b>{money(order.deliveryFeePaisa / 100)}</b>
                </p>
                <p className="grand-total">
                  <span>Total</span>
                  <b>{money(order.totalPaisa / 100)}</b>
                </p>
                <small>
                  {order.paymentMethod === "COD"
                    ? "Cash on delivery"
                    : order.paymentMethod}{" "}
                  · Payment{" "}
                  {labels[order.paymentStatus]?.toLowerCase() ||
                    order.paymentStatus.toLowerCase()}
                </small>
              </div>
            </div>
          </div>
        )}
        <Link className="arrow-link" href="/help">
          A question about delivery? We’re here to help <ArrowRight size={15} />
        </Link>
      </section>
    </StoreShell>
  );
}
