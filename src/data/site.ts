import work from "./work.json";

export const site = {
  name: "VisualOn",
  wordmark: "visualon",
  domain: "visualon.top",
  email: "profile.princeraj@gmail.com",
  founder: "Prince",
  since: 2026,
  tagline: "product videos, directed by taste",
  // Daily render capacity. Shown on the site, and used to size delivery windows.
  rendersPerDay: 20,
};

export type Currency = "INR" | "USD";

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
   * Dodo Payments product ID per currency. One product with a localized INR price serves both; checkout
   * gets `paymentCurrency` so the buyer pays the shown price. While empty, "order" falls back to a pre-filled email.
   */
  dodo: Record<Currency, string>;
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
    dodo: { INR: "pdt_0NpAtJ2l6aMzO3MFgOlQH", USD: "pdt_0NpAtJ2l6aMzO3MFgOlQH" },
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
    dodo: { INR: "pdt_0NpAuSxSjYx4eqtKXmu8M", USD: "pdt_0NpAuSxSjYx4eqtKXmu8M" },
  },
  {
    id: "hooks",
    name: "Hook pack",
    sub: "five openings, one ad",
    price: { INR: 4499, USD: 44.99 },
    delivery: "72 hours",
    includes: ["1 ad, 5 hook variants", "9:16 + 4:5", "a/b test plan", "2 revisions"],
    formats: ["9:16", "4:5", "1:1"],
    dodo: { INR: "pdt_0NpAvG1pPno986EEh79OH", USD: "pdt_0NpAvG1pPno986EEh79OH" },
  },
];

export const symbols: Record<Currency, string> = { INR: "₹", USD: "$" };
export const formatPrice = (n: number, c: Currency) =>
  symbols[c] + n.toLocaleString(c === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 2 });

export const dodoMode = (import.meta.env.PUBLIC_DODO_MODE ?? "test") as "test" | "live";
export const checkoutBase =
  dodoMode === "live" ? "https://checkout.dodopayments.com" : "https://test.checkout.dodopayments.com";

const mediaBase = (import.meta.env.PUBLIC_MEDIA_BASE ?? "/media").replace(/\/$/, "");
export const media = (slug: string, ratio: string, file: "full.mp4" | "preview.mp4" | "poster.jpg" | "preview.jpg") =>
  `${mediaBase}/${slug}/${ratio}/${file}`;
export const reelUrl = `${mediaBase}/reel.mp4`;

export type Project = (typeof work.projects)[number] & { concept?: boolean };
export const projects = work.projects as Project[];
export const featured = projects.filter((p) => p.featured);
export const vertical = projects.flatMap((p) =>
  p.media.filter((m) => m.ratio === "9x16").map((m) => ({ project: p, ratio: m.ratio })),
);
export const ratioLabel = (r: string) => r.replace("x", ":");
