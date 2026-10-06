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
   * Dodo Payments product IDs, one per currency (create a one-time product per currency in the
   * Dodo dashboard and paste its pdt_… id here). While empty, "order" falls back to a pre-filled email.
   */
  dodo: Record<Currency, string>;
};

export const packages: Package[] = [
  {
    id: "single",
    name: "Single",
    sub: "one product video",
    price: { INR: 2499, USD: 49 },
    delivery: "48 hours",
    includes: ["15–25s video", "1 format", "music + sfx scored", "poster frame", "1 revision"],
    formats: ["9:16", "16:9", "1:1", "4:5"],
    dodo: { INR: "", USD: "" },
  },
  {
    id: "launch",
    name: "Launch kit",
    sub: "the whole launch, every feed",
    price: { INR: 5999, USD: 129 },
    delivery: "72 hours",
    includes: ["20–45s film", "9:16 + 1:1 + 16:9", "captions + hashtags", "poster frames", "2 revisions"],
    formats: ["9:16", "1:1", "16:9", "4:5"],
    recommended: true,
    dodo: { INR: "", USD: "" },
  },
  {
    id: "hooks",
    name: "Hook pack",
    sub: "five openings, one ad",
    price: { INR: 7999, USD: 169 },
    delivery: "72 hours",
    includes: ["1 ad, 5 hook variants", "9:16 + 4:5", "a/b test plan", "2 revisions"],
    formats: ["9:16", "4:5", "1:1"],
    dodo: { INR: "", USD: "" },
  },
  {
    id: "series",
    name: "Series",
    sub: "a month of content in one go",
    price: { INR: 19999, USD: 399 },
    delivery: "7 days",
    includes: ["8 videos", "every format", "content calendar", "publishing kit", "2 revisions each"],
    formats: ["9:16", "1:1", "16:9", "4:5"],
    dodo: { INR: "", USD: "" },
  },
];

export const symbols: Record<Currency, string> = { INR: "₹", USD: "$" };
export const formatPrice = (n: number, c: Currency) =>
  symbols[c] + n.toLocaleString(c === "INR" ? "en-IN" : "en-US");

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
