// Service landing pages (/<slug>), one per search intent. Copy follows the site voice: display lines in sentence
// case, body copy lowercase. FAQ answers are plain sentences (they double as FAQPage structured data) and may hold links.
import { packages, formatPrice, site } from "./site";
import type { Faq } from "./seo";

export type Service = {
  slug: string;
  /** Footer link label. */
  nav: string;
  title: string;
  description: string;
  label: string;
  /** Display heading; may hold <em>. */
  h1: string;
  logline: string;
  lede: string;
  points: { t: string; b: string }[];
  /** Project slugs to show, in order. */
  work: string[];
  /** Package the hero button opens. */
  pkg: string;
  faqs: Faq[];
};

const usd = (id: string) => formatPrice(packages.find((p) => p.id === id)!.price.USD, "USD");
export const priceLine = `Fixed prices, tax included: ${usd("single")} for a single 15–25 second video, ${usd("launch")} for a launch kit in three formats, and ${usd("hooks")} for one ad with five hook variants. Longer films or a series get a fixed quote.`;
export const speedLine = `48 hours for a single video, 72 hours for a launch kit or hook pack. We render up to ${site.rendersPerDay} videos a day, and if the queue is full we say so before you pay.`;

export const services: Service[] = [
  {
    slug: "ai-product-videos",
    nav: "ai product videos",
    title: "AI Product Videos Made From Your Real Product · VisualOn",
    description: `AI product videos built from your real UI, copy and brand, not stock footage. Directed by people, scored and delivered in 48–72 hours, from ${usd("single")}.`,
    label: "ai product videos",
    h1: "AI product videos, <em>directed</em>.",
    logline: "Made with ai. Not made up by it.",
    lede: "most ai video looks like ai video: invented screens, warped text, a voiceover about unlocking potential. ours start from your live product, its real ui, copy, colours and fonts, and a person decides every cut. the ai does the rendering, the variants and the late-night re-cuts. that's why it costs a fraction of a production team and still lands in days.",
    points: [
      { t: "Your real product", b: "we capture the live ui, copy and brand. no stock dashboards, no invented features, nothing your customers won't find when they sign up." },
      { t: "One idea, one hook", b: "every video is built around a single idea, with a first 1.5 seconds designed to stop the scroll." },
      { t: "Scored, not stock", b: "music and sound effects composed as one piece, so every whoosh lands on a cut." },
      { t: "Checked still by still", b: "every render goes through our anti-slop review before it reaches you. warped text and fake ui don't ship." },
    ],
    work: ["lensmilk", "scan4feedback", "gst-reco-pro", "wittywing", "mindmates", "github"],
    pkg: "launch",
    faqs: [
      { q: "What is an AI product video?", a: "A short promo, launch film or ad where AI handles the rendering and motion, and a director handles the idea, the edit and the quality bar. At VisualOn the video is built from your real product, so what people see is what they get." },
      { q: "Will it look like AI?", a: "Not the way you're picturing. We start from your actual interface and brand, and every render is checked still by still against our anti-slop rules. If something looks off, it doesn't ship." },
      { q: "How much does an AI product video cost?", a: priceLine },
      { q: "How fast is delivery?", a: speedLine },
      { q: "What do you need from me?", a: "A link to the product and a line or two of brief. Logos, screenshots, footage or a demo login help, and you can send them by email after ordering." },
      { q: "Can I use the video in paid ads?", a: "Yes. Once paid, you can use the finished video for any lawful purpose, including paid ads. Music and sound effects are licensed for that use. See the <a href=\"/terms\">terms</a>." },
    ],
  },
  {
    slug: "saas-launch-videos",
    nav: "saas + app launch videos",
    title: "SaaS and App Launch Videos, Delivered in Days · VisualOn",
    description: `Launch films, app promo videos and product demos for SaaS, mobile apps and browser extensions, built from your real UI. Every format for every feed, from ${usd("single")}.`,
    label: "saas + app launch videos",
    h1: "Launch videos for <em>software</em>.",
    logline: "Show the product. Skip the explainer cartoon.",
    lede: "software is hard to film: there's nothing to point a camera at. so we don't. we capture your real dashboard, app screens and flows, then cut them into a launch film, a product demo or a vertical promo that gets the idea across in the first few seconds. for saas, mobile apps, chrome extensions and internal tools.",
    points: [
      { t: "Built from your ui", b: "real screens and real flows from the live product, re-staged so the one feature that matters is impossible to miss." },
      { t: "Every feed covered", b: "the launch kit ships 9:16, 1:1 and 16:9, so x, linkedin, reels and your landing page all get a cut that fits." },
      { t: "Gets it in one glance", b: "one idea per video. if the product takes a paragraph to explain, we find the moment that doesn't." },
      { t: "Ready for launch day", b: "captions, hashtags and poster frames come with the launch kit, so posting is copy and paste." },
    ],
    work: ["scan4feedback", "parkkolkata", "wittywing", "gst-reco-pro", "solacc", "dbt-invoice", "bos", "github"],
    pkg: "launch",
    faqs: [
      { q: "What goes into a SaaS launch video?", a: "Your real interface, one idea, a hook in the first 1.5 seconds and a score timed to the cuts. Usually 20 to 45 seconds, cut for every platform you're launching on." },
      { q: "Do you make app promo videos?", a: "Yes, for iOS and Android apps, web apps and browser extensions. We capture the app's real screens and flows and cut them in 9:16 for reels and shorts or 16:9 for your site and YouTube." },
      { q: "Can you make a product demo or tutorial video?", a: "Yes. Tell us the flow you want shown and we'll make a walkthrough from the real product. Longer tutorials or a series get a fixed quote: <a href=\"/#contact\">ask here</a>." },
      { q: "How much does a SaaS launch video cost?", a: priceLine },
      { q: "What if the product isn't public yet?", a: "Send a staging link, a demo login or screenshots by email after ordering. Tell us if the video is confidential and we'll keep it out of our portfolio." },
      { q: "How fast can I get it?", a: speedLine },
    ],
  },
  {
    slug: "ecommerce-product-videos",
    nav: "e-commerce videos",
    title: "E-commerce and D2C Product Videos and Ads · VisualOn",
    description: `Product videos, reels and ads for Shopify stores, D2C brands and social sellers. Vertical cuts for the feed and five hook variants to A/B test, from ${usd("single")}.`,
    label: "e-commerce + d2c videos",
    h1: "Product videos that <em>sell</em>.",
    logline: "Thumb first. Cart second.",
    lede: "a d2c ad has about a second and a half to earn the rest of its run time. we make product videos, ads and reels for online stores, d2c brands and social sellers, cut vertical for the feed and made in variants, so you can test five hooks instead of betting on one.",
    points: [
      { t: "Five hooks, one ad", b: "the hook pack is one ad with five different openings and an a/b test plan, so the data picks the winner, not a hunch." },
      { t: "No shoot needed", b: "your store page, product photos and brand are the starting point. no casting, no shipping samples, no reshoots." },
      { t: "Made for the feed", b: "9:16 and 4:5 first, reframed for reels, shorts and tiktok instead of cropped from widescreen." },
      { t: "Your brand, not a template", b: "your products, colours, fonts and copy. no stock lifestyle clips that three other stores are already running." },
    ],
    work: ["headel", "lensmilk", "faceiom", "the-junction-cafe", "sofi"],
    pkg: "hooks",
    faqs: [
      { q: "Do you make product videos for Shopify and D2C brands?", a: "Yes. Send a link to the store or product page and we build the video from your real products and brand, whether you sell on Shopify, WooCommerce, Instagram or WhatsApp." },
      { q: "What is a hook pack?", a: "One ad with five different openings, cut in 9:16 and 4:5, plus a plan for A/B testing them. The first seconds decide whether an ad gets watched, so testing hooks is the cheapest way to find one that works." },
      { q: "Which formats do I get?", a: "9:16 and 4:5 for feeds and stories, 1:1 for grids, 16:9 for your site and YouTube. Each <a href=\"/#packages\">package</a> lists the formats it includes." },
      { q: "How much does an e-commerce product video cost?", a: priceLine },
      { q: "Do I need to send the product?", a: "No. Your store page, product photos and any footage you already have are the starting point. Send extras by email after ordering." },
      { q: "How fast is delivery?", a: speedLine },
    ],
  },
];
