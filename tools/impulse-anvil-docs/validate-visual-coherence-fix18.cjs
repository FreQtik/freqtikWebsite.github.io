"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const cssPath = path.join(repo, "assets", "freqtik-site.css");
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";
const p = fs.readFileSync(path.join(repo, "impulse-anvil.html"), "utf8");
if (css && !css.includes("IA_RESPONSIVE_COMMERCIAL_POLISH_FIX19_START")) fail("Responsive commercial polish marker missing.");
if (!p.includes("IA_REPRODUCIBLE_AUDIO_PROOF_START")) fail("Audio proof markup missing.");
console.log("PASS - Visual/audio proof structure remains present.");
