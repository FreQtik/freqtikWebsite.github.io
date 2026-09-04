"use strict";
const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..", "..");
function fail(message) { throw new Error(message); }
function read(rel) { return fs.readFileSync(path.join(repo, rel), "utf8"); }

const product = read("impulse-anvil.html");
const css = read("assets/freqtik-site.css");
const sitemap = read("sitemap.xml");

if (!product.includes("ia-single-ir-positioning")) fail("Single-IR product section missing.");
if (!product.includes("IA_08_IR_A_Focus")) fail("Panel A focus image reference missing.");
if (!product.includes("Shape the IR before anything starts moving.")) fail("Single-IR heading missing.");

const requiredCss = [
  "IA_SINGLE_IR_PANEL_LAYOUT_FIX24R5",
  "width:min(1120px, calc(100vw - 32px))",
  "margin:clamp(3rem,5vw,5rem) auto",
  "grid-column:1 / -1",
  "justify-self:center",
  "grid-template-columns:1fr",
  "max-width:980px",
  "grid-template-columns:repeat(3,minmax(0,1fr))",
  "@media (max-width:1120px)",
  "@media (max-width:980px)",
  "@media (max-width:680px)",
  "@media (max-width:420px)"
];

for (const needle of requiredCss) {
  if (!css.includes(needle)) fail("Layout CSS missing: " + needle);
}

if (css.includes("grid-template-columns:minmax(260px,1.05fr) minmax(0,1.15fr)")) {
  fail("Old side-column layout is still active.");
}

const loc = "<loc>https://freqtik.com/impulse-anvil.html</loc>";
const locIndex = sitemap.indexOf(loc);
if (locIndex < 0) fail("Sitemap product page block missing.");
const sitemapWindow = sitemap.slice(Math.max(0, locIndex - 500), locIndex + 1200);
if (!sitemapWindow.includes("<lastmod>2026-09-05</lastmod>")) {
  fail("Product sitemap lastmod is stale.");
}

console.log("PASS - FIX24R5 centers the single-IR module, enlarges the Panel A image, stacks explanation cards safely and keeps responsive breakpoints.");
