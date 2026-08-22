"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const repo = path.resolve(__dirname, "..", "..");
const docs = path.join(repo, "docs", "impulse-anvil");
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));

function fail(message) { throw new Error(message); }
function read(rel) {
  const p = path.join(repo, rel);
  if (!fs.existsSync(p)) fail("Missing: " + rel);
  return fs.readFileSync(p, "utf8");
}

const guidedUrl = "/docs/impulse-anvil/getting-started/guided-learning/";
const items = manifest.groups.flatMap(g => g.items);
const guidedItems = items.filter(x => x[0] === guidedUrl);
if (guidedItems.length !== 1 || guidedItems[0][1] !== "Guided Learning")
  fail("Guided Learning is missing or duplicated in the canonical docs manifest.");

const guided = read("docs/impulse-anvil/getting-started/guided-learning/index.html");
const overview = read("docs/impulse-anvil/index.html");
const quick = read("docs/impulse-anvil/getting-started/quickstart/index.html");
const morph = read("docs/impulse-anvil/sections/morph/index.html");
const learningJs = read("docs/impulse-anvil/assets/learning.js");
const grammar = read("tools/impulse-anvil-docs/HUMAN_FIRST_DOCS_GRAMMAR.md");
const truth = read("tools/impulse-anvil-docs/GUIDED_LEARNING_SOURCE_TRUTH.md");

for (const [name, page] of [["Overview", overview], ["Quickstart", quick], ["Morph", morph], ["Guided Learning", guided]]) {
  if (!page.includes('/docs/impulse-anvil/assets/learning.css'))
    fail(name + " does not load learning.css.");
  if (!page.includes('/docs/impulse-anvil/assets/learning.js'))
    fail(name + " does not load learning.js.");
}

if (!guided.includes('data-course-lobby') ||
    !guided.includes('href="/learn/impulse-anvil-basics/"') ||
    !guided.includes("But I want to know") ||
    !guided.includes("In Impulse Anvil, any WAV can become an IR.") ||
    !guided.includes("try a sound or IR around one second long"))
  fail("Guided Learning lobby is incomplete.");

if (guided.includes("data-learning-quest=") ||
    guided.includes("data-learning-show-all") ||
    guided.includes("Your learning history"))
  fail("Guided Learning still contains the old permanently rendered course.");

if (/\bmaterial\b/i.test(guided))
  fail('Guided Learning lobby must use sound / IR / file language, not "material".');

if (!quick.includes("Using the free demo?") ||
    !quick.includes("FREE DEMO PATH COMPLETE"))
  fail("The 5-Minute Quickstart must remain the explicit demo-safe path.");

if (!morph.includes("the free demo includes <strong>Time Morph</strong>") ||
    !morph.includes("The full license unlocks the rest of the Morph relationship library"))
  fail("Morph page demo/full truth has drifted.");

const modes = [...morph.matchAll(/data-morph-mode="([^"]+)"/g)].map(m => m[1]);
const expectedModes = [
  "Time Morph","Spectral","Spectral BandSwap","Spectral ZigZag",
  "Stereo Slot Swap","Mid/Side Boundary",
  "Raw Difference","Aligned Difference","Matched Residual","Spectral Carve",
  "Similarity Residual","Common","Unique A","Unique B","Difference Focus",
  "Spectro-Temporal Residual","Nest","Transfer","Ghost","Eclipse","Spectral Time Shear"
];
if (JSON.stringify(modes) !== JSON.stringify(expectedModes))
  fail("Morph page no longer contains the exact current 21-mode order.");

if (!learningJs.includes(
  '"impulse-response": "An IR (impulse response) is basically a recording of what a space or system does after a tiny click. Use that recording on another sound and the sound takes on its tone, reflections and tail. In Anvil, ordinary sounds can be used as IRs too."'
))
  fail('The "But I want to know" IR explanation is missing or has drifted.');

for (const forbidden of ["XMLHttpRequest", "WebSocket(", "navigator.sendBeacon"]) {
  if (learningJs.includes(forbidden))
    fail("Global learning JS contains network-capable primitive: " + forbidden);
}

for (const required of [
  "The author's original musician-language is the primary wording source.",
  "ONE CARD = ONE NEW IDEA + ONE PHYSICAL ACTION + ONE THING TO NOTICE",
  "Static Morph = one position.",
  "A→B Lerp = movement inside the IR.",
  "Guided Learning page = course lobby",
  "Sound first. IR second.",
  "Certificate of Completion"
]) {
  if (!grammar.includes(required))
    fail("Human-first grammar missing course rule: " + required);
}

for (const required of [
  "IRLibraryOverlay::listBoxItemDoubleClicked",
  "Moving a Color Time/Offset/Amount slider automatically enables that Color voice.",
  "OUT Normalize defaults ON.",
  "Dry/Wet, Wet Level and Out are NOT baked.",
  "A→B Lerp — central teaching truth",
  "Static Morph = one position.",
  "A→B Lerp = movement inside the IR."
]) {
  if (!truth.includes(required))
    fail("Source-truth ledger missing: " + required);
}

// FIX6: discovery/search consistency guard
const searchIndex = JSON.parse(read("docs/impulse-anvil/search-index.json"));
const searchEntry = url => searchIndex.filter(x => x && x.url === url);
const guidedSearchEntries = searchEntry("/docs/impulse-anvil/getting-started/guided-learning/");
if (guidedSearchEntries.length !== 1) fail("Guided Learning docs-search entry is missing or duplicated.");
const guidedSearchText = String(guidedSearchEntries[0].text || "");
for (const forbidden of ["Show all quests", "0 / 9 quests complete", "QUEST 01 Ready", "QUEST 01 Locked"]) {
  if (guidedSearchText.includes(forbidden)) fail("Guided Learning docs-search index is stale: " + forbidden);
}
for (const required of ["BASICS COURSE", "34 hands-on lessons", "future lessons stay locked"]) {
  if (!guidedSearchText.includes(required)) fail("Guided Learning docs-search index is missing current course copy: " + required);
}
const overviewSearchEntries = searchEntry("/docs/impulse-anvil/");
if (overviewSearchEntries.length !== 1) fail("Docs Overview search entry is missing or duplicated.");
if (String(overviewSearchEntries[0].text || "").includes("Work through short optional quests"))
  fail("Docs Overview search entry still contains the legacy Guided Learning card copy.");
const sitemap = read("sitemap.xml");
for (const required of [
  "https://freqtik.com/docs/impulse-anvil/getting-started/guided-learning/",
  "https://freqtik.com/learn/impulse-anvil-basics/"
]) if (!sitemap.includes(`<loc>${required}</loc>`)) fail("sitemap.xml is missing learning URL: " + required);
const robots = read("robots.txt");
if (!robots.includes("Sitemap: https://freqtik.com/sitemap.xml")) fail("robots.txt no longer advertises sitemap.xml.");
const courseShell = read("learn/impulse-anvil-basics/index.html");
for (const required of [
  `<meta name="robots" content="index, follow, max-image-preview:large">`,
  `<link rel="canonical" href="https://freqtik.com/learn/impulse-anvil-basics/">`,
  `"@type":"Course"`
]) if (!courseShell.includes(required)) fail("Course discoverability metadata missing: " + required);
for (const rel of ["llms.txt", "llms-full.txt"]) {
  if (!read(rel).includes("https://freqtik.com/learn/impulse-anvil-basics/"))
    fail(rel + " is missing the public Basics Course URL.");
}

// FIX7: Basics Course terminology consistency guard
for (const forbidden of ["Open the Guided Learning quests", "Show all quests", "0 / 9 quests complete"]) {
  if (morph.includes(forbidden)) fail("Morph docs contain legacy course terminology: " + forbidden);
}
if (!morph.includes("Open the Basics Course &rarr;"))
  fail("Morph docs are missing the Basics Course CTA.");
const morphSearchEntries = searchEntry("/docs/impulse-anvil/sections/morph/");
if (morphSearchEntries.length !== 1) fail("Morph docs-search entry is missing or duplicated.");
const morphSearchText = String(morphSearchEntries[0].text || "");
if (morphSearchText.includes("Open the Guided Learning quests"))
  fail("Morph docs-search entry contains legacy course terminology.");
if (!morphSearchText.includes("Open the Basics Course →"))
  fail("Morph docs-search entry is missing the Basics Course CTA.");

// FIX9: live-effect / preset / optional-Bake communication guard
const productPage = read("impulse-anvil.html");
const whatPage = read("docs/impulse-anvil/concepts/what-anvil-does/index.html");
const faqPage = read("docs/impulse-anvil/faq/index.html");
const bakePage = read("docs/impulse-anvil/bake/export/index.html");
const courseData = JSON.parse(read("assets/impulse-anvil-course/basics-v1.json"));
const courseById = Object.fromEntries(courseData.lessons.map(x => [x.id, x]));
if (!quick.includes("Start playback") || !quick.includes("You are already using the response"))
  fail("Quickstart must establish a playing track and optional Bake.");
if (!(guided.indexOf("data-course-launch") < guided.indexOf("ia-course-lobby-intro")) || !guided.includes("Before you start:"))
  fail("Guided Learning must present playback setup + Basics Course launch before the IR introduction.");
if (!overview.includes("ANVIL IS THE EFFECT") || !overview.includes("Save preset / optional Bake"))
  fail("Docs Overview lost the live-effect / optional-Bake mental model.");
if (!productPage.includes("ANVIL IS THE EFFECT") || !productPage.includes("New to Anvil? Start the Basics Course") || productPage.includes('id="ia-acoustic"') || productPage.includes("Can I record the body of a guitar or violin and use it as an IR?") || productPage.includes("Can I compare two instrument-body captures?"))
  fail("Product page live-effect/course CTA/acoustic-body scope guard failed.");
if (!whatPage.includes("You do not need another IR loader") || !faqPage.includes("ANVIL IS THE EFFECT") || !bakePage.includes("Bake is optional export"))
  fail("Docs live-effect/Bake semantics are incomplete.");
if (!courseById.A01.bodyHtml.includes("Start playback") || !courseById.B03.bodyHtml.includes("Preset = the whole Anvil setup") || !courseById.B03.bodyHtml.includes("Bake is different"))
  fail("Basics Course must teach playback and preset-vs-Bake without changing lesson IDs.");
for (const rel of ["llms.txt", "llms-full.txt"]) {
  const machine = read(rel);
  if (!machine.includes("no separate IR loader") || !machine.includes("preset"))
    fail(rel + " is missing live-effect/preset/Bake machine-readable truth.");
}
for (const url of [
  "/docs/impulse-anvil/",
  "/docs/impulse-anvil/getting-started/quickstart/",
  "/docs/impulse-anvil/getting-started/guided-learning/",
  "/docs/impulse-anvil/concepts/what-anvil-does/",
  "/docs/impulse-anvil/faq/",
  "/docs/impulse-anvil/bake/export/"
]) {
  const hits = searchEntry(url);
  if (hits.length !== 1) fail("FIX9 docs-search entry missing/duplicated: " + url);
}
if (!String(searchEntry("/docs/impulse-anvil/")[0].text || "").includes("ANVIL IS THE EFFECT"))
  fail("Docs-search Overview is missing the FIX9 live-effect rule.");

// FIX9R4: machine-readable acoustic-body prominence guard
for (const rel of ["llms.txt", "llms-full.txt"]) {
  const machineScope = read(rel);
  if (machineScope.includes("Acoustic bodies & comparison:"))
    fail(rel + " must keep Acoustic Bodies in deep docs, not the top-level machine-readable product highlights.");
}

// FIX10: optional-Bake semantic sync guard
const homePageFix10 = read("index.html");
for (const required of [
  "hear the result immediately while you work",
  "<h3>Keep it your way</h3>",
  "Save the complete setup as a preset",
  "Bake the response when you want a portable WAV"
]) if (!homePageFix10.includes(required)) fail("Homepage lost optional-Bake semantic rule: " + required);
for (const forbidden of [
  "keep that response as reusable WAV IR material",
  "<h3>Keep the result</h3>",
  "Refine the response, Bake it as a portable WAV IR"
]) if (homePageFix10.includes(forbidden)) fail("Homepage contains legacy Bake-as-destination copy: " + forbidden);
for (const required of [
  "first useful transformation",
  "Bake can export the response as a WAV"
]) if (!overview.includes(required)) fail("Docs Overview lost FIX10 wording: " + required);
for (const forbidden of ["first useful Bake", "Bake keeps it."]) {
  if (overview.includes(forbidden)) fail("Docs Overview contains legacy Bake-as-destination wording: " + forbidden);
}
const overviewSearchFix10 = String(searchEntry("/docs/impulse-anvil/")[0].text || "");
for (const required of ["first useful transformation", "Bake can export the response as a WAV"]) {
  if (!overviewSearchFix10.includes(required)) fail("Docs-search Overview is missing FIX10 wording: " + required);
}
for (const forbidden of ["first useful Bake", "Bake keeps it."]) {
  if (overviewSearchFix10.includes(forbidden)) fail("Docs-search Overview contains legacy FIX10 wording: " + forbidden);
}

const courseValidator = path.join(__dirname, "validate-course-basics.cjs");
const courseCheck = cp.spawnSync(process.execPath, [courseValidator], {
  cwd: repo,
  encoding: "utf8"
});
if (courseCheck.status !== 0)
  fail("validate-course-basics.cjs failed:\n" + (courseCheck.stderr || courseCheck.stdout));

const jsPath = path.join(docs, "assets", "learning.js");
const syntax = cp.spawnSync(process.execPath, ["--check", jsPath], { encoding: "utf8" });
if (syntax.status !== 0)
  fail("learning.js failed node --check:\n" + (syntax.stderr || syntax.stdout));

console.log((courseCheck.stdout || "").trim());
console.log("PASS - Impulse Anvil Guided Learning lobby + course integration validation.");