// Uploads public/media to the R2 bucket that serves PUBLIC_MEDIA_BASE.
// Usage: node scripts/upload-media.mjs [--bucket visualon-media] [--only slug]
// Needs `npx wrangler login` once. Run `npm run media` first to build the files.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const bucket = flag("--bucket", process.env.R2_BUCKET || "visualon-media");
const only = flag("--only");
const root = path.resolve(import.meta.dirname, "../public/media");
const types = { ".mp4": "video/mp4", ".jpg": "image/jpeg" };

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));

const files = walk(root).filter((f) => !only || path.relative(root, f).startsWith(only + path.sep));
for (const f of files) {
  const key = path.relative(root, f).split(path.sep).join("/");
  const type = types[path.extname(f)] ?? "application/octet-stream";
  execFileSync(
    "npx",
    ["wrangler", "r2", "object", "put", `${bucket}/${key}`, "--file", f, "--content-type", type,
      "--cache-control", "public, max-age=31536000, immutable", "--remote"],
    { stdio: ["ignore", "ignore", "inherit"], shell: process.platform === "win32" },
  );
  console.log(`↑ ${key}`);
}
console.log(`${files.length} files → r2://${bucket}`);
