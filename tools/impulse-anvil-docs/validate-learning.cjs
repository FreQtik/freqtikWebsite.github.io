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
const manifestItems = manifest.groups.flatMap(g => g.items);
const guidedItems = manifestItems.filter(x => x[0] === guidedUrl);
if (guidedItems.length !== 1 || guidedItems[0][1] !== "Guided Learning")
  fail("Guided Learning is missing or duplicated in the canonical docs manifest.");

const guided = read("docs/impulse-anvil/getting-started/guided-learning/index.html");
const overview = read("docs/impulse-anvil/index.html");
const quick = read("docs/impulse-anvil/getting-started/quickstart/index.html");
const morph = read("docs/impulse-anvil/sections/morph/index.html");
const learningJs = read("docs/impulse-anvil/assets/learning.js");
const learningCss = read("docs/impulse-anvil/assets/learning.css");
const grammar = read("tools/impulse-anvil-docs/HUMAN_FIRST_DOCS_GRAMMAR.md");

for (const [name, html] of [["Overview", overview], ["Quickstart", quick], ["Morph", morph], ["Guided Learning", guided]]) {
  if (!html.includes('/docs/impulse-anvil/assets/learning.css'))
    fail(name + " does not load learning.css.");
  if (!html.includes('/docs/impulse-anvil/assets/learning.js'))
    fail(name + " does not load learning.js.");
}

const questIds = [...guided.matchAll(/data-learning-quest="([^"]+)"/g)].map(m => m[1]);
const expectedQuestIds = ["01","02","03","04","05","06","07","08","09"];
if (JSON.stringify(questIds) !== JSON.stringify(expectedQuestIds))
  fail("Guided Learning quest IDs/order differ from 01..09.");

if (!guided.includes("Nothing is uploaded."))
  fail("Guided Learning local-audition privacy statement is missing.");

if (!learningJs.includes('const STORAGE_KEY = "freqtik.impulseAnvil.learning.v1"'))
  fail("Learning progress storage key is missing.");

if (!learningJs.includes("localStorage") || !learningJs.includes("URL.createObjectURL"))
  fail("Learning progress/local audition implementation is incomplete.");

for (const forbidden of ["XMLHttpRequest", "WebSocket(", "navigator.sendBeacon"]) {
  if (learningJs.includes(forbidden))
    fail("Learning layer unexpectedly contains network-capable primitive: " + forbidden);
}

const glossaryKeys = [
  "impulse-response", "convolution", "spectrum", "phase",
  "residual", "mid-side", "source-time"
];
for (const key of glossaryKeys) {
  if (!learningJs.includes(`"${key}":`))
    fail("Glossary definition missing: " + key);
}

const usedTerms = new Set();
for (const html of [overview, quick, morph, guided]) {
  for (const m of html.matchAll(/data-docs-term="([^"]+)"/g))
    usedTerms.add(m[1]);
}
for (const key of usedTerms) {
  if (!glossaryKeys.includes(key))
    fail("Page uses undefined glossary key: " + key);
}

const morphModes = [...morph.matchAll(/data-morph-mode="([^"]+)"/g)].map(m => m[1]);
const expectedModes = [
  "Time Morph","Spectral","Spectral BandSwap","Spectral ZigZag",
  "Stereo Slot Swap","Mid/Side Boundary",
  "Raw Difference","Aligned Difference","Matched Residual","Spectral Carve",
  "Similarity Residual","Common","Unique A","Unique B","Difference Focus",
  "Spectro-Temporal Residual","Nest","Transfer","Ghost","Eclipse","Spectral Time Shear"
];
if (JSON.stringify(morphModes) !== JSON.stringify(expectedModes))
  fail("Human-first Morph cards do not contain the exact 21 current mode names/order.");

const technicalDetailsCount = (morph.match(/<details>/g) || []).length;
if (technicalDetailsCount < 21)
  fail("Each Morph mode must retain a Technical details disclosure.");

for (const required of [
  "Never make the user learn the vocabulary before they are allowed to understand the idea.",
  "WHY → DO → NOTICE → UNDERSTAND → TECHNICAL DETAILS",
  "Gamification is a teaching aid, not a gate."
]) {
  if (!grammar.includes(required))
    fail("Human-first grammar missing required rule: " + required);
}

if (!guided.includes("Show all quests"))
  fail("Soft-gate escape hatch is missing.");

if (/certif(?:y|ied|ication)/i.test(guided))
  fail("Guided Learning should not imply certification.");

const jsPath = path.join(docs, "assets", "learning.js");
const syntax = cp.spawnSync(process.execPath, ["--check", jsPath], { encoding: "utf8" });
if (syntax.status !== 0)
  fail("learning.js failed node --check:\n" + (syntax.stderr || syntax.stdout));

console.log("PASS - Impulse Anvil human-first learning layer validation.");
