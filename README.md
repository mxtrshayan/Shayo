# SHAYO

Premium everyday tech storefront for Pakistan, built with Next.js 16, React 19, Prisma 7, and SQLite.

## What works

- Responsive premium storefront with original synthetic product images, floating/perspective animations, scroll reveals, local fonts, and reduced-motion support.
- Database-backed collection with search, category filters, sorting, product details, and persistent saved picks.
- Persistent shopping bag with quantities, live pricing/stock, and delivery calculation.
- Guest checkout with COD and configured manual Easypaisa/JazzCash transfers.
- Server-calculated totals, stock reservations, idempotent retries, and order confirmation.
- Private order tracking using order number and checkout mobile number.
- Authenticated admin dashboard, full product editing/archiving and image uploads, inventory, order/payment management, and delivery/payment settings.
- WhatsApp support, delivery/returns/privacy information, and SHAYO / ShyonLabs story.

## Run locally

```bash
npm ci
cp .env.example .env # only for a fresh checkout; preserve your existing .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. Admin: http://localhost:3000/admin.

The seed script adds/updates six development products and their generated imagery. It preserves existing product prices, stock, publication state, orders, and settings. It updates the sample descriptions and primary image paths.

## Administrator access

Existing administrators are preserved. To create an administrator or intentionally reset one account's password:

```bash
npm run admin:create
```

The command asks for an email and password and stores a bcrypt hash. Optional ADMIN_EMAIL and ADMIN_PASSWORD environment variables can supply those inputs. Never commit credentials. Set SESSION_SECRET to at least 32 random characters before production use (`openssl rand -hex 32`). Production sessions require HTTPS.

## Store operations

In admin, configure delivery fees and free-delivery threshold in PKR, support contact, and wallet account details. Add/edit products with accurate descriptions, prices, images, and inventory. Archiving hides a product while preserving its order history. Cancelling an order restores stock once; cancelled orders cannot be reopened. Wallet payments require manual verification and do not charge a customer automatically.

The seeded catalogue and AI-generated visuals are development examples. Confirm physical stock, specifications, pricing, warranty, delivery promises, and return terms before accepting public orders. The site labels generated visuals as illustrative.

## Validation

```bash
npx tsc --noEmit
npm run build
```

Commerce and admin API integration checks use disposable records/database copies. Desktop and mobile Chrome checks cover catalogue, bag, checkout, product details, tracking, and admin entry. See [implementation review](docs/implementation-review.md) for findings and scope.

## Hosting

The site currently runs locally. Deploy to a Node.js host with persistent SQLite storage (or migrate to a production database), persistent product upload storage, HTTPS, and a secure SESSION_SECRET. Payment gateway charges, courier booking, email/SMS notifications, and public hosting are not configured.

## Reinstall dependencies and free disk space

This is a Node.js project. `package.json` lists its direct dependencies and
`package-lock.json` pins the exact dependency tree, so use those files instead
of a Python `requirements.txt`:

```bash
npm ci
```

`npm ci` recreates `node_modules` from the lockfile. To remove installed
dependencies and the regenerable Next.js build cache when you need disk space,
stop the development server first, then run:

```bash
rm -rf node_modules .next
```

Run `npm ci` and the local setup commands above to restore the project. You can
also clear npm's download cache with `npm cache clean --force`; npm can download
those packages again during installation.

Keep `package.json`, `package-lock.json`, `.env` (or a securely stored copy of
its settings), and `dev.db` if you want to preserve local configuration and
data. Deleting `dev.db` removes the local SQLite database and its records.
