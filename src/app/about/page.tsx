"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StoreShell } from "@/components/store-shell";
export default function About() {
  return (
    <StoreShell>
      <section className="about-intro page-width">
        <div className="eyebrow">HELLO. WE’RE SHAYO.</div>
        <h1>
          A little better.
          <br />
          <span>Every single day.</span>
        </h1>
        <div className="about-grid">
          <p>
            We believe good tech should fit into your life beautifully. It
            should be useful, feel good to use, and make sense for your budget.
          </p>
          <p>
            So we’re building a different kind of everyday tech store. A focused
            collection. Fair prices. Clear information. And real people to help
            you choose.
          </p>
        </div>
        <img
          className="about-image"
          src="/images/studio-headphones.webp"
          alt="Thoughtfully designed ivory headphones, a SHAYO everyday essential"
        />
      </section>
      <section className="about-values page-width">
        <div className="section-top">
          <h2>
            Our kind
            <br />
            <span>of good.</span>
          </h2>
          <p>
            Rooted in Pakistan.
            <br />
            Made for the way you live.
          </p>
        </div>
        <div className="values-grid">
          {[
            [
              "01",
              "Useful beats complicated.",
              "Tech should make the day easier. We focus on essentials you can reach for at home, at work, and everywhere in between.",
            ],
            [
              "02",
              "Clear from the start.",
              "See your prices, stock, payment choices, and delivery cost before ordering. Choose what works for you.",
            ],
            [
              "03",
              "People behind the screen.",
              "From choosing a product to checking an order, a conversation with our team is only a WhatsApp message away.",
            ],
          ].map(([n, t, p]) => (
            <div key={n}>
              <small>{n} / THE SHAYO WAY</small>
              <h3>{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="about-family page-width">
        <span className="brand-asterisk">✳</span>
        <div>
          <div className="eyebrow">A SHARED CREATIVE SPIRIT</div>
          <h2>
            Good ideas.
            <br />
            Real-world impact.
          </h2>
          <p>
            SHAYO is a sister company of ShyonLabs, the AI-powered software and
            digital products studio. We share a belief that thoughtful
            technology can make everyday life better.
          </p>
          <a
            href="https://www.shyonlabs.tech/"
            target="_blank"
            rel="noreferrer"
            className="arrow-link"
          >
            Meet ShyonLabs <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <div className="closing-line page-width">
        <span>YOUR EVERYDAY, UPGRADED.</span>
        <Link href="/products">
          Find your good thing <ArrowUpRight size={18} />
        </Link>
      </div>
    </StoreShell>
  );
}
