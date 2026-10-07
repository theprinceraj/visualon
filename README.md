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
| Portfolio projects (title, logline, brief, idea, source renders, case study) | `src/data/work.json` |
| Hero (impossible play-triangle → screen with the reel) | `src/components/Hero.astro`, `src/scripts/hero.ts` |
| Order dialog → Dodo checkout, quote form → email, currency toggle | `src/scripts/main.ts` |
| Terms / privacy / refunds (needed for Dodo verification) | `src/pages/{terms,privacy,refunds}.astro` |

## SEO

| What | File |
|---|---|
| Titles, descriptions, Open Graph, robots meta, JSON-LD output | `src/layouts/Base.astro` |
| Brand alternate names, social profiles (`sameAs`) | `src/data/site.ts` → `site` |
| Structured data builders (organization, service + offers, video, FAQ, breadcrumbs) | `src/data/seo.ts` |
| Service landing pages (`/ai-product-videos`, `/saas-launch-videos`, `/ecommerce-product-videos`) | `src/data/services.ts`, `src/pages/[service].astro` |
| Sitemap, robots.txt | `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts` |
| `noindex` on *.pages.dev, asset caching | `public/_headers` |

Each project in `work.json` carries a `date` (published on the site) and a `duration` (seconds) per media entry for
the video structured data. Add both when adding a project (`ffprobe -v error -show_entries format=duration -of csv=p=0 full.mp4`).

Case studies: a project's optional `story` (challenge, audience, idea, `scenes`, `craft`) fills its work page. Each scene's
`t` is where it starts (scene links and `?t=` seek there; Google gets them as key moments) and `frame` is the moment
used for its still. `turnaround` adds the "from request to final cut" line. No prices in case-study copy or stills.
After changing scenes: `npm run media -- --stills` and `npm run media:upload -- --stills`.

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

Public URL: `https://media.visualon.top` (R2 custom domain; the default media base in `src/data/site.ts`, overridable
with `PUBLIC_MEDIA_BASE`). The bucket's r2.dev URL (`https://pub-8f13f60a2584475488fcd0bb210a757d.r2.dev`) still works
but is rate-limited. Adding a project: render it in the studio repo, add an entry to `work.json`,
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
https://visualon.top (and visualon.pages.dev, which sends `noindex`). Build `npm run build` → `dist`, `NODE_VERSION=22`.

| Environment | Branch | URL | `PUBLIC_DODO_MODE` (set in `wrangler.jsonc`) |
|---|---|---|---|
| Production | `main` | visualon.top | `live` |
| Dev / test | `dev` | dev.visualon.pages.dev | `test` (Pages "Preview" variables) |

Work on `dev`, test the full checkout with Dodo test payments, then merge `dev` → `main` to ship. Every other branch
also gets its own preview URL in test mode. Media defaults to R2 in all deployed builds.
Custom domains: `visualon.top` and `www.visualon.top` (Cloudflare zone; www 301s to the bare domain). Media: `media.visualon.top`.
