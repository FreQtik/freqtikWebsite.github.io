"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const d = fs.readFileSync(path.join(repo, "downloads.html"), "utf8");
const quick = d.search(/Quick Setup/i);
const mac = d.indexOf("IA_MAC_BETA_DOWNLOAD_START");
const release = d.search(/Release notes/i);
if (quick < 0 || mac < 0 || release < 0) fail("Expected Windows Quick Setup, macOS block and Release notes.");
if (!(quick < mac && mac < release)) fail("macOS testing block is not below Windows Quick Setup and above Release notes.");
for (const u of ["https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_AU_unsigned_testing.zip", "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_VST3_unsigned_testing.zip", "https://github.com/FreQtik/freqtikWebsite.github.io/releases/download/v1.0.124/ImpulseAnvil_MacOS_Standalone_unsigned_testing.zip"]) {
  if (!d.includes(u)) fail("Current Mac direct URL missing: " + u);
}
console.log("PASS - Windows setup remains first, macOS testing follows it, and current direct Mac downloads are present.");
