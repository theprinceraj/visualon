import work from "./work.json";

export const site = {
  name: "VisualOn",
  wordmark: "visualon",
  email: "profile.princeraj@gmail.com",
  founder: "Prince",
  since: 2026,
  tagline: "product videos, directed by taste",
  // Daily render capacity. Shown on the site, and used to size delivery windows.
  rendersPerDay: 20,
  description:
    "VisualOn makes AI product videos, SaaS and app launch films and e-commerce ads from your real product. Fixed prices, delivered in days.",
  // Other ways people spell or search the brand. Used in structured data so search engines connect them to this site.
  alternateNames: ["Visual On", "Visual On Top", "VisualOn Top", "visualon.top"],
  // Public profiles (Instagram, X, LinkedIn, YouTube...). Each one added here becomes a `sameAs` link for search engines.
  sameAs: [] as string[],
};

export type Currency = "INR" | "USD";
export type DodoMode = "test" | "live";

export type Package = {
  id: string;
  name: string;
  sub: string;
  price: Record<Currency, number>;
  delivery: string;
  includes: string[];
  formats: string[];
  recommended?: boolean;
  /**
   * Dodo Payments product IDs for test and live mode. Each product has a USD price plus a localized INR price
   * (both tax-inclusive); checkout gets `paymentCurrency` so the buyer pays the shown price. While empty,
   * "order" falls back to a pre-filled email.
   */
  dodo: Record<DodoMode, string>;
};

export const packages: Package[] = [
  {
    id: "single",
    name: "Single",
    sub: "one product video",
    price: { INR: 1199, USD: 19.99 },
    delivery: "48 hours",
    includes: ["15–25s video", "1 format", "music + sfx scored", "poster frame", "1 revision"],
    formats: ["9:16", "16:9", "1:1", "4:5"],
    dodo: { test: "pdt_0NpAtJ2l6aMzO3MFgOlQH", live: "pdt_0NpCw6aOU2aBJdF9s4Tz3" },
  },
  {
    id: "launch",
    name: "Launch kit",
    sub: "the whole launch, every feed",
    price: { INR: 2999, USD: 32.99 },
    delivery: "72 hours",
    includes: ["20–45s film", "9:16 + 1:1 + 16:9", "captions + hashtags", "poster frames", "2 revisions"],
    formats: ["9:16", "1:1", "16:9", "4:5"],
    recommended: true,
    dodo: { test: "pdt_0NpAuSxSjYx4eqtKXmu8M", live: "pdt_0NpCw6Vd7u7UmZevij3qB" },
  },
  {
    id: "hooks",
    name: "Hook pack",
    sub: "five openings, one ad",
    price: { INR: 4499, USD: 44.99 },
    delivery: "72 hours",
    includes: ["1 ad, 5 hook variants", "9:16 + 4:5", "a/b test plan", "2 revisions"],
    formats: ["9:16", "4:5", "1:1"],
    dodo: { test: "pdt_0NpAvG1pPno986EEh79OH", live: "pdt_0NpCw6fC8L5MZnSygDwSa" },
  },
];

export const symbols: Record<Currency, string> = { INR: "₹", USD: "$" };
export const formatPrice = (n: number, c: Currency) =>
  symbols[c] + n.toLocaleString(c === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 2 });

// "live" only when the build says so (Cloudflare Pages production). Everything else — dev, previews — is test.
export const dodoMode: DodoMode = import.meta.env.PUBLIC_DODO_MODE === "live" ? "live" : "test";
export const checkoutBase =
  dodoMode === "live" ? "https://checkout.dodopayments.com" : "https://test.checkout.dodopayments.com";

// Dev serves public/media; production builds use the R2 bucket unless PUBLIC_MEDIA_BASE overrides it.
const R2_MEDIA = "https://media.visualon.top";
const mediaBase = (import.meta.env.PUBLIC_MEDIA_BASE || (import.meta.env.DEV ? "/media" : R2_MEDIA)).replace(/\/$/, "");
export const media = (
  slug: string,
  ratio: string,
  file: "full.mp4" | "preview.mp4" | "poster.jpg" | "preview.jpg" | `scene-${number}.jpg`,
) =>
  `${mediaBase}/${slug}/${ratio}/${file}`;
export const reelUrl = `${mediaBase}/reel.mp4`;

/** Case-study write-up on a project's page. Scene times are seconds into the video (the same in every format). */
export type Story = {
  challenge: string;
  audience: string;
  idea: string;
  /** `t` is where the scene starts; `frame` is the moment used for its still (scene-<n>.jpg, built by npm run media). */
  scenes: { t: number; frame: number; title: string; text: string }[];
  craft: string[];
};

export type Project = (typeof work.projects)[number] & { concept?: boolean; turnaround?: string; story?: Story };
export const projects = work.projects as Project[];
/** Homepage "selected work": projects with a `home` position, in that order, capped at 7. New work goes to /work only
 *  (no `home`) unless the homepage is asked for explicitly. */
export const HOME_MAX = 7;
export const featured = projects
  .filter((p) => typeof p.home === "number")
  .sort((a, b) => (a.home ?? 0) - (b.home ?? 0))
  .slice(0, HOME_MAX);
export const vertical = projects.flatMap((p) =>
  p.media.filter((m) => m.ratio === "9x16").map((m) => ({ project: p, ratio: m.ratio })),
);
export const ratioLabel = (r: string) => r.replace("x", ":");
