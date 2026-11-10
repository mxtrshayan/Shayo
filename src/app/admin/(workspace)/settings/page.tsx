"use client";
import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import s from "../../admin.module.css";
const initial = {
  storeName: "",
  tagline: "",
  whatsappNumber: "",
  easypaisaTitle: "",
  easypaisaNumber: "",
  jazzcashTitle: "",
  jazzcashNumber: "",
  deliveryFee: "250",
  freeDelivery: "5000",
  lowStockThreshold: "5",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};
type Field = {
  key: keyof typeof initial;
  label: string;
  hint?: string;
  type?: string;
};
const groups: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "The basics",
    description: "The details that make this store yours.",
    fields: [
      { key: "storeName", label: "Store name" },
      { key: "tagline", label: "Tagline" },
      {
        key: "whatsappNumber",
        label: "WhatsApp number",
        hint: "Use international format, e.g. 923162609779.",
      },
    ],
  },
  {
    title: "Delivery & inventory",
    description: "All amounts below are in Pakistani rupees (PKR).",
    fields: [
      {
        key: "deliveryFee",
        label: "Standard delivery fee (PKR)",
        type: "number",
      },
      {
        key: "freeDelivery",
        label: "Free delivery on orders from (PKR)",
        type: "number",
      },
      {
        key: "lowStockThreshold",
        label: "Default low-stock threshold",
        type: "number",
      },
    ],
  },
  {
    title: "Payment accounts",
    description:
      "Customers see these details when choosing a manual bank-wallet transfer. Leave both JazzCash fields empty to disable it.",
    fields: [
      { key: "easypaisaTitle", label: "Easypaisa account title" },
      { key: "easypaisaNumber", label: "Easypaisa account number" },
      { key: "jazzcashTitle", label: "JazzCash account title (optional)" },
      { key: "jazzcashNumber", label: "JazzCash account number (optional)" },
    ],
  },
  {
    title: "Find you elsewhere",
    description: "Optional HTTPS links to your social accounts.",
    fields: [
      { key: "instagramUrl", label: "Instagram", type: "url" },
      { key: "facebookUrl", label: "Facebook", type: "url" },
      { key: "linkedinUrl", label: "LinkedIn", type: "url" },
    ],
  },
];
export default function Settings() {
  const [form, setForm] = useState(initial),
    [message, setMessage] = useState(""),
    [error, setError] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        const settings = data.settings;
        setForm({
          ...initial,
          ...Object.fromEntries(
            Object.keys(initial).map((key) => [
              key,
              settings[key] ?? initial[key as keyof typeof initial],
            ]),
          ),
          deliveryFee: String(settings.deliveryFeePaisa / 100),
          freeDelivery: String(settings.freeDeliveryPaisa / 100),
          lowStockThreshold: String(settings.lowStockThreshold),
        });
      })
      .catch(() => {
        setMessage("Unable to load settings. Refresh before editing.");
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryFeePaisa: Math.round(Number(form.deliveryFee) * 100),
          freeDeliveryPaisa: Math.round(Number(form.freeDelivery) * 100),
          lowStockThreshold: Number(form.lowStockThreshold),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage("Settings saved. Your changes are live in the store.");
      setError(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save settings.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className={s.titleRow}>
        <div>
          <div className={s.eyebrow}>The finer details</div>
          <h1>A store that works your way.</h1>
          <p className={s.muted}>
            Keep your contact details, delivery rules and payments in sync.
          </p>
        </div>
      </div>
      {message && (
        <p role="status" className={s.message} data-error={error}>
          {message}
        </p>
      )}
      {loading ? (
        <div className={s.loading}>Loading store settings…</div>
      ) : (
        <form onSubmit={save}>
          {groups.map((group) => (
            <section className={s.panel} key={group.title}>
              <h2>{group.title}</h2>
              <p className={s.muted} style={{ fontSize: 12, marginBottom: 24 }}>
                {group.description}
              </p>
              <div className={s.grid}>
                {group.fields.map((field) => (
                  <label key={field.key} className={s.field}>
                    {field.label}
                    <input
                      type={field.type ?? "text"}
                      min="0"
                      step={field.key === "lowStockThreshold" ? "1" : "0.01"}
                      required={
                        !field.label.includes("optional") &&
                        !field.type?.includes("url")
                      }
                      value={form[field.key]}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                    {field.hint && (
                      <small className={s.note} style={{ margin: 0 }}>
                        {field.hint}
                      </small>
                    )}
                  </label>
                ))}
              </div>
            </section>
          ))}
          <button className={s.button} disabled={busy}>
            <Save size={15} />
            {busy ? "Saving…" : "Save store settings"}
          </button>
          <p className={s.note}>
            Product-specific low-stock alerts can be adjusted in the product
            editor.
          </p>
        </form>
      )}
    </>
  );
}
