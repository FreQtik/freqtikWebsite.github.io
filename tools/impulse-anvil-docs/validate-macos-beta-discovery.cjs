"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const home = fs.readFileSync(path.join(repo, "index.html"), "utf8");
const product = fs.readFileSync(path.join(repo, "impulse-anvil.html"), "utf8");
const downloads = fs.readFileSync(path.join(repo, "downloads.html"), "utf8");
const sitemap = fs.readFileSync(path.join(repo, "sitemap.xml"), "utf8");
if (!home.includes("/downloads.html?platform=mac") && !product.includes("/downloads.html?platform=mac")) fail("Mac testing discovery route missing.");
if (!downloads.includes("IA_MAC_BETA_DOWNLOAD_START")) fail("Mac testing download block marker missing.");
for (const u of ["https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_AU_unsigned_testing.zip", "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_VST3_unsigned_testing.zip", "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_Standalone_unsigned_testing.zip"]) {
  if (!downloads.includes(u)) fail("Mac direct testing asset missing: " + u);
}
for (const phrase of ["testing", "same demo/full-license", "not notarized"]) {
  if (!downloads.toLowerCase().includes(phrase.toLowerCase())) fail("Mac disclosure missing: " + phrase);
}
function sitemapDate(url) {
  const b = [...sitemap.matchAll(/<url\b[^>]*>[\s\S]*?<\/url>/gi)].find(m => m[0].includes("<loc>" + url + "</loc>"));
  if (!b) fail("Missing sitemap URL: " + url);
  const lm = b[0].match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i);
  return lm ? lm[1].trim() : "";
}
for (const url of ["https://freqtik.com/", "https://freqtik.com/downloads.html", "https://freqtik.com/impulse-anvil.html"]) {
  if (sitemapDate(url) < "2026-09-04") fail("Sitemap lastmod stale: " + url);
}
console.log("PASS - macOS testing build is discoverable and transparently disclosed, direct v1.0.124 testing assets are present, and sitemap lastmod is current.");
