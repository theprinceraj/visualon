// Google Analytics 4 for visualon.top. Every event the site sends goes through `track()`, and every event name and
// parameter is listed in docs/analytics.md. Add new ones there first, then here, then register custom parameters
// in GA (`npm run ga:setup`), or they never show up in reports.
//
// Off unless PUBLIC_GA_ID is set at build time and the page is served from the site's own domain (so preview
// deployments and local dev send nothing). `?ga_debug=1` turns it on anywhere for this tab, in GA's DebugView,
// marked as internal traffic.

export type EventName =
  // funnel (GA ecommerce names, so the built-in checkout and monetization reports work)
  | "view_item_list"
  | "select_item"
  | "begin_checkout"
  | "purchase"
  | "order_form_error"
  | "order_abandon"
  | "payment_incomplete"
  | "generate_lead"
  // engagement
  | "section_view"
  | "cta_click"
  | "email_click"
  | "film_click"
  | "preview_play"
  | "video_start"
  | "video_progress"
  | "video_complete"
  | "film_format"
  | "scene_click"
  | "work_filter"
  | "faq_open"
  | "currency_switch"
  | "consent_choice";

type Params = Record<string, string | number | boolean | undefined | unknown[]>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const ID = (import.meta.env.PUBLIC_GA_ID as string | undefined)?.trim() || "";
const SITE_HOST = new URL(import.meta.env.SITE || "https://visualon.top").hostname.replace(/^www\./, "");

const safe = <T>(f: () => T, fallback: T): T => {
  try {
    return f();
  } catch {
    return fallback;
  }
};
const local = {
  get: (k: string) => safe(() => localStorage.getItem(k), null),
  set: (k: string, v: string) => safe(() => localStorage.setItem(k, v), undefined),
  del: (k: string) => safe(() => localStorage.removeItem(k), undefined),
};

const q = new URLSearchParams(location.search);

// ?ga_debug=1 for this tab (sessionStorage), ?ga_debug=0 to stop.
if (q.get("ga_debug") === "1") safe(() => sessionStorage.setItem("vo-ga-debug", "1"), undefined);
if (q.get("ga_debug") === "0") safe(() => sessionStorage.removeItem("vo-ga-debug"), undefined);
const debug = safe(() => sessionStorage.getItem("vo-ga-debug") === "1", false);

// ?internal=1 once on each of your own browsers; the "Internal Traffic" data filter in GA drops them from reports.
if (q.get("internal") === "1") local.set("vo-internal", "1");
if (q.get("internal") === "0") local.del("vo-internal");
const internal = debug || local.get("vo-internal") === "1";

const onSite = location.hostname.replace(/^www\./, "") === SITE_HOST;
export const enabled = Boolean(ID) && (onSite || debug);
let blocked = false; // gtag.js failed to load (ad blocker): callbacks run at once instead of waiting

// ---------- page context ----------

/** GA's built-in "Content group" dimension: which kind of page an event happened on (set by Base.astro). */
export const pageType = document.body.dataset.page || "other";

const ATTRIBUTION = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id", "gclid"];

/**
 * The URL GA sees: no hash and only campaign parameters, so payment ids, scene times and filter state stay out of
 * page reports. Outreach links carry only ?ref=<lead id>; they become a campaign here so that traffic shows up as
 * outreach / email instead of direct (mail apps send no referrer).
 */
function pageLocation(): string {
  const url = new URL(location.href);
  url.hash = "";
  const ref = (url.searchParams.get("ref") || "").trim();
  for (const k of [...url.searchParams.keys()]) if (!ATTRIBUTION.includes(k)) url.searchParams.delete(k);
  if (ref && !url.searchParams.has("utm_source") && /^[\w.-]{1,40}$/.test(ref)) {
    const lead = /^V\d+$/i.test(ref);
    url.searchParams.set("utm_source", lead ? "outreach" : ref.toLowerCase());
    url.searchParams.set("utm_medium", lead ? "email" : "referral");
    url.searchParams.set("utm_campaign", lead ? "outreach" : ref.toLowerCase());
    if (lead) url.searchParams.set("utm_content", ref.toUpperCase());
  }
  return url.toString();
}

// ---------- consent ----------
// No ads, so ad storage is always off. Analytics cookies are off by default in the EEA, UK and Switzerland until the
// visitor accepts (Consent Mode v2: until then GA gets cookieless pings and models the gap). Everywhere else they're on.
const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT",
  "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];
type Choice = "granted" | "denied";
const storedChoice = () => local.get("vo-consent") as Choice | null;
/** Europe by time zone: who sees the banner. GA's own region check above is what actually decides the default. */
const inEurope = () => {
  const tz = safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "", "");
  return /^Europe\/|^Atlantic\/(Canary|Madeira|Reykjavik|Faroe|Azores)|^Arctic\//.test(tz);
};

export function setConsent(choice: Choice, from = "banner") {
  local.set("vo-consent", choice);
  window.gtag?.("consent", "update", { analytics_storage: choice });
  track("consent_choice", { choice, from });
  const banner = document.querySelector<HTMLElement>("[data-consent]");
  if (banner) banner.hidden = true;
  markChoice(choice);
}
const markChoice = (choice: Choice | null) =>
  document
    .querySelectorAll<HTMLElement>("main [data-consent-set]")
    .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.consentSet === choice)));

function wireConsent() {
  const banner = document.querySelector<HTMLElement>("[data-consent]");
  // Only when GA actually runs here: no banner on previews or in dev.
  if (banner && enabled && !storedChoice() && inEurope()) banner.hidden = false;
  markChoice(storedChoice());
  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-consent-set],[data-consent-open]");
    if (!el) return;
    if (el.dataset.consentSet) setConsent(el.dataset.consentSet as Choice, el.closest("[data-consent]") ? "banner" : "page");
    else if (banner) banner.hidden = false;
  });
}

// ---------- boot ----------

if (enabled) {
  const dataLayer = (window.dataLayer ??= []);
  window.gtag = function gtag() {
    // gtag.js expects the Arguments object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  const gtag = window.gtag;
  gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
  gtag("consent", "default", { analytics_storage: "denied", region: CONSENT_REGIONS, wait_for_update: 500 });
  const choice = storedChoice();
  if (choice) gtag("consent", "update", { analytics_storage: choice });
  gtag("set", "ads_data_redaction", true);

  const ref = local.get("vo-ref");
  const currency = local.get("vo-currency");
  gtag("set", "user_properties", {
    ...(ref ? { lead_ref: ref } : {}),
    ...(currency ? { display_currency: currency } : {}),
  });
  gtag("js", new Date());
  gtag("config", ID, {
    page_location: pageLocation(),
    page_title: document.title,
    content_group: pageType,
    cookie_expires: 60 * 60 * 24 * 395, // 13 months
    ...(internal ? { traffic_type: "internal" } : {}),
    ...(debug ? { debug_mode: true } : {}),
  });

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  s.onerror = () => (blocked = true);
  document.head.appendChild(s);
}
wireConsent();

// ---------- api ----------

/**
 * Sends one event. `done` runs once GA has it (or after 900 ms, or at once when GA is off or blocked); use it before
 * leaving the page so the event isn't lost.
 */
export function track(name: EventName, params: Params = {}, done?: () => void) {
  if (!enabled || !window.gtag) {
    done?.();
    return;
  }
  const p: Params = { content_group: pageType, ...params };
  if (internal) p.traffic_type = "internal";
  if (debug) p.debug_mode = true;
  if (done) {
    if (blocked) {
      window.gtag("event", name, p);
      done();
      return;
    }
    let ran = false;
    const once = () => {
      if (ran) return;
      ran = true;
      done();
    };
    (p as Record<string, unknown>).event_callback = once;
    (p as Record<string, unknown>).event_timeout = 800;
    setTimeout(once, 900);
  }
  window.gtag("event", name, p);
}

/** Like track, but at most once per page view for the same key. */
const sent = new Set<string>();
export function trackOnce(key: string, name: EventName, params: Params = {}) {
  if (sent.has(key)) return;
  sent.add(key);
  track(name, params);
}

export function setUserProperty(key: "lead_ref" | "display_currency", value: string) {
  window.gtag?.("set", "user_properties", { [key]: value });
}

/** A GA ecommerce item for one package. */
export const item = (pkg: { id: string; name: string; price: Record<string, number> }, currency: string, index?: number) => ({
  item_id: pkg.id,
  item_name: pkg.name,
  item_category: "video package",
  price: pkg.price[currency],
  quantity: 1,
  ...(index !== undefined ? { index } : {}),
});
