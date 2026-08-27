"use strict";

const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
const FIX = "Fixed a DAW freeze that could occur when removing an Impulse Anvil instance after the plug-in editor had been opened.";
function fail(m) { throw new Error(m); }
function read(rel) { return fs.readFileSync(path.join(repo, rel), "utf8"); }

const downloads = read("downloads.html");
const product = read("impulse-anvil.html");
const docs = read("docs/impulse-anvil/index.html");
const formats = read("docs/impulse-anvil/reference/formats-paths/index.html");
const search = JSON.parse(read("docs/impulse-anvil/search-index.json"));
const feed = read("google-merchant-feed.xml");
const llms = read("llms.txt");
const llmsFull = read("llms-full.txt");
const sitemap = read("sitemap.xml");

if (!downloads.includes("Current v1.0.123")) fail("Downloads current version is not 1.0.123.");
if (!downloads.includes("v1.0.123 &mdash; Stability Fix")) fail("Downloads v1.0.123 changelog missing.");
if (!downloads.includes(FIX)) fail("Downloads v1.0.123 fix text missing.");
if (/Get license\s+(?:€|&euro;)\s*29\b/i.test(downloads)) fail("Downloads still contains stale €29 license CTA.");
if (!/Get license\s+(?:€|&euro;)\s*49\b/i.test(downloads)) fail("Downloads €49 license CTA missing.");

const b122 = downloads.match(/<details\b[^>]*>\s*<summary>v1\.0\.122\b[\s\S]*?<\/details>/i);
if (!b122) fail("v1.0.122 changelog history missing.");
if (/ia-version-pill[^>]*>\s*Current release/i.test(b122[0])) fail("v1.0.122 is still marked Current release.");

if (!docs.includes("Current documented release: Impulse Anvil 1.0.123.")) fail("Docs Overview current release is not 1.0.123.");
if (!docs.includes(FIX)) fail("Docs Overview stability note missing.");
if (!formats.includes("Impulse Anvil 1.0.123")) fail("Formats & Paths current version is not 1.0.123.");

const overview = search.find(x => x && x.url === "/docs/impulse-anvil/");
const formatRef = search.find(x => x && x.url === "/docs/impulse-anvil/reference/formats-paths/");
if (!overview || !String(overview.text).includes("1.0.123") || !String(overview.text).includes(FIX)) fail("Docs Overview search record is stale.");
if (!formatRef || !String(formatRef.text).includes("1.0.123")) fail("Formats & Paths search record is stale.");

const scripts = [...product.matchAll(/<script\s+type=[\"']application\/ld\+json[\"']\s*>([\s\S]*?)<\/script>/gi)];
let p = null;
for (const m of scripts) {
  try {
    const o = JSON.parse(m[1].trim());
    const types = Array.isArray(o["@type"]) ? o["@type"] : [o["@type"]];
    if (types.includes("Product")) {
      if (p) fail("Multiple Product JSON-LD blocks.");
      p = o;
    }
  } catch (_) {}
}
if (!p) fail("Product JSON-LD missing.");
if (String(p.softwareVersion) !== "1.0.123") fail("Product JSON-LD softwareVersion is stale.");
if (String(p.releaseNotes) !== "https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.123") fail("Product JSON-LD releaseNotes URL is stale.");
if (!p.offers || String(p.offers.price) !== "49.00") fail("Product JSON-LD €49 price invariant lost.");
if (!Array.isArray(p.additionalProperty) || !p.additionalProperty.some(x => x && /^(?:Current version|Current release|Version)$/i.test(String(x.name || "")) && String(x.value) === "1.0.123"))
  fail("Product JSON-LD current-version property missing.");

const versionDetail = [...feed.matchAll(/<g:product_detail>[\s\S]*?<\/g:product_detail>/gi)]
  .filter(m => /<g:section_name>\s*Current release\s*<\/g:section_name>/i.test(m[0]) && /<g:attribute_name>\s*Version\s*<\/g:attribute_name>/i.test(m[0]));
if (versionDetail.length !== 1 || !/<g:attribute_value>\s*1\.0\.123\s*<\/g:attribute_value>/i.test(versionDetail[0][0]))
  fail("Merchant feed current release is not 1.0.123.");
if (!feed.includes("<g:price>49.00 EUR</g:price>")) fail("Merchant feed €49 price invariant lost.");
if (feed.includes("<g:sale_price>")) fail("Merchant feed stale sale price returned.");

if (!llms.includes("- Current release: 1.0.123")) fail("llms.txt current release stale.");
if (!llms.includes(FIX)) fail("llms.txt stability fix missing.");
if (!llmsFull.includes("Impulse Anvil 1.0.123 is")) fail("llms-full.txt current release stale.");
if (!llmsFull.includes(FIX)) fail("llms-full.txt stability fix missing.");

function sitemapDate(url) {
  const blocks = [...sitemap.matchAll(/<url\b[^>]*>[\s\S]*?<\/url>/gi)];
  const block = blocks.find(m => {
    const loc = m[0].match(/<loc>\s*([^<]+?)\s*<\/loc>/i);
    return loc && loc[1].trim() === url;
  });
  if (!block) fail("Missing sitemap URL " + url);
  const lm = block[0].match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/i);
  return lm ? lm[1].trim() : "";
}
for (const url of [
  "https://freqtik.com/downloads.html",
  "https://freqtik.com/impulse-anvil.html",
  "https://freqtik.com/docs/impulse-anvil/",
  "https://freqtik.com/docs/impulse-anvil/reference/formats-paths/"
]) {
  if (sitemapDate(url) !== "2026-08-27") fail("Sitemap lastmod stale for " + url);
}

console.log("PASS - Impulse Anvil 1.0.123 release truth is synchronized across Downloads, docs, product structured data, Merchant feed, LLM discovery and sitemap.");
