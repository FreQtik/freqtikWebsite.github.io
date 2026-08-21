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
const truth = read("tools/impulse-anvil-docs/GUIDED_LEARNING_SOURCE_TRUTH.md");

for (const [name, html] of [["Overview", overview], ["Quickstart", quick], ["Morph", morph], ["Guided Learning", guided]]) {
  if (!html.includes('/docs/impulse-anvil/assets/learning.css'))
    fail(name + " does not load learning.css.");
  if (!html.includes('/docs/impulse-anvil/assets/learning.js'))
    fail(name + " does not load learning.js.");
}

const questIds = [...guided.matchAll(/data-learning-quest="([^"]+)"/g)].map(m => m[1]);
const expectedQuestIds = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "B01", "B02", "B03", "M01", "M02", "M03", "L01", "L02", "L03", "L04", "L05", "L06", "L07", "R01", "R02"];
if (JSON.stringify(questIds) !== JSON.stringify(expectedQuestIds))
  fail("Guided Learning lesson IDs/order differ from the canonical full-course curriculum.");

const chapterIds = [...guided.matchAll(/data-learning-chapter="([^"]+)"/g)].map(m => m[1]);
if (JSON.stringify(chapterIds) !== JSON.stringify(["A","S","B","M","L","R"]))
  fail("Guided Learning chapter order must be A, S, B, M, L, R.");

for (const required of [
  "Full-workstation course",
  "In Impulse Anvil, any WAV can become an IR.",
  "Double-click the file",
  "Moving a Color knob turns that Color on automatically.",
  "Texture Depth",
  "500 ms",
  "OUT Normalize manages the loudness of the final IR automatically.",
  "Dry/Wet, Wet Level and Out are only for how you listen to it inside the plugin, so those three aren't baked.",
  "Init / Reset Controls (keep IRs)",
  "Taste every Morph",
  "Without A→B Lerp, Morph gives you one static position.",
  "With A→B Lerp, the movement itself becomes part of the IR.",
  "Baking is not the end",
  "WHY I BUILT IT"
]) {
  if (!guided.includes(required))
    fail("Guided Learning is missing required human-first course truth: " + required);
}

for (const forbidden of [
  "compatible recordings creatively as convolution material",
  "frequency-domain magnitude representation",
  "facilitates non-linear temporal authoring",
  "acoustic identity extraction"
]) {
  if (guided.includes(forbidden))
    fail("Guided Learning regressed into technical/AI wording: " + forbidden);
}

if (!guided.includes("one second long"))
  fail("The first-course material-length teaching constraint is missing.");

if (!guided.includes("mouse wheel over the graph to make that Bell wider or narrower"))
  fail("EQ mouse-wheel teaching must describe Bell width/Q behavior.");

if (!guided.includes("Start a new drag while holding <strong>Shift</strong> for fine movement.") ||
    !guided.includes("Start a new drag while holding <strong>Ctrl</strong> for very fine movement."))
  fail("EDIT fine/very-fine drag instructions are missing.");

if (!guided.includes("End before Start") || !guided.includes("Fade Out +"))
  fail("EDIT reverse/Fade Out + lessons are incomplete.");

if (!guided.includes("Width = 0") || !guided.includes("Width = 1"))
  fail("OUT Width human explanation is incomplete.");

if (!guided.includes("<strong>Move Lerp Start.</strong> This decides where the A→B movement begins inside the IR.") ||
    !guided.includes("<strong>Move Lerp Time.</strong> This decides how long the movement takes.") ||
    !guided.includes("Make Lerp Time short and the change happens faster. Make it long and the movement spreads across more of the IR."))
  fail("L02 must teach Lerp Start as movement start and Lerp Time as movement duration.");

if (!guided.includes("Reset Color — then bring it back") ||
    !guided.includes("Now press <strong>Undo</strong> to bring your Color/Texture work back.") ||
    !guided.includes("Chapter 2 will use the complexity you just built."))
  fail("A10 must teach COLOR reset and immediately restore the learner's texture with Undo.");

if (!quick.includes("Using the free demo?") || !quick.includes("FREE DEMO PATH COMPLETE"))
  fail("The separate Quickstart must remain the explicit demo-safe path.");

if (!morph.includes("the free demo includes <strong>Time Morph</strong>") ||
    !morph.includes("The full license unlocks the rest of the Morph relationship library"))
  fail("Morph page demo/full truth has drifted.");

if (!learningJs.includes('const STORAGE_KEY = "freqtik.impulseAnvil.learning.v2"'))
  fail("Musician-First v2 curriculum must use its own learning.v2 progress namespace.");
if (learningJs.includes('const STORAGE_KEY = "freqtik.impulseAnvil.learning.v1"'))
  fail("Old learning.v1 namespace must not drive the new 34-lesson curriculum.");

if (!learningJs.includes('Show all lessons') || !learningJs.includes('Done ✓'))
  fail("Learning interaction language is not the v2 micro-lesson grammar.");

if (!learningJs.includes('quest.dataset.chapter !== next.dataset.chapter'))
  fail("Chapter-aware next-lesson navigation is missing.");

for (const forbidden of [
  "URL.createObjectURL", "data-learning-audio-file", "data-learning-audio-player",
  "XMLHttpRequest", "WebSocket(", "navigator.sendBeacon"
]) {
  if (learningJs.includes(forbidden))
    fail("Learning JS contains removed or network-capable primitive: " + forbidden);
}

for (const required of [
  "The author's original musician-language is the primary wording source.",
  "ONE CARD = ONE NEW IDEA + ONE PHYSICAL ACTION + ONE THING TO NOTICE",
  "DO FIRST → NAME SECOND → COMBINE THIRD",
  "Static Morph = one position.",
  "A→B Lerp = movement inside the IR.",
  "bump the local progress namespace"
]) {
  if (!grammar.includes(required))
    fail("Human-first grammar missing required v2 rule: " + required);
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

if (!guided.includes("Show all lessons"))
  fail("Soft-gate escape hatch is missing.");

if (/certif(?:y|ied|ication)/i.test(guided))
  fail("Guided Learning should not imply certification.");

const jsPath = path.join(docs, "assets", "learning.js");
const syntax = cp.spawnSync(process.execPath, ["--check", jsPath], { encoding: "utf8" });
if (syntax.status !== 0)
  fail("learning.js failed node --check:\n" + (syntax.stderr || syntax.stdout));

console.log("PASS - Impulse Anvil musician-first Guided Learning v2 validation.");
