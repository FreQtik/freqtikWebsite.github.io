"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(message) { throw new Error(message); }
function read(rel) { return fs.readFileSync(path.join(repo, rel), "utf8"); }

const product = read("impulse-anvil.html");
const css = read("assets/freqtik-site.css");
const sitemap = read("sitemap.xml");

const requiredProduct = [
  '<!-- IA_SINGLE_IR_POSITIONING_FIX24R3_START -->',
  'data-ia-single-ir-positioning="fix24r3"',
  'Shape the IR before anything starts moving.',
  'Impulse Anvil does not need two untouched sources before it becomes useful.',
  'One IR can already become something else',
  'Color bands with Offset and Texture Depth',
  'Each side can become a designed state',
  'Movement builds on those decisions',
  'An IR does not have to stay the IR you loaded.',
  'IA_08_IR_A_Focus'
];

for (const needle of requiredProduct) {
  if (!product.includes(needle)) fail("Product page missing: " + needle);
}

if (!css.includes('/* IA_SINGLE_IR_POSITIONING_FIX24R3_START */')) fail("FIX24R3 CSS block missing.");
if (!css.includes('@media (max-width: 860px)')) fail("Responsive tablet/mobile breakpoint missing.");
if (!css.includes('@media (max-width: 420px)')) fail("Small-phone breakpoint missing.");

const loc = "<loc>https://freqtik.com/impulse-anvil.html</loc>";
const locIndex = sitemap.indexOf(loc);
if (locIndex < 0) fail("Sitemap product page block missing.");
const sitemapWindow = sitemap.slice(Math.max(0, locIndex - 500), locIndex + 1200);
if (!sitemapWindow.includes("<lastmod>2026-09-05</lastmod>")) {
  fail("Product sitemap lastmod is stale.");
}

console.log("PASS - FIX24R3 validates the single-IR workflow section, Panel A image reference, responsive CSS and sitemap lastmod.");
