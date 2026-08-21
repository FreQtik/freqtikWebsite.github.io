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