"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const p = fs.readFileSync(path.join(repo, "impulse-anvil.html"), "utf8");
if (!p.includes("NFNTsQ2_1hQ")) fail("Product video ID missing.");
if (!p.includes("youtube-nocookie.com")) fail("Privacy-conscious YouTube embed target missing.");
if (!p.includes("IA_REPRODUCIBLE_AUDIO_PROOF_START")) fail("Audio proof marker missing after video integration.");
if (p.indexOf("NFNTsQ2_1hQ") > p.indexOf("IA_REPRODUCIBLE_AUDIO_PROOF_START")) fail("Product video no longer appears before audio proof.");
console.log("PASS - Product video remains before the audio proof and uses the privacy-conscious embed target.");
