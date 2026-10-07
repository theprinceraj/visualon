# VisualOn — studio site

Showcase + ordering site for VisualOn: product videos made with AI, directed by taste.
Astro (static) · Three.js hero · Lenis smooth scroll · Dodo Payments checkout links · Cloudflare Pages + R2.

```
npm install
npm run dev          # http://localhost:4321
npm run build        # → dist/
npm run check        # type check
```

## Where things live

| What | File |
|---|---|
| Studio name, email, capacity | `src/data/site.ts` → `site` |
| Packages, prices (INR + USD), Dodo product IDs | `src/data/site.ts` → `packages` |
| Portfolio projects (title, logline, brief, idea, source renders) | `src/data/work.json` |
| Hero (impossible play-triangle → screen with the reel) | `src/components/Hero.astro`, `src/scripts/hero.ts` |
| Order dialog → Dodo checkout, quote form → email, currency toggle | `src/scripts/main.ts` |
| Terms / privacy / refunds (needed for Dodo verification) | `src/pages/{terms,privacy,refunds}.astro` |

## Videos (R2)

Videos are **not** in git. `public/media/` is built from the studio renders and served from R2 in production.

```
npm run media                      # renders → public/media/<slug>/<ratio>/{full,preview}.mp4, poster.jpg + reel.mp4
npx wrangler login                 # once; the bucket lives in the "Prince Raj" account:
export CLOUDFLARE_ACCOUNT_ID=5b474c59fa79834059d1e9d9f450ebf5
npx wrangler r2 bucket create visualon-media
npx wrangler r2 bucket cors set visualon-media --file r2-cors.json   # the hero plays reel.mp4 in WebGL, so CORS is required
npm run media:upload
```

Public URL (r2.dev): `https://pub-8f13f60a2584475488fcd0bb210a757d.r2.dev`, which is `PUBLIC_MEDIA_BASE`. r2.dev is
rate-limited and meant for light traffic; when visualon.top is bought, connect `media.visualon.top` to the bucket and
switch the variable. Adding a project: render it in the studio repo, add an entry to `work.json`,
`npm run media -- --only <slug>`, `npm run media:upload -- --only <slug>`, push.

## Payments (Dodo)

1. One Dodo one-time product per package, in **both** test and live mode, each with a USD price plus a localized
   (fixed) INR price, **tax-inclusive**. IDs go in `packages[].dodo.test` / `.live` in `src/data/site.ts`; keep the
   prices there in sync with Dodo. Checkout receives `paymentCurrency`, so the buyer pays in the currency they picked.
2. `PUBLIC_DODO_MODE=live` → live checkout + live IDs. Anything else (unset, `test`) → test checkout, test IDs, a yellow
   "test mode" strip and `noindex`.
3. Checkout gets the buyer's name/email plus `metadata_package`, `metadata_product_link`, `metadata_formats`,
   `metadata_feel`, `metadata_brief` (visible on each payment in the dashboard).
4. After paying, Dodo redirects to `/thanks?payment_id=…&status=…` on whichever site the order started from.

## Deploy (Cloudflare Pages)

Cloudflare Pages project `visualon` (account "Prince Raj"), Git-connected: every push to `main` deploys to
https://visualon.theprinceraj.in (and visualon.pages.dev). Build `npm run build` → `dist`, `NODE_VERSION=22`.

| Environment | Branch | URL | `PUBLIC_DODO_MODE` |
|---|---|---|---|
| Production | `main` | visualon.theprinceraj.in | `live` |
| Dev / test | `dev` | dev.visualon.pages.dev | `test` (Pages "Preview" variables) |

Work on `dev`, test the full checkout with Dodo test payments, then merge `dev` → `main` to ship. Every other branch
also gets its own preview URL in test mode. Media defaults to R2 in all deployed builds.
Custom domain: `visualon.theprinceraj.in` now (CNAME → `<project>.pages.dev`), `visualon.top` later.
