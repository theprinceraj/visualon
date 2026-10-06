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
npx wrangler login                 # once
npx wrangler r2 bucket create visualon-media
npx wrangler r2 bucket cors set visualon-media --file r2-cors.json   # the hero plays reel.mp4 in WebGL, so CORS is required
npm run media:upload
```

Then in the R2 bucket settings, connect a custom domain (e.g. `media.visualon.top`) or enable the `r2.dev` URL, and set
`PUBLIC_MEDIA_BASE` to it. Adding a project: render it in the studio repo, add an entry to `work.json`,
`npm run media -- --only <slug>`, `npm run media:upload -- --only <slug>`, push.

## Payments (Dodo)

1. One Dodo one-time product per package, priced in USD with a localized INR price. Its `pdt_…` ID goes in both
   `packages[].dodo.INR` and `.USD`; checkout receives `paymentCurrency` so the buyer pays in the currency they picked.
   Keep the prices in `site.ts` in sync with Dodo. Dodo adds tax on top, so the site says "+ tax".
   Test-mode and live-mode products have different IDs. When going live, recreate them in live mode and swap the IDs.
2. Until an ID is filled in, "order" falls back to a pre-filled email to the studio, so the site works before Dodo is live.
3. Checkout gets the buyer's name/email plus `metadata_package`, `metadata_product_link`, `metadata_formats`,
   `metadata_feel`, `metadata_brief`. You'll see them on each payment in the dashboard.
4. After paying, Dodo redirects to `/thanks?payment_id=…&status=…`.
5. `PUBLIC_DODO_MODE=test` uses the test checkout; switch to `live` once the account is verified.

## Deploy (Cloudflare Pages)

Pages → Create → connect this repo. Build command `npm run build`, output `dist`, Node 22+.
Environment variables: `PUBLIC_MEDIA_BASE`, `PUBLIC_DODO_MODE`, `SITE_URL`.
Custom domain: `visualon.theprinceraj.in` now (CNAME → `<project>.pages.dev`), `visualon.top` later.
