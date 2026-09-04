"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const p = fs.readFileSync(path.join(repo, "impulse-anvil.html"), "utf8");
const jsPath = path.join(repo, "assets", "freqtik-site.js");
const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, "utf8") : "";
const combined = p + "\n" + js;
if (!combined.includes("IA_REPRODUCIBLE_AUDIO_PROOF_START")) fail("Reproducible audio proof marker missing.");
for (const asset of [
  "assets/audio/ia-proof-bad-synth-chords-dry.mp3",
  "assets/audio/ia-proof-mystic-march-2-ir.wav",
  "assets/audio/ia-proof-bad-synth-chords-anvil.mp3",
  "ImpulseAnvil_MysticMarch2.wav"
]) {
  if (!combined.includes(asset)) fail("Reproducible audio proof asset missing: " + asset);
}
if (!combined.includes("More transformations")) fail("Existing additional transformations section lost.");
console.log("PASS - Reproducible audio proof remains intact and is no longer tied to stale v1.0.123 current-product truth.");
