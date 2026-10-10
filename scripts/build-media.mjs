// Turns finished renders into web media: a faststart full MP4, a short muted preview loop and a poster.
// Usage: node scripts/build-media.mjs [--src "D:/Claude Videos/projects"] [--only slug|slug/film] [--stills]
// --stills only (re)builds the case-study scene stills, skipping the video encodes and the reel.
// Reads the `media` list in src/data/work.json and writes public/media/<slug>/<variant>/{full.mp4,preview.mp4,poster.jpg};
// a project's further `films` go to public/media/<slug>/<film id>/<variant>/.
// public/media is gitignored; production serves it from R2 (see scripts/upload-media.mjs).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const SRC = flag("--src", process.env.VIDEO_SRC || "D:/Claude Videos/projects");
const only = flag("--only");
const stillsOnly = args.includes("--stills");
const root = path.resolve(import.meta.dirname, "..");
const work = JSON.parse(fs.readFileSync(path.join(root, "src/data/work.json"), "utf8"));

const ff = (a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" });
const probe = (f) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

// Each project's main film, then its further films (same page, own media folder).
const films = work.projects.flatMap((p) => [
  { key: p.slug, slug: p.slug, media: p.media, story: p.story },
  ...(p.films ?? []).map((f) => ({ key: `${p.slug}/${f.id}`, slug: p.slug, media: f.media, story: f.story })),
]);

for (const p of films) {
  if (only && p.slug !== only && p.key !== only) continue;
  for (const v of p.media) {
    const src = path.join(SRC, v.src);
    if (!fs.existsSync(src)) {
      console.warn(`skip ${p.key}/${v.ratio}: ${src} not found`);
      continue;
    }
    const out = path.join(root, "public/media", p.key, v.ratio);
    fs.mkdirSync(out, { recursive: true });
    const dur = probe(src);
    const vertical = v.ratio === "9x16" || v.ratio === "4x5";
    const scale = vertical ? "scale=540:-2" : "scale=960:-2";
    const start = v.previewAt ?? Math.min(2, dur / 4);
    const len = Math.min(v.previewLen ?? 8, dur - start);

    // Case-study stills: one frame per scene, from the first format only (the page shows them under the player).
    const scenes = v === p.media[0] ? (p.story?.scenes ?? []) : [];
    scenes.forEach((s, i) =>
      ff(["-ss", String(s.frame), "-i", src, "-frames:v", "1", "-vf", vertical ? "scale=360:-2" : "scale=640:-2", "-q:v", "5",
        path.join(out, `scene-${i + 1}.jpg`)]),
    );
    if (stillsOnly) {
      if (scenes.length) console.log(`${p.key}/${v.ratio}: ${scenes.length} scene stills`);
      continue;
    }

    // Full video: re-encode for the web (1080p, ~3.5 Mbps cap) with the moov atom up front.
    ff(["-i", src, "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-maxrate", "3500k", "-bufsize", "7000k",
      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", path.join(out, "full.mp4")]);
    // Preview: muted loop for hover/autoplay.
    ff(["-ss", String(start), "-t", String(len), "-i", src, "-an", "-vf", `${scale},fps=30`, "-c:v", "libx264",
      "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(out, "preview.mp4")]);
    // Poster: frame 0 is the designed poster frame in every render.
    ff(["-i", src, "-frames:v", "1", "-vf", vertical ? "scale=720:-2" : "scale=1280:-2", "-q:v", "4", path.join(out, "poster.jpg")]);
    // Preview poster: first frame of the preview, so the swap from image to video is seamless.
    ff(["-i", path.join(out, "preview.mp4"), "-frames:v", "1", "-q:v", "5", path.join(out, "preview.jpg")]);

    const kb = (f) => Math.round(fs.statSync(path.join(out, f)).size / 1024);
    console.log(`${p.key}/${v.ratio}: full ${kb("full.mp4")}K · preview ${kb("preview.mp4")}K · poster ${kb("poster.jpg")}K` +
      (scenes.length ? ` · ${scenes.length} scene stills` : ""));
  }
}

// Studio reel for the hero screen: ~2s from each homepage project's 16:9 preview (same order and cap as the
// homepage list in src/data/site.ts), hard cuts, muted.
const clips = work.projects
  .filter((p) => typeof p.home === "number" && p.media.some((m) => m.ratio === "16x9"))
  .sort((a, b) => a.home - b.home)
  .slice(0, 7)
  .map((p) => path.join(root, "public/media", p.slug, "16x9", "preview.mp4"))
  .filter((f) => fs.existsSync(f));
if (clips.length && !only && !stillsOnly) {
  const inputs = clips.flatMap((f) => ["-ss", "1", "-t", "2.2", "-i", f]);
  const chain = clips.map((_, i) => `[${i}:v]scale=960:540,setsar=1,fps=30[v${i}]`).join(";");
  const concat = clips.map((_, i) => `[v${i}]`).join("") + `concat=n=${clips.length}:v=1:a=0[out]`;
  ff([...inputs, "-filter_complex", `${chain};${concat}`, "-map", "[out]", "-c:v", "libx264", "-preset", "slow",
    "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(root, "public/media/reel.mp4")]);
  console.log(`reel: ${clips.length} clips, ${Math.round(fs.statSync(path.join(root, "public/media/reel.mp4")).size / 1024)}K`);
}
