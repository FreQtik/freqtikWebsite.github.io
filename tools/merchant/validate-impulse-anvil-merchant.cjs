"use strict";
const fs = require("fs");
const path = require("path");
const repo = path.resolve(__dirname, "..", "..");
function fail(m) { throw new Error(m); }
const feed = fs.readFileSync(path.join(repo, "google-merchant-feed.xml"), "utf8");
if (!/<g:price>\s*49\.00 EUR\s*<\/g:price>/i.test(feed)) fail("Merchant €49 price missing.");
if (!/<g:section_name>\s*Current release\s*<\/g:section_name>[\s\S]*?<g:attribute_name>\s*Version\s*<\/g:attribute_name>[\s\S]*?<g:attribute_value>\s*1\.0\.124\s*<\/g:attribute_value>/i.test(feed)) fail("Merchant current-release version is not 1.0.124.");
if (!/21/.test(feed)) fail("Merchant morph relationship metadata missing.");
console.log("PASS - Merchant feed keeps €49 and now reports v1.0.124 as the current release.");
