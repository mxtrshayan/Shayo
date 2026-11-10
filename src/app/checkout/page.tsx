"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  Minus,
  Plus,
  Truck,
  ShoppingBag,
  PackageCheck,
} from "lucide-react";
import { StoreShell } from "@/components/store-shell";
import { useShop } from "@/components/shop-provider";
import { money, whatsapp } from "@/lib/shop";
export default function Checkout() {
  const shop = useShop(),
    [method, setMethod] = useState("COD"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState<{
      orderNumber: string;
      totalPaisa: number;
    } | null>(null),
    [phone, setPhone] = useState("");
  const key = useRef("");
  const items = shop.lines.map((x) => ({
      ...x,
      p: shop.products.find((p) => p.id === x.productId),
    })),
    subtotal = items.reduce((s, x) => s + (x.p?.price ?? 0) * x.quantity, 0),
    delivery =
      subtotal >= shop.settings.freeDeliveryPaisa / 100
        ? 0
        : shop.settings.deliveryFeePaisa / 100;
  const invalid = items.some((x) => !x.p || x.p.stock < x.quantity);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    if (!key.current) key.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: shop.lines,
          customerName: f.get("customerName"),
          phone,
          city: f.get("city"),
          address: f.get("address"),
          instructions: f.get("instructions"),
          paymentMethod: method,
          transactionRef: f.get("transactionRef") || undefined,
          idempotencyKey: key.current,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(
          data.error || "We couldn’t place your order. Please try again.",
        );
      setSuccess(data);
      shop.clear();
      await shop.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <StoreShell>
        <section className="success-page page-width">
          <span className="success-icon">
            <Check size={32} />
          </span>
          <div className="eyebrow">A GOOD THING IS ON ITS WAY.</div>
          <h1>
            You’re all set<span>.</span>
          </h1>
          <p>
            Thanks for choosing SHAYO. We’ll contact you to confirm your order
            and delivery details.
          </p>
          <div className="confirmation-card">
            <span>Your order number</span>
            <strong>{success.orderNumber}</strong>
            <p>
              Total <b>{money(success.totalPaisa / 100)}</b>
            </p>
            <small>
              Keep your order number and use your checkout mobile number to
              track progress.
            </small>
          </div>
          <div className="success-actions">
            <Link href="/track" className="button primary">
              Track your order <ArrowRight size={17} />
            </Link>
            <Link href="/products" className="button outline">
              Keep exploring
            </Link>
          </div>
          <a
            href={whatsapp(shop.settings.whatsappNumber)}
            className="arrow-link"
          >
            Need anything? We’re here to help ↗
          </a>
        </section>
      </StoreShell>
    );
  return (
    <StoreShell>
      <section className="checkout-page page-width">
        <Link href="/products" className="arrow-link back">
          <ArrowLeft size={15} /> Continue shopping
        </Link>
        <div className="eyebrow">A FEW DETAILS. THEN YOU’RE GOOD TO GO.</div>
        <h1>
          Your next
          <br />
          <span>good day starts here.</span>
        </h1>
        {shop.loading ? (
          <div className="skeleton" />
        ) : shop.lines.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={38} />
            <h2>Your bag is waiting.</h2>
            <p>Add an everyday upgrade to get started.</p>
            <Link className="button primary" href="/products">
              Find your next favourite <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form className="checkout-grid" onSubmit={submit}>
            <div className="checkout-form">
              <div className="checkout-section">
                <h2>
                  <span>01</span> Where should the good stuff go?
                </h2>
                <p>No account needed. Just the essentials.</p>
                <div className="form-grid">
                  <label>
                    Full name
                    <input
                      name="customerName"
                      autoComplete="name"
                      minLength={2}
                      maxLength={100}
                      placeholder="Your full name"
                      required
                    />
                  </label>
                  <label>
                    Mobile number
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      pattern="03[0-9]{9}"
                      maxLength={11}
                      placeholder="03XXXXXXXXX"
                      title="11-digit Pakistani mobile number, starting with 03"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                    <small>For order confirmation and tracking</small>
                  </label>
                  <label className="span-2">
                    City
                    <input
                      name="city"
                      autoComplete="address-level2"
                      placeholder="e.g. Karachi"
                      minLength={2}
                      maxLength={80}
                      required
                    />
                  </label>
                  <label className="span-2">
                    Delivery address
                    <textarea
                      name="address"
                      autoComplete="street-address"
                      placeholder="House / flat, street, area and nearby landmark"
                      minLength={8}
                      maxLength={300}
                      rows={3}
                      required
                    />
                  </label>
                  <label className="span-2">
                    Anything we should know? <span>(optional)</span>
                    <textarea
                      name="instructions"
                      maxLength={300}
                      placeholder="Delivery instructions or a note for our team"
                      rows={2}
                    />
                  </label>
                </div>
              </div>
              <div className="checkout-section">
                <h2>
                  <span>02</span> Pay your way.
                </h2>
                <p>Choose what’s easiest for you.</p>
                <div className="payment-methods">
                  {[
                    [
                      "COD",
                      "Cash on delivery",
                      "Pay the courier when it arrives.",
                    ],
                    ...(shop.settings.easypaisaNumber &&
                    shop.settings.easypaisaTitle
                      ? [
                          [
                            "EASYPAISA",
                            "Easypaisa",
                            "Transfer first. We verify it manually.",
                          ],
                        ]
                      : []),
                    ...(shop.settings.jazzcashNumber &&
                    shop.settings.jazzcashTitle
                      ? [
                          [
                            "JAZZCASH",
                            "JazzCash",
                            "Transfer first. We verify it manually.",
                          ],
                        ]
                      : []),
                  ].map(([value, label, desc]) => (
                    <label
                      className={
                        method === value
                          ? "payment-option chosen"
                          : "payment-option"
                      }
                      key={value}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={method === value}
                        onChange={() => setMethod(value)}
                      />
                      <span>
                        <b>{label}</b>
                        <small>{desc}</small>
                      </span>
                      {method === value && <Check size={17} />}
                    </label>
                  ))}
                </div>
                {method !== "COD" && (
                  <div className="wallet-instructions">
                    <b>
                      Transfer the full order total:{" "}
                      {money(subtotal + delivery)}
                    </b>
                    <p>
                      {method === "EASYPAISA"
                        ? shop.settings.easypaisaTitle
                        : shop.settings.jazzcashTitle}
                      <br />
                      {method === "EASYPAISA"
                        ? shop.settings.easypaisaNumber
                        : shop.settings.jazzcashNumber}
                    </p>
                    <p>
                      Complete the transfer in your wallet app, then enter its
                      reference below. Your payment stays pending until our team
                      verifies it.
                    </p>
                    <label>
                      Transfer reference
                      <input
                        name="transactionRef"
                        required
                        minLength={4}
                        maxLength={100}
                        placeholder="Enter your transaction ID"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <aside className="order-summary">
              <h2>Excellent choices.</h2>
              <div>
                {items.map((x) => (
                  <div className="summary-item" key={x.productId}>
                    <img
                      src={x.p?.image || "/images/studio-headphones.webp"}
                      alt={x.p?.name || "Unavailable product"}
                    />
                    <div>
                      <small>{x.p?.category}</small>
                      <h3>{x.p?.name || "Product unavailable"}</h3>
                      <b>{money(x.p?.price ?? 0)}</b>
                      <div className="quantity">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={busy}
                          onClick={() => {
                            key.current = "";
                            shop.quantity(x.productId, x.quantity - 1);
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span>{x.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={
                            busy || x.quantity >= Math.min(x.p?.stock ?? 0, 20)
                          }
                          onClick={() => {
                            key.current = "";
                            shop.quantity(x.productId, x.quantity + 1);
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <p>
                  <span>Subtotal</span>
                  <b>{money(subtotal)}</b>
                </p>
                <p>
                  <span>Delivery</span>
                  <b>{delivery ? money(delivery) : "On us"}</b>
                </p>
                <p className="grand-total">
                  <span>
                    Total <small>PKR</small>
                  </span>
                  <b>{money(subtotal + delivery)}</b>
                </p>
              </div>
              {invalid && (
                <p className="form-error" role="alert">
                  An item is unavailable or its quantity exceeds current stock.
                  Reduce its quantity or remove it before ordering.
                </p>
              )}
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy || invalid || !!shop.error}
                className="button primary full"
              >
                {busy
                  ? "Placing your order…"
                  : `Place order · ${money(subtotal + delivery)}`}{" "}
                {!busy && <ArrowRight size={17} />}
              </button>
              <p className="checkout-fineprint">
                <LockKeyhole size={13} /> Your details stay private. No account
                required.
              </p>
              <p className="checkout-agreement">
                By ordering, you agree to our{" "}
                <Link href="/help">delivery and returns information</Link>.
              </p>
              <div className="checkout-support">
                <PackageCheck size={18} />
                <p>
                  Real people, every step of the way.
                  <br />
                  <a href={whatsapp(shop.settings.whatsappNumber)}>
                    Ask us anything on WhatsApp ↗
                  </a>
                </p>
              </div>
            </aside>
          </form>
        )}
      </section>
    </StoreShell>
  );
}
