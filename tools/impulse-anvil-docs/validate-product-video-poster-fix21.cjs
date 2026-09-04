"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const p = fs.readFileSync(path.join(repo, "impulse-anvil.html"), "utf8");
if (!p.includes("impulse-anvil-product-showcase.webp")) fail("Product video poster image missing.");
if (!p.includes("NFNTsQ2_1hQ")) fail("Product video ID missing.");
console.log("PASS - Product video poster is intact.");
