"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
function strip(s) { return String(s).replace(/<[^>]+>/g, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim(); }
function attr(a, n) { const m = String(a).match(new RegExp("\\b" + n + "=(?:\\\"([^\\\"]*)\\\"|'([^']*)')", "i")); return m ? (m[1] || m[2] || "") : ""; }
function anchors(html, text) { return [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)].map(m => m[0]).filter(a => strip(a) === text); }
const d = fs.readFileSync(path.join(repo, "downloads.html"), "utf8");
const js = fs.existsSync(path.join(repo, "assets", "freqtik-site.js")) ? fs.readFileSync(path.join(repo, "assets", "freqtik-site.js"), "utf8") : "";
const vst3s = anchors(d, "Download Windows VST3");
const stands = anchors(d, "Windows Standalone");
if (vst3s.length !== 1) fail("Expected exactly one Windows VST3 CTA, found " + vst3s.length + ".");
if (stands.length !== 1) fail("Expected exactly one Windows Standalone CTA, found " + stands.length + ".");
if (d.indexOf("Windows Standalone") < d.indexOf("Download Windows VST3")) fail("Windows Standalone appears before primary VST3.");
if (!/ia-btn-primary/.test(attr(vst3s[0], "class"))) fail("VST3 is not primary.");
if (attr(vst3s[0], "href") !== "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_Windows_VST3.zip") fail("Windows VST3 href stale.");
if (attr(stands[0], "href") !== "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_Windows_Standalone.zip") fail("Windows Standalone href stale.");
const stale = /Current(?:\s|&nbsp;|&#160;|<[^>]*>)*1\.0\.122(?:\s|&nbsp;|&#160;|<[^>]*>)*package(?:\s|&nbsp;|&#160;|<[^>]*>)*includes(?:\s|&nbsp;|&#160;|<[^>]*>)*Omni(?:\s|&nbsp;|&#160;|<[^>]*>)*Path\./i;
if (stale.test(d) || stale.test(js)) fail("Obsolete 1.0.122 Omni Path notice remains.");
console.log("PASS - Windows VST3 remains primary, Windows Standalone uses the direct v1.0.124 ZIP, and the obsolete 1.0.122 notice is gone.");
