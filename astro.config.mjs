import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL || "https://visualon.top",
  trailingSlash: "never",
  build: { format: "file" },
});
