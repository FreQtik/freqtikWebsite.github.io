"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const repo = path.resolve(__dirname, "..", "..");

function fail(m) { throw new Error(m); }
function read(rel) { return fs.readFileSync(path.join(repo, rel), "utf8"); }
function stripTags(s) {
  return String(s)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}
function sha(rel) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(repo, rel))).digest("hex");
}
function findQuick(html) {
  const sections = [...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/gi)];
  const exact = sections.filter(m => /<h[1-4]\b[^>]*>\s*Quick setup(?:\s*[—-]\s*Copy\/Paste)?\s*<\/h[1-4]>/i.test(m[0]));
  if (exact.length === 1) return exact[0];
  const semantic = sections.filter(m => /\bQuick setup\b/i.test(stripTags(m[0])));
  if (semantic.length === 1) return semantic[0];
  fail("Windows Quick Setup section missing or ambiguous.");
}

const index = read("index.html");
const about = read("about.html");
const downloads = read("downloads.html");
const product = read("impulse-anvil.html");
const css = read("assets/freqtik-site.css");
const js = read("assets/freqtik-site.js");
const docs = read("docs/impulse-anvil/index.html");
const formats = read("docs/impulse-anvil/reference/formats-paths/index.html");
const llms = read("llms.txt");
const llmsFull = read("llms-full.txt");

const disliked = "Projects begin with a practical problem, an unusual creative possibility or a system that becomes easier to understand through direct interaction. The result may be a focused VST3, a browser game, a production framework or something in between.";
for (const [name,text] of [
  ["index.html",index],["about.html",about],["assets/freqtik-site.js",js],
  ["llms.txt",llms],["llms-full.txt",llmsFull]
]) {
  if (text.replace(/\s+/g," ").includes(disliked)) fail("Disliked sentence remains in " + name);
}

// Release and primary Windows truth.
if (!/Current\s+v1\.0\.123/i.test(downloads)) fail("Downloads current release is not v1.0.123.");
if (/Get license\s+(?:€|&euro;)\s*29\b/i.test(downloads)) fail("Stale €29 Downloads CTA returned.");
if (!/Get license\s+(?:€|&euro;)\s*49\b/i.test(downloads)) fail("€49 Downloads CTA missing.");

const winAnchor = [...downloads.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)]
  .map(m=>m[0]).find(a=>stripTags(a)==="Download Windows VST3");
if (!winAnchor) fail("Windows VST3 button missing.");
const winClass = winAnchor.match(/\bclass=["']([^"']+)["']/i);
const winHref = winAnchor.match(/\bhref=["']([^"']+)["']/i);
if (!winClass || !/\bia-btn-primary\b/.test(winClass[1])) fail("Windows is not the primary CTA.");
if (!winHref || !/releases\/latest\/download\/ImpulseAnvil_Windows_VST3\.zip$/i.test(winHref[1]))
  fail("Windows download target is incorrect.");

// Final Mac layout and direct assets.
const quick = findQuick(downloads);
const macStart = downloads.indexOf("<!-- IA_MAC_BETA_DOWNLOAD_START -->");
const macEnd = downloads.indexOf("<!-- IA_MAC_BETA_DOWNLOAD_END -->");
if (macStart < 0 || macEnd < macStart) fail("macOS testing section missing.");
if (downloads.slice(quick.index + quick[0].length, macStart).trim() !== "")
  fail("macOS testing is not directly below Windows Quick Setup.");
if (/href=["']\/downloads\.html\?platform=mac["']/i.test(downloads.slice(0, macStart)))
  fail("Mac CTA still competes above the Mac section.");

const directAssets = [
  "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.123/ImpulseAnvil_v1.0.123_macOS_AU_unsigned_testing.zip",
  "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.123/ImpulseAnvil_v1.0.123_macOS_VST3_unsigned_testing.zip",
  "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.123/ImpulseAnvil_v1.0.123_macOS_STANDALONE_unsigned_testing.zip"
];
for (const u of directAssets) if (!downloads.includes(u)) fail("Missing direct Mac asset: " + u);
if (!downloads.includes("View v1.0.123 release details")) fail("Mac release-details link missing.");
if (!downloads.includes("same demo/full-license model as Windows")) fail("Mac same-license explanation missing.");
if (!downloads.includes("notarized by Apple") || !downloads.includes("Open Anyway"))
  fail("Mac trust/setup disclosure missing.");

// Route safety and no bounce.
const rs = downloads.indexOf("<!-- IA_MAC_TESTING_ROUTE_SAFE_START -->");
const re = downloads.indexOf("<!-- IA_MAC_TESTING_ROUTE_SAFE_END -->");
if (rs < 0 || re < rs) fail("Mac route-safe handler missing.");
const route = downloads.slice(rs,re);
if (route.includes("DOMContentLoaded")) fail("Old early DOMContentLoaded scroll remains.");
if (!route.includes('window.addEventListener("pageshow", finishMacRoute, { once: true })'))
  fail("Mac route does not use one final pageshow scroll.");
if (!route.includes('window.history.scrollRestoration = "manual"'))
  fail("Mac-only manual scroll restoration is missing.");

const cross = index + "\n" + product + "\n" + docs + "\n" + formats + "\n" + llms + "\n" + llmsFull + "\n" + js;
if (/downloads\.html#macos-(?:beta|testing)/i.test(cross))
  fail("Unsafe cross-page Mac hash link remains.");
for (const [name,text] of [["index",index],["product",product],["docs",docs],["formats",formats]]) {
  if (!text.includes("/downloads.html?platform=mac")) fail(name + " lacks route-safe Mac discovery.");
}

// Reproducible proof.
const soundMatch = /<section\b[^>]*\bid=["']ia-sound["'][^>]*>[\s\S]*?<\/section>/i.exec(product);
if (!soundMatch) fail("#ia-sound section missing.");
const sound = soundMatch[0];
if (!sound.includes("IA_REPRODUCIBLE_AUDIO_PROOF_START")) fail("Reproducible Dry → IR → Anvil proof missing.");
if (!sound.includes("assets/audio/ia-proof-bad-synth-chords-dry.mp3")) fail("Dry proof source missing.");
if (!sound.includes("assets/audio/ia-proof-mystic-march-2-ir.wav")) fail("Mystic March 2 IR source missing.");
if (!sound.includes("assets/audio/ia-proof-bad-synth-chords-anvil.mp3")) fail("Anvil proof result missing.");
if (!/download=["']ImpulseAnvil_MysticMarch2\.wav["']/i.test(sound)) fail("Exact IR download filename missing.");
if (sound.indexOf("IA_REPRODUCIBLE_AUDIO_PROOF_START") >= sound.indexOf("ia-audio-grid"))
  fail("Featured proof must precede existing examples.");
if (!sound.includes("More transformations")) fail("Existing examples are not preserved under More transformations.");

const expectedHashes = {
  "assets/audio/ia-proof-bad-synth-chords-dry.mp3":"41dd840f5e0f65213d5c66a3d1587e1874a510fea6e1310fdb1652aab33056de",
  "assets/audio/ia-proof-bad-synth-chords-anvil.mp3":"d545fd4f93870c6044d32e10698519c4653c997bd4b5572bab6aa4c670706893",
  "assets/audio/ia-proof-mystic-march-2-ir.wav":"b8bd17c3d5c36aaa8130761e400a7787a0775caa44db3af38fc2f0aa0ba05629"
};
for (const [rel,hash] of Object.entries(expectedHashes)) {
  if (!fs.existsSync(path.join(repo,rel))) fail("Audio asset missing: " + rel);
  if (sha(rel) !== hash) fail("Audio asset checksum mismatch: " + rel);
}
if (!css.includes("IA_REPRODUCIBLE_AUDIO_PROOF_FIX16_START")) fail("Audio proof styles missing.");

// Product navigation remains complete.
const setupMacLink = '<a class="ia-btn ia-btn-dark" href="/downloads.html?platform=mac">macOS Testing</a>';
const setupMacCount = product.split(setupMacLink).length - 1;
if (setupMacCount !== 1) fail("Product Setup must contain exactly one macOS Testing link; found " + setupMacCount);
if (!product.includes("ia-side-nav-complete")) fail("Complete product side navigation missing.");
const sections = [...product.matchAll(/<section\b[^>]*\bid=["'](ia-[^"']+)["']/gi)].map(m=>m[1]);
const unique = [...new Set(sections)];
const nav = product.match(/<nav\b[^>]*aria-label=["']Impulse Anvil floating chapter navigation["'][^>]*>[\s\S]*?<\/nav>/i);
if (!nav) fail("Product side navigation missing.");
for (const id of unique) {
  const count = (nav[0].split('data-ia-target="'+id+'"').length-1) +
                (nav[0].split("data-ia-target='"+id+"'").length-1);
  if (count !== 1) fail("Side navigation target mismatch for " + id + ": " + count);
}

console.log("PASS - FINAL SITE STATE: Windows-first Downloads, macOS testing directly below Quick Setup with stable routing and exact direct assets, reproducible Dry → IR → Anvil proof, complete product navigation, and full removal of the disliked About sentence.");
