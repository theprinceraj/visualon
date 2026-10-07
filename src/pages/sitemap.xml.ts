import type { APIRoute } from "astro";
import { projects } from "../data/site";
import { services } from "../data/services";

// Every indexable page. /thanks and /404 stay out (they're noindex).
export const GET: APIRoute = ({ site }) => {
  const pages: [path: string, priority: string][] = [
    ["/", "1.0"],
    ...services.map((s) => [`/${s.slug}`, "0.9"] as [string, string]),
    ["/work", "0.8"],
    ...projects.map((p) => [`/work/${p.slug}`, "0.7"] as [string, string]),
    ["/terms", "0.2"],
    ["/privacy", "0.2"],
    ["/refunds", "0.2"],
  ];
  const urls = pages.map(([path, priority]) => `  <url><loc>${new URL(path, site)}</loc><priority>${priority}</priority></url>`);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
