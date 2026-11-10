export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  image: string | null;
  badge?: string;
  shortDescription: string;
  description: string;
  warranty?: string;
  images: { path: string; alt: string }[];
  specifications: { label: string; value: string }[];
};
export type StoreSettings = {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  deliveryFeePaisa: number;
  freeDeliveryPaisa: number;
  easypaisaTitle?: string;
  easypaisaNumber?: string;
  jazzcashTitle?: string;
  jazzcashNumber?: string;
};
export const defaultSettings: StoreSettings = {
  storeName: "SHAYO",
  tagline: "Your everyday tech, delivered.",
  whatsappNumber: "03162609779",
  deliveryFeePaisa: 25000,
  freeDeliveryPaisa: 500000,
};
export const money = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;
export function whatsapp(number: string) {
  return "https://wa.me/" + number.replace(/\D/g, "").replace(/^0/, "92");
}
