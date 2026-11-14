#!/usr/bin/env node
// Downloads Google Fonts woff2 files locally so Remotion can serve them
// without hitting fonts.gstatic.com through the proxy CA.
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/fonts");

fs.mkdirSync(OUT_DIR, { recursive: true });

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=JetBrains+Mono:wght@400&display=swap&subset=latin,latin-ext";

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0" } }, (r) => {
        const chunks = [];
        r.on("data", (c) => chunks.push(c));
        r.on("end", () => res(Buffer.concat(chunks)));
      })
      .on("error", rej);
  });
}

const css = (await get(FONT_CSS_URL)).toString();

// extract woff2 URLs
const matches = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.woff2)\)/g)];
const unique = [...new Set(matches.map((m) => m[1]))];

console.log(`Downloading ${unique.length} woff2 files…`);
let count = 0;
for (const url of unique) {
  const filename = url.split("/").at(-1);
  const dest = path.join(OUT_DIR, filename);
  if (fs.existsSync(dest)) { count++; process.stdout.write("."); continue; }
  const data = await get(url);
  fs.writeFileSync(dest, data);
  count++;
  process.stdout.write(".");
}
console.log(`\nDone — ${count} files in ${OUT_DIR}`);

// Also write a local fonts.css for injection
const localCss = css.replace(
  /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\/([^/)]+\.woff2))\)/g,
  (_, fullUrl, filename) => `url(/fonts/${filename})`
);
fs.writeFileSync(path.join(OUT_DIR, "fonts.css"), localCss);
console.log("Wrote public/fonts/fonts.css");
