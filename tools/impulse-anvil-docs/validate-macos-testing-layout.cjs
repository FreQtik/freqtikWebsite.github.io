"use strict";

const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m){ throw new Error(m); }
function stripTags(s){
  return String(s).replace(/<br\s*\/?>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/\s+/g," ").trim();
}
function quickSection(html){
  const sections=[...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/gi)];
  const exact=sections.filter(m=>/<h[1-4]\b[^>]*>\s*Quick setup\s*<\/h[1-4]>/i.test(m[0]));
  if(exact.length===1) return exact[0];
  const semantic=sections.filter(m=>/\bQuick setup\b/i.test(stripTags(m[0])));
  if(semantic.length===1) return semantic[0];
  fail("Quick setup section is ambiguous or missing.");
}

const downloads=fs.readFileSync(path.join(repo,"downloads.html"),"utf8");
const MAC_START="<!-- IA_MAC_BETA_DOWNLOAD_START -->";
const MAC_END="<!-- IA_MAC_BETA_DOWNLOAD_END -->";

const quick=quickSection(downloads);
const macStart=downloads.indexOf(MAC_START);
const macEnd=downloads.indexOf(MAC_END);
if(macStart<0||macEnd<macStart) fail("macOS testing block missing.");
if(downloads.slice(quick.index+quick[0].length,macStart).trim()!=="")
  fail("macOS testing block is not directly below Windows Quick Setup.");

const preMac=downloads.slice(0,macStart);
if(/href=["']\/downloads\.html\?platform=mac["']/i.test(preMac))
  fail("macOS CTA still competes with Windows above Quick Setup.");

const win=[...downloads.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)]
  .map(m=>m[0]).find(a=>stripTags(a)==="Download Windows VST3");
if(!win) fail("Windows VST3 button missing.");
const cls=win.match(/\bclass=["']([^"']+)["']/i);
if(!cls||!/\bia-btn-primary\b/.test(cls[1])) fail("Windows VST3 is no longer the primary CTA.");

if(!downloads.includes('window.addEventListener("pageshow", finishMacRoute, { once: true })'))
  fail("Mac route is not delayed until pageshow.");
if(!downloads.includes('window.history.scrollRestoration = "manual"'))
  fail("Mac route does not disable browser scroll restoration for the explicit route.");
if(/DOMContentLoaded["'],\s*routeToMacTesting/i.test(downloads))
  fail("Old early Mac auto-scroll remains.");
if(!downloads.includes("Download macOS Testing Build"))
  fail("Mac testing download CTA missing.");
if(!downloads.includes("https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.123/ImpulseAnvil_v1.0.123_macOS_AU_unsigned_testing.zip"))
  fail("Direct macOS AU testing ZIP missing.");
if(!downloads.includes("https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.123/ImpulseAnvil_v1.0.123_macOS_VST3_unsigned_testing.zip"))
  fail("Direct macOS VST3 testing ZIP missing.");
if(!downloads.includes("https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.123/ImpulseAnvil_v1.0.123_macOS_STANDALONE_unsigned_testing.zip"))
  fail("Direct macOS Standalone testing ZIP missing.");
if(!downloads.includes("https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.123"))
  fail("v1.0.123 release-details link missing.");
if(!downloads.includes("https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.123"))
  fail("Mac testing GitHub release URL missing.");
if(!downloads.includes("notarized by Apple")||!downloads.includes("Open Anyway"))
  fail("macOS safety disclosure/setup guidance missing.");

console.log("PASS - Windows owns the top download/setup flow, macOS testing is directly below Windows Quick Setup, the Windows primary button is preserved, and Mac query routing performs one final post-load scroll without the previous down/up bounce.");
