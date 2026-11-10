"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultSettings, type Product, type StoreSettings } from "@/lib/shop";
type Line = { productId: string; quantity: number };
type Shop = {
  products: Product[];
  settings: StoreSettings;
  loading: boolean;
  error: string;
  lines: Line[];
  saved: string[];
  add: (p: Product, qty?: number) => void;
  quantity: (id: string, qty: number) => void;
  clear: () => void;
  toggleSave: (id: string) => void;
  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
  toast: string;
  setToast: (v: string) => void;
  refresh: () => Promise<void>;
};
const Context = createContext<Shop | null>(null);
export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]),
    [settings, setSettings] = useState(defaultSettings),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [lines, setLines] = useState<Line[]>([]),
    [saved, setSaved] = useState<string[]>([]),
    [ready, setReady] = useState(false),
    [bagOpen, setBagOpen] = useState(false),
    [toast, setToast] = useState("");
  async function refresh() {
    try {
      const [a, b] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/store", { cache: "no-store" }),
      ]);
      if (!a.ok || !b.ok)
        throw Error("The store could not load. Please try again.");
      setProducts((await a.json()).products);
      setSettings((await b.json()).settings);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to connect.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
    try {
      const cart = JSON.parse(localStorage.getItem("shayo-bag-v2") || "[]");
      const wish = JSON.parse(localStorage.getItem("shayo-saved-v2") || "[]");
      if (Array.isArray(cart))
        setLines(
          cart.filter(
            (x) =>
              typeof x.productId === "string" &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0,
          ),
        );
      if (Array.isArray(wish))
        setSaved(wish.filter((x) => typeof x === "string"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      localStorage.setItem("shayo-bag-v2", JSON.stringify(lines));
      localStorage.setItem("shayo-saved-v2", JSON.stringify(saved));
    }
  }, [lines, saved, ready]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  function add(p: Product, qty = 1) {
    if (p.stock < 1) return;
    setLines((old) => {
      const n = old.find((x) => x.productId === p.id);
      return n
        ? old.map((x) =>
            x.productId === p.id
              ? { ...x, quantity: Math.min(x.quantity + qty, p.stock, 20) }
              : x,
          )
        : [...old, { productId: p.id, quantity: Math.min(qty, p.stock, 20) }];
    });
    setToast(`${p.name} added to your bag`);
  }
  return (
    <Context.Provider
      value={{
        products,
        settings,
        loading,
        error,
        lines,
        saved,
        add,
        quantity: (id, qty) =>
          setLines((old) => {
            const allowed = Math.min(
              qty,
              20,
              products.find((p) => p.id === id)?.stock ?? 20,
            );
            return allowed < 1
              ? old.filter((x) => x.productId !== id)
              : old.map((x) =>
                  x.productId === id ? { ...x, quantity: allowed } : x,
                );
          }),
        clear: () => setLines([]),
        toggleSave: (id) =>
          setSaved((old) =>
            old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
          ),
        bagOpen,
        setBagOpen,
        toast,
        setToast,
        refresh,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useShop() {
  const c = useContext(Context);
  if (!c) throw Error("ShopProvider missing");
  return c;
}
