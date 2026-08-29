"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m){ throw new Error(m); }
function read(rel){ return fs.readFileSync(path.join(repo, rel), "utf8"); }

const css = read("assets/freqtik-site.css");
const product = read("impulse-anvil.html");
const js = read("assets/freqtik-site.js");
const index = read("index.html");
const aboutPath = path.join(repo, "about.html");
const about = fs.existsSync(aboutPath) ? fs.readFileSync(aboutPath, "utf8") : "";

if (!css.includes("IA_VISUAL_COHERENCE_FIX18_START")) fail("FIX18 CSS block missing.");
if (!/\.ia-mac-beta-home\{display:inline-flex;align-items:flex-start;width:auto;max-width:min\(100%,780px\)\}/.test(css.replace(/\s+/g, ""))) fail("macOS discovery width override missing.");
if (!css.includes(".ia-repro-media")) fail("Repro media layout styles missing.");
if (!css.includes(".ia-repro-proof-grid{align-items:stretch}")) fail("Equal-height proof grid missing.");

for (const [name, text] of [["impulse-anvil.html", product], ["assets/freqtik-site.js", js]]) {
  if (!text.includes("IA_REPRODUCIBLE_AUDIO_PROOF_START")) fail(name + ": reproducible proof block missing.");
  const section = text.slice(text.indexOf("IA_REPRODUCIBLE_AUDIO_PROOF_START"), text.indexOf("IA_REPRODUCIBLE_AUDIO_PROOF_END"));
  const mediaCount = (section.match(/class=\"ia-repro-media\"/g) || []).length + (section.match(/class='ia-repro-media'/g) || []).length;
  if (mediaCount !== 3) fail(name + ": expected 3 .ia-repro-media wrappers, found " + mediaCount);
  if (!section.includes("ia-proof-bad-synth-chords-dry.mp3")) fail(name + ": dry proof source missing.");
  if (!section.includes("ia-proof-mystic-march-2-ir.wav")) fail(name + ": IR proof source missing.");
  if (!section.includes("ia-proof-bad-synth-chords-anvil.mp3")) fail(name + ": transformed proof source missing.");
  if (!section.includes("Download this IR · WAV")) fail(name + ": IR download CTA missing.");
}

const discoverySurface = [index, about, js].join("\n");
if (discoverySurface.includes("ia-mac-beta-home") && !css.includes("display:inline-flex")) fail("macOS discovery card visual fix missing.");

console.log("PASS - FIX18 visual coherence: Mac discovery callout is constrained, and the Dry → IR → Anvil audio proof uses aligned equal-height media rows.");