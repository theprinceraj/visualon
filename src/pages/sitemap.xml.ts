import type { APIRoute } from "astro";
import { projects } from "../data/site";
import { services } from "../data/services";

// Every static page under src/pages is picked up on its own, so a new page lands in the sitemap without touching this
// file. Pages that pass `noindex` to their layout (/thanks, /404) stay out. Dynamic routes are listed from the same data
// their getStaticPaths uses.
const sources = import.meta.glob<string>("./**/*.astro", { query: "?raw", import: "default", eager: true });

const priorities: Record<string, string> = { "/": "1.0", "/work": "0.8", "/terms": "0.2", "/privacy": "0.2", "/refunds": "0.2" };

/** "7 October 2026" (the Legal layout's `updated` prop) → "2026-10-07". */
const isoDate = (text: string) => {
  const d = new Date(`${text} UTC`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
};

type Entry = { path: string; priority: string; lastmod?: string };

const staticPages: Entry[] = Object.entries(sources)
  .filter(([file, src]) => !file.includes("[") && !/<\w+[^>]*\snoindex[\s>=]/.test(src))
  .map(([file, src]) => {
    const path = file.replace(/^\.\//, "/").replace(/(\/?index)?\.astro$/, "") || "/";
    const updated = src.match(/\supdated="([^"]+)"/)?.[1];
    return { path, priority: priorities[path] ?? "0.5", lastmod: updated && isoDate(updated) };
  });

export const GET: APIRoute = ({ site }) => {
  const pages: Entry[] = [
    ...staticPages,
    ...services.map((s) => ({ path: `/${s.slug}`, priority: "0.9" })),
    ...projects.map((p) => ({ path: `/work/${p.slug}`, priority: "0.7", lastmod: p.date })),
  ].sort((a, b) => Number(b.priority) - Number(a.priority) || a.path.localeCompare(b.path));

  const urls = pages.map(
    ({ path, priority, lastmod }) =>
      `  <url><loc>${new URL(path, site)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>${priority}</priority></url>`,
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
