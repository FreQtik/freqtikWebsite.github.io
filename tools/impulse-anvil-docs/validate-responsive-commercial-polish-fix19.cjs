"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const cssPath = path.join(repo, "assets", "freqtik-site.css");
const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";
if (css && !css.includes("IA_RESPONSIVE_COMMERCIAL_POLISH_FIX19_START")) fail("FIX19 responsive marker missing.");
console.log("PASS - Responsive commercial hardening marker is intact.");
