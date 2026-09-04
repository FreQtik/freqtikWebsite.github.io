"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
function strip(s) { return String(s).replace(/<[^>]+>/g, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim(); }
function attr(a, n) { const m = String(a).match(new RegExp("\\b" + n + "=(?:\\\"([^\\\"]*)\\\"|'([^']*)')", "i")); return m ? (m[1] || m[2] || "") : ""; }
function anchor(html, text) {
  const hits = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].map(m => m[0]).filter(a => strip(a) === text);
  if (hits.length !== 1) fail("Expected exactly one anchor labelled " + text + ", found " + hits.length + ".");
  return hits[0];
}
const d = fs.readFileSync(path.join(repo, "downloads.html"), "utf8");
const p = fs.readFileSync(path.join(repo, "impulse-anvil.html"), "utf8");
if (!p.includes("/downloads.html?platform=mac")) fail("Product Mac query route missing.");
if (d.includes("downloads.html#macos-beta") || p.includes("downloads.html#macos-beta")) fail("Cross-page Mac hash route remains.");
if (!d.includes("IA_MAC_TESTING_ROUTE_SAFE_START")) fail("Mac route-safe script marker missing.");
if (!d.includes("scrollRestoration") || !d.includes("pageshow")) fail("Mac route post-load scroll handling missing.");
const win = anchor(d, "Download Windows VST3");
if (attr(win, "href") !== "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_Windows_VST3.zip") fail("Windows direct v1.0.124 URL missing.");
if (!/ia-btn-primary/.test(attr(win, "class"))) fail("Windows VST3 primary styling lost.");
if (attr(anchor(d, "Windows Standalone"), "href") !== "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_Windows_Standalone.zip") fail("Windows Standalone direct v1.0.124 URL missing.");
console.log("PASS - Windows owns the top download/setup flow, direct v1.0.124 Windows URLs are intentional, and Mac query routing remains route-safe.");
