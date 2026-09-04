"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
function read(rel) { return fs.readFileSync(path.join(repo, rel), "utf8"); }
function strip(s) {
  return String(s).replace(/<!--[^]*?-->/g, " ").replace(/<script\b[^]*?<\/script>/gi, " ").replace(/<style\b[^]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}
function attr(a, n) {
  const m = String(a).match(new RegExp("\\b" + n + "=(?:\\\"([^\\\"]*)\\\"|'([^']*)')", "i"));
  return m ? (m[1] || m[2] || "") : "";
}
function anchors(html, text) {
  return [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].map(m => m[0]).filter(a => strip(a) === text);
}
function oneAnchor(html, text) {
  const found = anchors(html, text);
  if (found.length !== 1) fail("Expected exactly one anchor labelled " + text + ", found " + found.length + ".");
  return found[0];
}
function productJsonLd(html) {
  let found = null;
  for (const m of html.matchAll(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi)) {
    try {
      const o = JSON.parse(m[1].trim());
      const types = Array.isArray(o["@type"]) ? o["@type"] : [o["@type"]];
      if (types.includes("Product")) found = o;
    } catch (_) {}
  }
  if (!found) fail("Product JSON-LD missing.");
  return found;
}
function sitemapDate(xml, url) {
  const block = [...xml.matchAll(/<url\b[^>]*>[\s\S]*?<\/url>/gi)].find(m => {
    const loc = m[0].match(/<loc>\s*([^<]+?)\s*<\/loc>/i);
    return loc && loc[1].trim() === url;
  });
  if (!block) fail("Sitemap URL missing: " + url);
  const lm = block[0].match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i);
  return lm ? lm[1].trim() : "";
}

const d = read("downloads.html");
const p = read("impulse-anvil.html");
const docs = read("docs/impulse-anvil/index.html");
const formats = read("docs/impulse-anvil/reference/formats-paths/index.html");
const searchRaw = read("docs/impulse-anvil/search-index.json");
const feed = read("google-merchant-feed.xml");
const llms = read("llms.txt");
const llmsFull = read("llms-full.txt");
const sitemap = read("sitemap.xml");

if (!/Current\s+v1\.0\.124/i.test(d)) fail("Downloads current release is not v1.0.124.");
if (/Current\s+v1\.0\.123/i.test(d)) fail("Downloads still exposes v1.0.123 as current.");
const b124 = d.match(/<details\b[^>]*>\s*<summary>\s*v1\.0\.124\b[\s\S]*?<\/details>/i);
const b123 = d.match(/<details\b[^>]*>\s*<summary>\s*v1\.0\.123\b[\s\S]*?<\/details>/i);
if (!b124) fail("v1.0.124 changelog block missing.");
if (!b123) fail("v1.0.123 historical changelog block missing.");
if (!/Current release/i.test(b124[0])) fail("v1.0.124 is not marked current.");
if (/Current release/i.test(b123[0])) fail("v1.0.123 is still marked current.");
if (d.indexOf("v1.0.124") > d.indexOf("v1.0.123")) fail("v1.0.124 changelog does not appear before v1.0.123.");
for (const phrase of ["playback and transport stability", "Normalize and IR In", "spectral Morph", "Omni Path", "IR Browser"]) {
  if (!b124[0].includes(phrase)) fail("v1.0.124 changelog missing user-facing note: " + phrase);
}

const winVst3 = oneAnchor(d, "Download Windows VST3");
const winStandalone = oneAnchor(d, "Windows Standalone");
if (attr(winVst3, "href") !== "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_Windows_VST3.zip") fail("Windows VST3 direct URL is stale.");
if (attr(winStandalone, "href") !== "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_Windows_Standalone.zip") fail("Windows Standalone direct URL is stale.");
if (!/ia-btn-primary/.test(attr(winVst3, "class"))) fail("Windows VST3 lost primary styling.");
if (d.indexOf("Download Windows VST3") > d.indexOf("Windows Standalone")) fail("Standalone appears before primary Windows VST3.");

for (const pair of [
  ["Download AU", "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_AU_unsigned_testing.zip"],
  ["Download VST3", "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_VST3_unsigned_testing.zip"],
  ["Download Standalone", "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_Standalone_unsigned_testing.zip"]
]) {
  const a = oneAnchor(d, pair[0]);
  if (attr(a, "href") !== pair[1]) fail("macOS direct URL stale for " + pair[0]);
}
if (!d.includes("View v1.0.124 release details")) fail("v1.0.124 release details label missing.");

const product = productJsonLd(p);
if (String(product.softwareVersion) !== "1.0.124") fail("Product softwareVersion stale.");
if (String(product.releaseNotes) !== "https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.124") fail("Product releaseNotes stale.");
if (!product.offers || String(product.offers.price) !== "49.00") fail("Product €49 price invariant lost.");

if (!p.includes("NFNTsQ2_1hQ")) fail("Product video lost.");
if (!p.includes("impulse-anvil-product-showcase.webp")) fail("Product video poster lost.");
if (!p.includes("IA_REPRODUCIBLE_AUDIO_PROOF_START")) fail("Reproducible audio proof marker lost.");
if (!p.includes("ia-side-nav-complete")) fail("Complete product side navigation marker lost.");
if (!p.includes("/downloads.html?platform=mac")) fail("Route-safe Mac discovery link lost.");

if (!docs.includes("Current documented release: Impulse Anvil 1.0.124.")) fail("Docs current documented release is stale.");
if (!formats.includes("Impulse Anvil 1.0.124")) fail("Formats/Paths docs current release is stale.");
JSON.parse(searchRaw);
if (!searchRaw.includes("1.0.124")) fail("Docs search index does not contain v1.0.124.");

if (!/<g:price>\s*49\.00 EUR\s*<\/g:price>/i.test(feed)) fail("Merchant €49 price lost.");
if (!/<g:section_name>\s*Current release\s*<\/g:section_name>[\s\S]*?<g:attribute_name>\s*Version\s*<\/g:attribute_name>[\s\S]*?<g:attribute_value>\s*1\.0\.124\s*<\/g:attribute_value>/i.test(feed)) fail("Merchant current version stale.");

if (!llms.includes("- Current release: 1.0.124")) fail("llms.txt current release stale.");
if (!llmsFull.includes("1.0.124")) fail("llms-full.txt current release stale.");

for (const url of [
  "https://freqtik.com/",
  "https://freqtik.com/downloads.html",
  "https://freqtik.com/impulse-anvil.html",
  "https://freqtik.com/docs/impulse-anvil/",
  "https://freqtik.com/docs/impulse-anvil/reference/formats-paths/"
]) {
  if (sitemapDate(sitemap, url) < "2026-09-04") fail("Sitemap lastmod stale: " + url);
}

console.log("PASS - Impulse Anvil v1.0.124 release truth, direct downloads, user-facing changelog, docs, structured data, Merchant metadata and discovery files are synchronized.");
