"use client";
import { useCallback, useEffect, useState } from "react";
import { Search, ShoppingBag, RefreshCw } from "lucide-react";
import s from "../../admin.module.css";
type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  instructions: string | null;
  subtotalPaisa: number;
  deliveryFeePaisa: number;
  totalPaisa: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    lineTotalPaisa: number;
  }[];
  payment: { transactionRef: string | null } | null;
  statusHistory: {
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
  }[];
};
const statuses = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];
const label = (s: string) =>
  s
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (v) => v.toUpperCase());
const money = (n: number) => `Rs. ${(n / 100).toLocaleString("en-PK")}`;
function OrderCard({
  order,
  onSave,
  busy,
}: {
  order: Order;
  onSave: (
    id: string,
    status: string,
    payment: string,
    note: string,
  ) => Promise<void>;
  busy: boolean;
}) {
  const [status, setStatus] = useState(order.status),
    [payment, setPayment] = useState(order.paymentStatus),
    [note, setNote] = useState("");
  const changed =
    status !== order.status ||
    payment !== order.paymentStatus ||
    Boolean(note.trim());
  return (
    <article className={s.panel}>
      <header className={s.orderHeader}>
        <div>
          <div className={s.actions}>
            <b style={{ fontSize: 12 }}>{order.orderNumber}</b>
            <span
              className={s.badge}
              data-warning={
                order.status === "PENDING_CONFIRMATION" ||
                order.status === "CANCELLED"
              }
            >
              {label(order.status)}
            </span>
          </div>
          <h2>{order.customerName}</h2>
          <p className={s.muted} style={{ fontSize: 12 }}>
            {new Date(order.createdAt).toLocaleString("en-PK", {
              timeZone: "Asia/Karachi",
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <strong>{money(order.totalPaisa)}</strong>
      </header>
      <div className={s.orderDetails}>
        <div>
          <div className={s.eyebrow}>Delivery details</div>
          <p>
            <a href={`tel:${order.phone}`}>{order.phone}</a> · {order.city}
          </p>
          <p className={s.muted}>{order.address}</p>
          {order.instructions && (
            <p className={s.note}>Customer note: {order.instructions}</p>
          )}
          <div className={s.orderItems}>
            {order.items.map((item) => (
              <div key={item.id}>
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <b>{money(item.lineTotalPaisa)}</b>
              </div>
            ))}
            <div>
              <span>Delivery</span>
              <b>
                {order.deliveryFeePaisa
                  ? money(order.deliveryFeePaisa)
                  : "Free"}
              </b>
            </div>
          </div>
          <p className={s.note}>
            Payment:{" "}
            {order.paymentMethod === "COD"
              ? "Cash on delivery"
              : order.paymentMethod === "EASYPAISA"
                ? "Easypaisa"
                : "JazzCash"}
            {order.payment?.transactionRef && (
              <>
                {" "}
                · Reference: <b>{order.payment.transactionRef}</b>
              </>
            )}
          </p>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              status === "CANCELLED" &&
              order.status !== "CANCELLED" &&
              !window.confirm(
                "Cancel this order and restore its inventory? This cannot be reopened.",
              )
            )
              return;
            await onSave(order.id, status, payment, note);
            setNote("");
          }}
        >
          <div className={s.orderControls}>
            <label className={s.field}>
              Fulfilment
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={
                  order.status === "CANCELLED" || order.status === "DELIVERED"
                }
              >
                {statuses.map((v) => (
                  <option key={v} value={v}>
                    {label(v)}
                  </option>
                ))}
              </select>
            </label>
            <label className={s.field}>
              Payment status
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                {["PENDING", "VERIFIED", "REJECTED"].map((v) => (
                  <option key={v} value={v}>
                    {label(v)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={s.field} style={{ marginTop: 15 }}>
            Internal status note
            <input
              maxLength={300}
              placeholder="e.g. Handed over to courier"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            disabled={busy || !changed}
            className={s.button}
            style={{ marginTop: 16 }}
          >
            {busy ? "Saving…" : "Update order"}
          </button>
          <details style={{ marginTop: 17, fontSize: 11, color: "#797970" }}>
            <summary style={{ cursor: "pointer" }}>
              Status history ({order.statusHistory.length})
            </summary>
            {order.statusHistory.map((h) => (
              <p key={h.id} className={s.note}>
                {label(h.status)} ·{" "}
                {new Date(h.createdAt).toLocaleDateString("en-PK", {
                  timeZone: "Asia/Karachi",
                })}
                <br />
                {h.note}
              </p>
            ))}
          </details>
        </form>
      </div>
    </article>
  );
}
export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOrders(data.orders);
    } catch {
      setMessage("Unable to load orders. Refresh to try again.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function save(
    orderId: string,
    status: string,
    paymentStatus: string,
    note: string,
  ) {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, paymentStatus, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage("Order updated successfully.");
      setError(false);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to update order.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  const visible = orders.filter(
    (o) =>
      `${o.orderNumber} ${o.customerName} ${o.phone} ${o.city}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "all" || o.status === filter),
  );
  return (
    <>
      <div className={s.titleRow}>
        <div>
          <div className={s.eyebrow}>From your store to their door</div>
          <h1>Every order matters.</h1>
          <p className={s.muted}>
            Review, confirm and follow through. All in one place.
          </p>
        </div>
        <button
          className={s.secondary}
          onClick={() => void load()}
          disabled={busy}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>
      {message && (
        <p role="status" className={s.message} data-error={error}>
          {message}
        </p>
      )}
      <div className={s.toolbar}>
        <Search size={18} color="#797970" />
        <input
          className={s.search}
          aria-label="Search orders"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Order number, customer or phone…"
        />
        <select
          className={s.select}
          aria-label="Filter order status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All orders ({orders.length})</option>
          {statuses.map((v) => (
            <option key={v} value={v}>
              {label(v)}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className={s.loading}>Loading orders…</div>
      ) : visible.length ? (
        visible.map((order) => (
          <OrderCard
            key={`${order.id}-${order.updatedAt ?? order.status}-${order.paymentStatus}`}
            order={order}
            busy={busy}
            onSave={save}
          />
        ))
      ) : (
        <div className={s.panel}>
          <div className={s.empty}>
            <ShoppingBag size={35} style={{ margin: "0 auto 15px" }} />
            <h2>
              {orders.length
                ? "No matching orders"
                : "Ready for your first order."}
            </h2>
            <p>
              {orders.length
                ? "Try a different search or status."
                : "New orders appear here automatically when a customer checks out."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
