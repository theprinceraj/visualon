import type { APIRoute } from "astro";
import { dodoMode } from "../data/site";

// Test builds (dev and branch previews) also send noindex on every page; this keeps crawlers out of them entirely.
export const GET: APIRoute = ({ site }) =>
  new Response(
    dodoMode === "live"
      ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site)}\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
