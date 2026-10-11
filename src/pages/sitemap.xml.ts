import type { APIRoute } from "astro";
import { media, projects, type Film, type Project } from "../data/site";
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

type Video = { title: string; description: string; thumbnail: string; content: string; duration: number; date: string };
type Entry = { path: string; priority: string; lastmod?: string; videos?: Video[] };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A work page's films for Google's video sitemap: the main one, then any further films (same data as its VideoObject). */
const videos = (p: Project, site: URL): Video[] =>
  [undefined, ...(p.films ?? [])].map((f?: Film) => {
    const v = f ?? p;
    const m = v.media[0];
    const dir = f ? `${p.slug}/${f.id}` : p.slug;
    return {
      title: f ? `${p.title}, ${f.title}: ${f.logline}` : `${p.title}: ${p.logline}`,
      description: v.brief,
      thumbnail: new URL(media(dir, m.ratio, "poster.jpg"), site).href,
      content: new URL(media(dir, m.ratio, "full.mp4"), site).href,
      duration: Math.round(m.duration),
      date: `${v.date}T00:00:00+05:30`,
    };
  });

const videoXml = (v: Video) =>
  [
    "    <video:video>",
    `      <video:thumbnail_loc>${esc(v.thumbnail)}</video:thumbnail_loc>`,
    `      <video:title>${esc(v.title.slice(0, 100))}</video:title>`,
    `      <video:description>${esc(v.description.slice(0, 2048))}</video:description>`,
    `      <video:content_loc>${esc(v.content)}</video:content_loc>`,
    `      <video:duration>${v.duration}</video:duration>`,
    `      <video:publication_date>${v.date}</video:publication_date>`,
    "    </video:video>",
  ].join("\n");

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
    ...projects.map((p) => ({ path: `/work/${p.slug}`, priority: "0.7", lastmod: p.date, videos: videos(p, site!) })),
  ].sort((a, b) => Number(b.priority) - Number(a.priority) || a.path.localeCompare(b.path));

  const urls = pages.map(({ path, priority, lastmod, videos: vids }) => {
    const head = `<loc>${new URL(path, site)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>${priority}</priority>`;
    return vids?.length ? `  <url>${head}\n${vids.map(videoXml).join("\n")}\n  </url>` : `  <url>${head}</url>`;
  });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls.join("\n")}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
