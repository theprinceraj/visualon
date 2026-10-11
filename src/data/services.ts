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
  /** /work filters (site.ts `filters`) whose projects this page shows, newest first; "all n" links to the first.
   *  Without any, all work. */
  filters?: string[];
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
    filters: ["saas"],
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
    filters: ["ecommerce", "local"],
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
  {
    slug: "app-promo-videos",
    nav: "app promo videos",
    title: "App Promo Videos for iOS, Android and Chrome Extensions · VisualOn",
    description: `App promo videos for iOS and Android apps, Chrome extensions and bots, built from your app's real screens and cut vertical for reels and shorts, from ${usd("single")}.`,
    label: "app promo videos",
    h1: "App promo videos, <em>vertical</em> first.",
    logline: "Your app, on the phone, in the first second.",
    lede: "an app promo has one job: show what the app does before the thumb moves on. we capture your app's real screens and flows, put them on the device and cut them vertical for reels, shorts and tiktok, with a widescreen cut for your site and store listing. for ios and android apps, chrome extensions and bots.",
    points: [
      { t: "Real screens, real flows", b: "the actual app, captured and re-staged, so the tap people see in the ad is the tap they get after installing." },
      { t: "Vertical first", b: "framed for 9:16 from the start, not cropped down from widescreen, with 16:9 and 1:1 cuts in the launch kit." },
      { t: "One feature, one hook", b: "we pick the one thing your app does that nobody else does and open on it." },
      { t: "Scored to the taps", b: "music and sound effects composed as one piece, timed to every tap, swipe and notification." },
    ],
    filters: ["apps"],
    pkg: "launch",
    faqs: [
      { q: "What goes into an app promo video?", a: "Your app's real screens on a device, one feature as the hook, a score timed to the taps and your store name or link at the end. Usually 15 to 30 seconds, cut in 9:16 for reels and shorts." },
      { q: "Do you make videos for Chrome extensions and bots?", a: "Yes. We've made films for a Chrome extension that works inside X and for a card game bot that lives in Discord. We capture the extension or bot working where people really use it." },
      { q: "What if the app isn't in the store yet?", a: "A demo login, a test build or screen recordings are enough. Send them by email after ordering, and tell us if the video is confidential so we keep it out of our portfolio." },
      { q: "How much does an app promo video cost?", a: priceLine },
      { q: "How fast is delivery?", a: speedLine },
    ],
  },
  {
    slug: "explainer-videos",
    nav: "explainer videos",
    title: "Explainer Videos With a Story, for SaaS and Apps · VisualOn",
    description: `Short character-led explainer videos for SaaS, apps and services: one person, one problem, your real product as the fix. Directed by people, from ${usd("single")}.`,
    label: "explainer videos",
    h1: "Explainer videos with a <em>story</em>.",
    logline: "One person. One bad moment. Your product.",
    lede: "the usual explainer is a narrator reading a feature list over flat icons. ours start with one person and one bad moment, a restaurant owner with no menus on a saturday night, a founder watching ad money leak, and let your real product fix it on screen. a short story people watch to the end, built from your live ui and brand.",
    points: [
      { t: "A character, not a narrator", b: "one person with a problem your customers will recognise, so the product arrives as the answer instead of a pitch." },
      { t: "Your real product", b: "the fix happens in your actual ui, with your copy and colours, not a cartoon of a dashboard." },
      { t: "Short enough to finish", b: "one problem, one turn, one payoff, then your logo. usually 20 to 45 seconds." },
      { t: "No shoot, no actors", b: "characters and scenes are rendered with ai and directed shot by shot, so a story costs the same as a promo." },
    ],
    filters: ["character"],
    pkg: "launch",
    faqs: [
      { q: "What makes an explainer video work?", a: "A problem the viewer recognises in the first seconds, one person living it, and the product solving it on screen. Feature lists are for the landing page; the video only has to make someone want to read it." },
      { q: "How long should an explainer video be?", a: "For feeds and landing pages, 20 to 45 seconds. Longer walkthroughs or a series get a fixed quote: <a href=\"/#contact\">ask here</a>." },
      { q: "Is it animated or filmed?", a: "Neither in the old sense. Characters and settings are rendered with AI and directed shot by shot, and the product scenes are built from your real interface. There's no shoot to book." },
      { q: "How much does an explainer video cost?", a: priceLine },
      { q: "How fast is delivery?", a: speedLine },
    ],
  },
  {
    slug: "restaurant-videos",
    nav: "restaurant + café videos",
    title: "Restaurant and Café Videos for Instagram and Ads · VisualOn",
    description: `Instagram reels, ads and promo videos for restaurants, cafés and local businesses, plus launch films for restaurant software. Cut vertical for the feed, from ${usd("single")}.`,
    label: "restaurant + café videos",
    h1: "Videos for restaurants and <em>cafés</em>.",
    logline: "Hungry by the second second.",
    lede: "a restaurant reel competes with every other plate on the feed. we make instagram reels, ads and promo videos for restaurants, cafés and local businesses, and launch films for the tools they run on, like qr menus and review systems. built from your menu, your photos and your brand, cut vertical for the feed.",
    points: [
      { t: "Your menu, your room", b: "your dishes, your space and your name. no stock food footage that ten other places are already posting." },
      { t: "Made for the feed", b: "9:16 for reels and stories first, with a square cut for the grid when you need one." },
      { t: "One reason to come", b: "one dish, one offer or one feeling per video, with your name and neighbourhood where people can read them." },
      { t: "No shoot day", b: "your existing photos and menu are the starting point, so service doesn't stop for a camera crew." },
    ],
    filters: ["local"],
    pkg: "single",
    faqs: [
      { q: "Do you make Instagram reels for restaurants and cafés?", a: "Yes. Send your Instagram or Google listing, your menu and a few photos, and we make a reel or ad around one dish, offer or moment, cut 9:16 for reels and stories." },
      { q: "Do I need to arrange a shoot?", a: "No. Your menu, photos and any clips you already have are the starting point. Send extras by email after ordering." },
      { q: "Do you make videos for restaurant software?", a: "Yes. We've made launch films for a QR menu and restaurant OS and for a QR review tool, built from their real product. See <a href=\"/saas-launch-videos\">SaaS launch videos</a>." },
      { q: "How much does a restaurant video cost?", a: priceLine },
      { q: "How fast is delivery?", a: speedLine },
    ],
  },
];
