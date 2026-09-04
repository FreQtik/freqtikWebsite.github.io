"use strict";
const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..", "..");
function fail(message) { throw new Error(message); }
function read(rel) { return fs.readFileSync(path.join(repo, rel), "utf8"); }

const product = read("impulse-anvil.html");
const css = read("assets/freqtik-site.css");

const productNeedles = [
  "ia-single-ir-positioning",
  "Shape the IR before anything starts moving.",
  "One IR can already become something else",
  "Color bands with Offset and Texture Depth",
  "Each side can become a designed state",
  "Movement builds on those decisions",
  "An IR does not have to stay the IR you loaded.",
  "IA_08_IR_A_Focus"
];

for (const needle of productNeedles) {
  if (!product.includes(needle)) fail("Single-IR section missing: " + needle);
}

if (!css.includes("IA_SINGLE_IR_POSITIONING_FIX24R5_START") &&
    !css.includes("IA_SINGLE_IR_POSITIONING_FIX24R4_START") &&
    !css.includes("IA_SINGLE_IR_POSITIONING_FIX24R3_START")) {
  fail("Single-IR CSS marker missing.");
}

console.log("PASS - FIX24R3 content validator is compatible with the newer centered Panel A layout.");
