# SHAYO

Premium Pakistani tech-gadget storefront for SHAYO — **Your everyday tech, delivered.**

## Current implementation

- Responsive storefront with a light-first theme and dark-mode toggle.
- Dedicated About page explaining that SHAYO is a sister company of [ShyonLabs](https://www.shyonlabs.tech/), an AI-powered software and digital products studio.
- Search and category filtering across the product collection.
- Product cards with real product imagery, pricing, badges, and add-to-bag interactions.
- Cart drawer with delivery threshold calculation and checkout handoff.
- WhatsApp support link using `923162609779`.
- Prisma 7 + SQLite schema and migration for products, orders, payments, inventory, settings, and admin audit data.
- Seeded development catalogue served by `/api/products`.
- Guest order endpoint at `/api/orders` with server-side totals, stock checks, idempotency keys, and separate payment/order statuses.
- Secure admin login at `/admin/login` with bcrypt password hashes and signed HttpOnly sessions.
- Database-backed admin overview at `/admin`.
- Deployment-safe environment variable template.

## Run locally

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Create the first administrator

Set a strong local session secret in `.env`, then run:

```bash
npm run admin:create
```

The command prompts for the email and password and stores only a bcrypt hash. Open `/admin/login` to sign in.

## Production data and security setup

The local product API, SQLite schema, order endpoint, inventory deduction, and admin authentication are implemented. The current visual storefront still contains presentation seed data for its premium hero/product-card treatment; the next UI wiring step is to hydrate those cards from `/api/products` and add the checkout form that posts to `/api/orders`.

The next production setup steps are:

1. Add the admin product/order/settings screens and protect their mutations with `getAdminId()`.
2. Add the checkout and order-tracking pages.
3. Add local admin image upload validation under `public/uploads/products/`.
4. For deployment, replace SQLite with PostgreSQL and local uploads with persistent object storage.
5. Add HTTPS and set all values in `.env`.

No production credentials or JazzCash account details are included.

## Validation

```bash
npm run lint
npm run build
```

The project currently has no automated test suite yet. `npm run lint` completes with only the two existing remote-image optimization warnings, and `npm run build` passes.
