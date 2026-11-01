// Configures the GA4 property so the events in docs/analytics.md show up in reports. Safe to run again: it only
// creates what's missing and leaves everything else alone.
//
//   GA_PROPERTY_ID=123456789 npm run ga:setup             # apply
//   GA_PROPERTY_ID=123456789 npm run ga:setup -- --dry-run  # show what it would do
//
// Auth: an OAuth access token with the analytics.edit scope, from GA_ACCESS_TOKEN or, if unset, from gcloud:
//   gcloud auth application-default login --scopes=https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/cloud-platform
// With gcloud user credentials, also set GA_QUOTA_PROJECT=<a Google Cloud project id with the Analytics Admin API enabled>.
//
// What the API can't do (the steps in docs/analytics.md cover them): activate the internal-traffic data filter,
// link Search Console, build the saved explorations.

import { execSync } from "node:child_process";

const dry = process.argv.includes("--dry-run");
const property = process.env.GA_PROPERTY_ID?.replace(/^properties\//, "");
if (!property) {
  console.error("Set GA_PROPERTY_ID (the number in GA → Admin → Property details).");
  process.exit(1);
}
const P = `properties/${property}`;

// ---------- what the site sends (keep in step with src/scripts/analytics.ts and docs/analytics.md) ----------

/** Event-scoped custom dimensions: [parameter, display name, description]. */
const eventDimensions = [
  ["package", "Package", "Package id: single, launch, hooks"],
  ["film", "Film", "Work page film: project slug, or slug/film id"],
  ["ratio", "Film format", "Aspect ratio played or picked: 16x9, 9x16, 1x1, 4x5"],
  ["video_percent", "Video percent", "Milestone reached: 25, 50, 75, 100"],
  ["scene", "Scene", "Scene title clicked in a case study"],
  ["via", "Via", "How a scene or filter was reached: scene_list, url, chip, link"],
  ["section", "Section", "Page section reached: work, method, packages, faq, contact..."],
  ["list", "Placement", "Where on the page a film, FAQ or currency toggle sat"],
  ["from", "Order from", "Section the order button was in"],
  ["cta_text", "CTA text", "Button or link text clicked"],
  ["cta_location", "CTA location", "Section, nav or footer the CTA was in"],
  ["location", "Email link location", "Where a mailto link was clicked"],
  ["reason", "Form error", "Order form check that failed: name_missing, email_invalid, link_missing, brief_short"],
  ["last_field", "Last field filled", "Furthest order form field filled before closing"],
  ["method", "Lead method", "quote_form or order_email"],
  ["regarding", "Quote: regarding", "Quote form topics"],
  ["budget", "Quote: budget", "Quote form budget band"],
  ["start", "Quote: start with", "Quote form starting package"],
  ["formats", "Order formats", "Formats picked in the order form"],
  ["feel", "Order feel", "Tone chips picked in the order form"],
  ["filter", "Work filter", "Sector filter on /work"],
  ["question", "FAQ question", "FAQ question opened"],
  ["status", "Payment status", "Dodo status on a payment that didn't complete"],
  ["choice", "Consent choice", "granted or denied"],
];
/** User-scoped custom dimensions. */
const userDimensions = [
  ["lead_ref", "Lead ref", "Outreach lead id (V001...) from the ?ref= link that brought them; matches outreach/leads.csv"],
  ["display_currency", "Display currency", "Currency the visitor sees prices in: INR or USD"],
];
/** Event-scoped custom metrics: [parameter, display name, unit, description]. */
const metrics = [
  ["fields_filled", "Order fields filled", "STANDARD", "Order form fields filled before closing without ordering"],
  ["results", "Filter results", "STANDARD", "Projects shown after a work filter"],
  ["seconds", "Scene start", "SECONDS", "Second a scene starts at"],
  ["video_duration", "Video duration", "SECONDS", "Length of the film played"],
];
/** Key events (conversions). purchase is one by default in every property. */
const keyEvents = [
  ["purchase", "ONCE_PER_EVENT"],
  ["begin_checkout", "ONCE_PER_SESSION"],
  ["generate_lead", "ONCE_PER_SESSION"],
];
/** The site sends its own page views and form events, so GA's automatic ones would double-count. */
const enhanced = {
  streamEnabled: true,
  scrollsEnabled: true, // 90 % scroll; section_view covers the rest
  outboundClicksEnabled: true,
  fileDownloadsEnabled: true,
  siteSearchEnabled: false, // no search on the site
  videoEngagementEnabled: false, // YouTube embeds only; films are tracked by the site
  formInteractionsEnabled: false, // generate_lead / begin_checkout instead
  pageChangesEnabled: false, // /work rewrites ?f= with history.replaceState; that is not a new page
};

// ---------- api ----------

const token =
  process.env.GA_ACCESS_TOKEN ||
  (() => {
    try {
      return execSync("gcloud auth application-default print-access-token", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {
      return "";
    }
  })();
if (!token) {
  console.error("No access token: set GA_ACCESS_TOKEN, or log in with gcloud (see the top of this file).");
  process.exit(1);
}

async function api(method, path, body, version = "v1beta") {
  const res = await fetch(`https://analyticsadmin.googleapis.com/${version}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(process.env.GA_QUOTA_PROJECT ? { "x-goog-user-project": process.env.GA_QUOTA_PROJECT } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${json.error?.message ?? ""}`);
  return json;
}
async function list(path, key) {
  const out = [];
  let pageToken = "";
  do {
    const r = await api("GET", `${path}?pageSize=200${pageToken ? `&pageToken=${pageToken}` : ""}`);
    out.push(...(r[key] ?? []));
    pageToken = r.nextPageToken ?? "";
  } while (pageToken);
  return out;
}
const write = async (label, f) => {
  if (dry) return console.log(`  would ${label}`);
  await f();
  console.log(`  ${label}`);
};

// ---------- run ----------

console.log(`${dry ? "Dry run for" : "Configuring"} ${P}\n`);

console.log("Custom dimensions");
const haveDims = new Set((await list(`${P}/customDimensions`, "customDimensions")).map((d) => `${d.scope}:${d.parameterName}`));
for (const [scope, rows] of [["EVENT", eventDimensions], ["USER", userDimensions]]) {
  for (const [parameterName, displayName, description] of rows) {
    if (haveDims.has(`${scope}:${parameterName}`)) continue;
    await write(`create ${scope.toLowerCase()} dimension ${parameterName}`, () =>
      api("POST", `${P}/customDimensions`, { parameterName, displayName, description, scope }),
    );
  }
}

console.log("Custom metrics");
const haveMetrics = new Set((await list(`${P}/customMetrics`, "customMetrics")).map((m) => m.parameterName));
for (const [parameterName, displayName, measurementUnit, description] of metrics) {
  if (haveMetrics.has(parameterName)) continue;
  await write(`create metric ${parameterName}`, () =>
    api("POST", `${P}/customMetrics`, { parameterName, displayName, description, measurementUnit, scope: "EVENT" }),
  );
}

console.log("Key events");
const haveKeys = new Set((await list(`${P}/keyEvents`, "keyEvents")).map((k) => k.eventName));
for (const [eventName, countingMethod] of keyEvents) {
  if (haveKeys.has(eventName)) continue;
  await write(`mark ${eventName} as a key event`, () => api("POST", `${P}/keyEvents`, { eventName, countingMethod }));
}

console.log("Data retention");
const retention = await api("GET", `${P}/dataRetentionSettings`);
if (retention.eventDataRetention !== "FOURTEEN_MONTHS") {
  await write("set event data retention to 14 months", () =>
    api("PATCH", `${P}/dataRetentionSettings?updateMask=eventDataRetention,resetUserDataOnNewActivity`, {
      eventDataRetention: "FOURTEEN_MONTHS",
      resetUserDataOnNewActivity: true,
    }),
  );
}

console.log("Enhanced measurement");
const streams = (await list(`${P}/dataStreams`, "dataStreams")).filter((s) => s.type === "WEB_DATA_STREAM");
for (const s of streams) {
  const url = s.webStreamData?.defaultUri ?? s.name;
  const path = `${s.name}/enhancedMeasurementSettings`;
  const current = await api("GET", path, undefined, "v1alpha");
  const changed = Object.keys(enhanced).filter((k) => current[k] !== enhanced[k]);
  if (!changed.length) continue;
  await write(`update ${url} (${s.webStreamData?.measurementId}): ${changed.map((k) => `${k}=${enhanced[k]}`).join(", ")}`, () =>
    api("PATCH", `${path}?updateMask=${changed.join(",")}`, enhanced, "v1alpha"),
  );
}

console.log(`\nDone. Still to do by hand (docs/analytics.md → "GA4 setup"): activate the Internal Traffic filter, link
Search Console, build the explorations.`);
