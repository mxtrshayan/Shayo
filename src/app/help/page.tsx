"use client";
import Link from "next/link";
import { StoreShell } from "@/components/store-shell";
import { useShop } from "@/components/shop-provider";
import { money, whatsapp } from "@/lib/shop";
export default function Help() {
  const { settings } = useShop();
  return (
    <StoreShell>
      <article className="help-page page-width">
        <div className="eyebrow">REAL PEOPLE. STRAIGHT ANSWERS.</div>
        <h1>
          Here to
          <br />
          <span>make it easier.</span>
        </h1>
        <section id="delivery">
          <h2>Delivery across Pakistan</h2>
          <p>
            Delivery costs {money(settings.deliveryFeePaisa / 100)}, with free
            delivery on orders of {money(settings.freeDeliveryPaisa / 100)} or
            more. Your final delivery fee appears at checkout before you place
            your order.
          </p>
          <p>
            Our team confirms availability and delivery timing after you order.
            Courier coverage and timing depend on your address. Contact us
            before ordering if you need delivery by a particular date.
          </p>
        </section>
        <section>
          <h2>Payments, made simple</h2>
          <p>
            Cash on delivery is available. If wallet transfers are enabled,
            checkout displays the account details and asks for your transfer
            reference. Transfers are reviewed by our team; submitting a
            reference does not automatically verify payment.
          </p>
        </section>
        <section id="returns">
          <h2>Something not quite right?</h2>
          <p>
            Contact us on WhatsApp with your order number, the issue, and photos
            if relevant. We’ll review the product condition and available remedy
            with you. Please confirm product-specific warranty, return
            eligibility, and any costs before ordering.
          </p>
          <p>
            If your parcel looks damaged, document the packaging and contact us
            promptly. For cancellation requests, message our team as soon as
            possible; dispatched orders may require courier coordination.
          </p>
        </section>
        <section id="privacy">
          <h2>Your details stay private</h2>
          <p>
            We collect the name, phone number, delivery address, order details,
            and any instructions you submit to fulfil your order and provide
            support. These are stored in the store’s database. Your shopping bag
            and saved picks are stored in your browser.
          </p>
          <p>
            Delivery information may be shared with the courier to complete your
            delivery. Order tracking requires both your order number and
            checkout phone number. Contact our team with privacy or deletion
            requests.
          </p>
        </section>
        <section>
          <h2>A note about product visuals</h2>
          <p>
            Our catalogue uses AI-generated studio imagery to present the
            collection. These visuals are illustrative. Ask our team to confirm
            the exact appearance, available variants, and specifications of an
            item before purchasing.
          </p>
        </section>
        <div className="help-contact">
          <h2>Let’s sort it out.</h2>
          <a
            href={whatsapp(settings.whatsappNumber)}
            className="button primary"
          >
            Chat on WhatsApp ↗
          </a>
          <Link href="/track" className="arrow-link">
            Track an existing order ↗
          </Link>
        </div>
      </article>
    </StoreShell>
  );
}
