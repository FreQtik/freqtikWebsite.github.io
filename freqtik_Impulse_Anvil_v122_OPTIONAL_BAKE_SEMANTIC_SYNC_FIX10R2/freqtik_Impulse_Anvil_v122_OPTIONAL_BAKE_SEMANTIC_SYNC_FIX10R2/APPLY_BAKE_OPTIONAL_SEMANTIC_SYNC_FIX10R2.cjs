"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

function fail(message) { throw new Error(message); }
function count(haystack, needle) { return haystack.split(needle).length - 1; }
function findRepo(start) {
  let dir = path.resolve(start);
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, "index.html")) &&
        fs.existsSync(path.join(dir, "impulse-anvil.html")) &&
        fs.existsSync(path.join(dir, "docs", "impulse-anvil", "index.html"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  fail("Could not locate repository root. Extract FIX10 somewhere inside freqtikWebsite.github.io and run it there.");
}
function read(repo, rel) {
  const p = path.join(repo, rel);
  if (!fs.existsSync(p)) fail("Missing required file: " + rel);
  return fs.readFileSync(p, "utf8");
}
function eolOf(text) { return text.includes("\r\n") ? "\r\n" : "\n"; }
function normalizeEol(text, eol) { return text.replace(/\r\n|\r|\n/g, eol); }
function replaceExactOnce(text, oldText, newText, label) {
  if (text.includes(newText)) {
    if (count(text, newText) !== 1) fail(label + ": new invariant is duplicated.");
    return text;
  }
  const n = count(text, oldText);
  if (n !== 1) fail(label + ": expected exactly one current invariant, found " + n + ".");
  return text.replace(oldText, newText);
}
function replaceCalloutByHeading(html) {
  const newBlock = '<div class="ia-callout"><h3>Keep it your way</h3><p>Keep using the response directly in Anvil. Save the complete setup as a preset, or Bake the response when you want a portable WAV to reuse or transform again.</p></div>';
  if (html.includes(newBlock)) {
    if (count(html, newBlock) !== 1) fail("Homepage Keep-it-your-way callout is duplicated.");
    return html;
  }
  const re = /<div class="ia-callout"><h3>Keep the result<\/h3><p>[\s\S]*?<\/p><\/div>/g;
  const hits = [...html.matchAll(re)];
  if (hits.length !== 1) fail("Homepage Keep-the-result callout is ambiguous or missing; found " + hits.length + ".");
  return html.replace(re, newBlock);
}
function replaceFeaturedIntro(html) {
  const marker = '<span class="ia-kicker">Featured audio software</span><h2>Impulse Anvil.</h2><p>';
  const start = html.indexOf(marker);
  if (start < 0 || html.indexOf(marker, start + marker.length) >= 0) fail("Homepage Featured Impulse Anvil intro anchor is missing or duplicated.");
  const bodyStart = start + marker.length;
  const end = html.indexOf("</p>", bodyStart);
  if (end < 0) fail("Homepage Featured Impulse Anvil intro paragraph is malformed.");
  const current = html.slice(bodyStart, end);
  const next = "Start with the sound already in your track. Impulse Anvil lets you design the response it passes through and hear the result immediately while you work. Save the setup as a preset, or Bake the response when you want a reusable WAV.";
  if (current === next) return html;
  if (!current.includes("Start with the sound already in your track.") || !current.includes("reusable WAV IR material"))
    fail("Homepage Featured Impulse Anvil intro has unexpected copy; refusing to overwrite it.");
  return html.slice(0, bodyStart) + next + html.slice(end);
}
function insertValidatorGuard(text) {
  if (text.includes("// FIX10: optional-Bake semantic sync guard")) return text;
  const marker = "const courseValidator = path.join(__dirname, \"validate-course-basics.cjs\");";
  if (count(text, marker) !== 1) fail("Validator insertion anchor is missing or ambiguous.");
  const guard = `// FIX10: optional-Bake semantic sync guard\nconst homePageFix10 = read("index.html");\nfor (const required of [\n  "hear the result immediately while you work",\n  "<h3>Keep it your way</h3>",\n  "Save the complete setup as a preset",\n  "Bake the response when you want a portable WAV"\n]) if (!homePageFix10.includes(required)) fail("Homepage lost optional-Bake semantic rule: " + required);\nfor (const forbidden of [\n  "keep that response as reusable WAV IR material",\n  "<h3>Keep the result</h3>",\n  "Refine the response, Bake it as a portable WAV IR"\n]) if (homePageFix10.includes(forbidden)) fail("Homepage contains legacy Bake-as-destination copy: " + forbidden);\nfor (const required of [\n  "first useful transformation",\n  "Bake can export the response as a WAV"\n]) if (!overview.includes(required)) fail("Docs Overview lost FIX10 wording: " + required);\nfor (const forbidden of ["first useful Bake", "Bake keeps it."]) {\n  if (overview.includes(forbidden)) fail("Docs Overview contains legacy Bake-as-destination wording: " + forbidden);\n}\nconst overviewSearchFix10 = String(searchEntry("/docs/impulse-anvil/")[0].text || "");\nfor (const required of ["first useful transformation", "Bake can export the response as a WAV"]) {\n  if (!overviewSearchFix10.includes(required)) fail("Docs-search Overview is missing FIX10 wording: " + required);\n}\nfor (const forbidden of ["first useful Bake", "Bake keeps it."]) {\n  if (overviewSearchFix10.includes(forbidden)) fail("Docs-search Overview contains legacy FIX10 wording: " + forbidden);\n}\n\n`;
  return text.replace(marker, guard + marker);
}

const repo = findRepo(__dirname);
console.log("Impulse Anvil v1.0.122 - Optional Bake Semantic Sync FIX10R2");
console.log("Repository: " + repo);
console.log("\nPreflight...");

const rels = [
  "index.html",
  "docs/impulse-anvil/index.html",
  "docs/impulse-anvil/search-index.json",
  "tools/impulse-anvil-docs/validate-learning.cjs"
];
const originals = new Map(rels.map(rel => [rel, fs.readFileSync(path.join(repo, rel))]));
const texts = new Map(rels.map(rel => [rel, originals.get(rel).toString("utf8")]));

// Semantic preflight: require the already-landed FIX9R4 architecture, not a brittle exact sentence.
const home0 = texts.get("index.html");
const docs0 = texts.get("docs/impulse-anvil/index.html");
const search0 = texts.get("docs/impulse-anvil/search-index.json");
const validator0 = texts.get("tools/impulse-anvil-docs/validate-learning.cjs");
if (!home0.includes("Start with what you have") || !home0.includes("Design what is missing"))
  fail("Homepage producer-first Impulse Anvil positioning is missing.");
if (!docs0.includes("ANVIL IS THE EFFECT") || !docs0.includes("Save preset / optional Bake"))
  fail("Docs Overview does not contain the FIX9 live-effect mental model.");
if (!search0.includes('"url": "/docs/impulse-anvil/"')) fail("Docs-search Overview entry is missing.");
if (!validator0.includes("// FIX9R4: machine-readable acoustic-body prominence guard"))
  fail("FIX9R4 validator architecture is missing; refusing to patch an unexpected baseline.");

// Sitemap is already current today; assert discoverability only, do not rewrite it.
const sitemap = read(repo, "sitemap.xml");
for (const url of ["https://freqtik.com/", "https://freqtik.com/docs/impulse-anvil/"]) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) fail("sitemap.xml is missing: " + url);
}

let home = replaceFeaturedIntro(home0);
home = replaceCalloutByHeading(home);

let docs = docs0;
docs = replaceExactOnce(
  docs,
  "and Bake keeps it.",
  "and Bake can export the response as a WAV.",
  "Docs Overview figure caption"
);
docs = replaceExactOnce(
  docs,
  "your first useful Bake",
  "your first useful transformation",
  "Docs Overview Quickstart card"
);

let search = search0;
search = replaceExactOnce(
  search,
  "and Bake keeps it.",
  "and Bake can export the response as a WAV.",
  "Docs-search Overview figure caption"
);
search = replaceExactOnce(
  search,
  "your first useful Bake",
  "your first useful transformation",
  "Docs-search Overview Quickstart card"
);

let validator = insertValidatorGuard(validator0);

const outputs = new Map([
  ["index.html", home],
  ["docs/impulse-anvil/index.html", docs],
  ["docs/impulse-anvil/search-index.json", search],
  ["tools/impulse-anvil-docs/validate-learning.cjs", validator]
]);

// In-memory final invariants before any write.
for (const required of ["hear the result immediately while you work", "<h3>Keep it your way</h3>", "Save the complete setup as a preset", "Bake the response when you want a portable WAV"])
  if (!home.includes(required)) fail("Homepage in-memory invariant missing: " + required);
for (const forbidden of ["keep that response as reusable WAV IR material", "<h3>Keep the result</h3>", "Refine the response, Bake it as a portable WAV IR"])
  if (home.includes(forbidden)) fail("Homepage stale invariant remains: " + forbidden);
for (const required of ["first useful transformation", "Bake can export the response as a WAV"])
  if (!docs.includes(required) || !search.includes(required)) fail("Docs/search in-memory invariant missing: " + required);
for (const forbidden of ["first useful Bake", "Bake keeps it."])
  if (docs.includes(forbidden) || search.includes(forbidden)) fail("Docs/search stale invariant remains: " + forbidden);
if (!validator.includes("// FIX10: optional-Bake semantic sync guard")) fail("FIX10 validator guard was not installed.");

console.log("Preflight + in-memory validation: PASS");
console.log("\nApplying transaction...");

const changed = [];
try {
  for (const rel of rels) {
    const originalText = texts.get(rel);
    const eol = eolOf(originalText);
    const out = normalizeEol(outputs.get(rel), eol);
    if (out !== originalText) {
      fs.writeFileSync(path.join(repo, rel), out, "utf8");
      changed.push(rel);
    }
  }

  if (process.env.FREQTIK_PATCH_TEST_MODE !== "1") {
    const validate = cp.spawnSync(process.execPath, [path.join(repo, "tools", "impulse-anvil-docs", "validate-learning.cjs")], {
      cwd: repo, encoding: "utf8"
    });
    if (validate.status !== 0) fail("validate-learning.cjs failed:\n" + (validate.stderr || validate.stdout));
    if (validate.stdout) process.stdout.write(validate.stdout.trim() + "\n");

    const syntax = cp.spawnSync(process.execPath, ["--check", path.join(repo, "tools", "impulse-anvil-docs", "validate-learning.cjs")], { cwd: repo, encoding: "utf8" });
    if (syntax.status !== 0) fail("validate-learning.cjs syntax check failed:\n" + (syntax.stderr || syntax.stdout));

    const gitCheck = cp.spawnSync("git", ["-c", "core.whitespace=cr-at-eol", "diff", "--check", "--no-ext-diff", "--", ...rels], {
      cwd: repo,
      encoding: "utf8",
      shell: false,
      windowsHide: true
    });
    if (gitCheck.error) {
      console.warn("WARN - git diff --check could not be launched: " + gitCheck.error.message);
    } else if (gitCheck.status !== 0) {
      const combined = [gitCheck.stdout, gitCheck.stderr].filter(Boolean).join("\n").trim();
      const remaining = combined
        .split(/\r?\n/)
        .filter(Boolean)
        .filter(line => !/^warning: in the working copy of '.+', (?:LF will be replaced by CRLF|CRLF will be replaced by LF) the next time Git touches it$/.test(line.trim()));
      if (remaining.length) fail("git diff --check failed:\n" + remaining.join("\n"));
      console.warn("WARN - Git reported only line-ending conversion notices; content diff check remains clean.");
    }
  }
} catch (err) {
  for (const [rel, buf] of originals) fs.writeFileSync(path.join(repo, rel), buf);
  console.error("\nPost-write validation failed. FIX10R2 restored the original files.");
  throw err;
}

console.log("\nChanged files:");
if (!changed.length) console.log("  none - FIX10R2 is already applied.");
else for (const rel of changed) console.log("  M " + rel);
console.log("\nPASS - Homepage and Docs Overview now treat Bake as optional WAV export while preserving the FIX9 live-effect, preset, course, price/version and runtime architecture.");
