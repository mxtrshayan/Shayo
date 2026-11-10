import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ShopProvider } from "@/components/shop-provider";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SHAYO — Your everyday tech, delivered.",
  description:
    "Thoughtfully chosen tech gadgets and accessories, delivered across Pakistan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ShopProvider>{children}</ShopProvider>
      </body>
    </html>
  );
}
