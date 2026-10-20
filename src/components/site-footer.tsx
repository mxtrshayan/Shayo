import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="logo" href="/">SHAYO<span>.</span></Link>
          <p>Your everyday tech, delivered.</p>
          <a className="whatsapp" href="https://wa.me/923162609779" target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> Chat on WhatsApp <ArrowRight size={15} />
          </a>
        </div>
        <div className="footer-column">
          <h3>Shop</h3>
          <Link href="/products">All products</Link>
          <Link href="/products">Smartwatches</Link>
          <Link href="/products">Wireless earbuds</Link>
          <Link href="/products">Chargers & cables</Link>
        </div>
        <div className="footer-column">
          <h3>Company</h3>
          <Link href="/about">About SHAYO</Link>
          <Link href="/#why-shayo">Why SHAYO</Link>
          <a href="mailto:hello@shayo.pk">Contact support</a>
          <a href="https://www.shyonlabs.tech/" target="_blank" rel="noreferrer">ShyonLabs ↗</a>
        </div>
        <div className="footer-column">
          <h3>Help & policies</h3>
          <a href="mailto:hello@shayo.pk?subject=Shipping%20question">Shipping & delivery</a>
          <a href="mailto:hello@shayo.pk?subject=Returns%20question">Returns & refunds</a>
          <a href="mailto:hello@shayo.pk?subject=Privacy%20question">Privacy</a>
          <a href="mailto:hello@shayo.pk?subject=Order%20support">Order support</a>
          <Link href="/admin/login">Admin login</Link>
        </div>
      </div>
      <div className="footer-connect">
        <span>Follow the journey</span>
        <span className="social-note">SHAYO updates coming soon</span>
        <span className="footer-payment">COD&nbsp;&nbsp;•&nbsp;&nbsp;Easypaisa&nbsp;&nbsp;•&nbsp;&nbsp;JazzCash</span>
      </div>
      <div className="footer-bottom">
        <span>© 2026 SHAYO. Made for better days.</span>
        <span>Made in Pakistan, for Pakistan.</span>
        <span>SHAYO × ShyonLabs</span>
      </div>
    </footer>
  );
}
