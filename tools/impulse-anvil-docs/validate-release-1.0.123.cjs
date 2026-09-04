"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const d = fs.readFileSync(path.join(repo, "downloads.html"), "utf8");
const block = d.match(/<details\b[^>]*>\s*<summary>\s*v1\.0\.123\b[\s\S]*?<\/details>/i);
if (!block) fail("Historical v1.0.123 Stability Fix changelog entry missing.");
if (!/Stability Fix/i.test(block[0])) fail("Historical v1.0.123 title changed.");
if (!block[0].includes("Fixed a DAW freeze that could occur when removing an Impulse Anvil instance after the plug-in editor had been opened.")) fail("Historical v1.0.123 user-facing fix text missing.");
if (/Current release/i.test(block[0])) fail("Historical v1.0.123 is still marked current.");
console.log("PASS - v1.0.123 remains intact as historical release information beneath the current release.");
