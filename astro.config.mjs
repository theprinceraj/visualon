import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL || "https://visualon.theprinceraj.in",
  trailingSlash: "never",
  build: { format: "file" },
});
