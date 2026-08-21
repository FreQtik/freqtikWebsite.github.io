"use strict";

const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..", "..");
const manifestPath = path.join(__dirname, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function fail(message) {
  throw new Error(message);
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function toRepoRel(abs) {
  return path.relative(repo, abs).split(path.sep).join("/");
}

function canonical(html) {
  const tag = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.exec(html);
  if (!tag) return "";

  const href = /\bhref=["']([^"']+)["']/i.exec(tag[0]);
  if (!href) return "";

  const raw = href[1];
  const prefix = "https://freqtik.com";
  return raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
}

function docsNavHtml(html) {
  const m = /<nav class="docs-nav" aria-label="Documentation sections">[\s\S]*?<\/nav>/i.exec(html);
  return m ? m[0] : "";
}

function navLinks(html) {
  const nav = docsNavHtml(html);
  if (!nav) return [];
  return [...nav.matchAll(/<a(?: class="active")? href="([^"]+)">([\s\S]*?)<\/a>/gi)]
    .map(m => [m[1], m[2]]);
}

function activeDocsNavUrls(html) {
  const nav = docsNavHtml(html);
  if (!nav) return [];
  return [...nav.matchAll(/<a class="active" href="([^"]+)">/gi)].map(m => m[1]);
}

function expectedLinks() {
  const out = [];
  for (const group of manifest.groups)
    for (const item of group.items)
      out.push(item);
  return out;
}

function prevNextUrls(html) {
  const nav = /<nav class="docs-prevnext"[\s\S]*?<\/nav>/i.exec(html);
  if (!nav) return [];
  return [...nav[0].matchAll(/<a href="([^"]+)">/g)].map(m => m[1]);
}

function workflowCardUrls(html) {
  const start = html.indexOf('<div class="anvil-card-grid">');
  const end = html.indexOf('<h2 id="the-recipe-format">', start);
  if (start < 0 || end < 0) return [];

  const grid = html.slice(start, end);
  return [...grid.matchAll(/<a class="anvil-card" href="([^"]+)">/g)].map(m => m[1]);
}

const docsRoot = path.join(repo, "docs", "impulse-anvil");
const pages = walk(docsRoot)
  .filter(p => path.basename(p).toLowerCase() === "index.html");

const expected = expectedLinks();

for (const p of pages) {
  const rel = toRepoRel(p);
  const html = fs.readFileSync(p, "utf8");
  const url = canonical(html);

  if (!url)
    fail(rel + ": missing canonical URL.");

  const got = navLinks(html);
  if (JSON.stringify(got) !== JSON.stringify(expected))
    fail(rel + ": documentation sidebar differs from the canonical manifest.");

  const active = activeDocsNavUrls(html);
  if (active.length !== 1 || active[0] !== url)
    fail(rel + ": active sidebar item does not match canonical URL " + url);
}

const corpusFiles = [
  path.join(repo, "index.html"),
  path.join(repo, "impulse-anvil.html"),
  ...pages
];

for (const p of corpusFiles) {
  const rel = toRepoRel(p);
  const content = fs.readFileSync(p, "utf8");

  for (const bad of manifest.stalePatterns) {
    if (content.includes(bad))
      fail(rel + ': stale content marker found: "' + bad + '"');
  }

  if (rel.startsWith("docs/impulse-anvil/")) {
    if (/"softwareVersion":\s*"1\.0\.121"/.test(content))
      fail(rel + ": current documentation structured data still reports 1.0.121.");

    if (/docs-pill[^>]*>Impulse Anvil 1\.0\.121</.test(content))
      fail(rel + ": current documentation version pill still reports 1.0.121.");
  }

  for (const bad of ["Ã", "Â", "�"]) {
    if (content.includes(bad))
      fail(rel + ': suspicious encoding marker found: "' + bad + '"');
  }
}

const expectedWorkflowCards = [
  "/docs/impulse-anvil/workflows/draw-transition/",
  "/docs/impulse-anvil/workflows/path-time-routing/",
  "/docs/impulse-anvil/workflows/omni-path/",
  "/docs/impulse-anvil/workflows/color-phase/",
  "/docs/impulse-anvil/workflows/found-sounds/",
  "/docs/impulse-anvil/workflows/acoustic-bodies/",
  "/docs/impulse-anvil/workflows/recursive-baking/",
  "/docs/impulse-anvil/workflows/multi-morph-stereo/",
  "/docs/impulse-anvil/workflows/ai-theme-design/"
];

const workflowLibraryPath = path.join(repo, "docs", "impulse-anvil", "workflows", "index.html");
const workflowLibrary = fs.readFileSync(workflowLibraryPath, "utf8");
const actualWorkflowCards = workflowCardUrls(workflowLibrary);

if (JSON.stringify(actualWorkflowCards) !== JSON.stringify(expectedWorkflowCards)) {
  fail(
    "Workflow Library card grid differs from canonical workflow order.\n" +
    "Expected: " + expectedWorkflowCards.join(", ") + "\n" +
    "Got: " + actualWorkflowCards.join(", ")
  );
}

if (!workflowLibrary.includes("Save a Schema-2 JSON from DESIGN"))
  fail("Workflow Library AI Theme card does not use current DESIGN wording.");

const found = fs.readFileSync(
  path.join(repo, "docs", "impulse-anvil", "workflows", "found-sounds", "index.html"),
  "utf8"
);
const foundChain = prevNextUrls(found);
if (
  foundChain.length < 2 ||
  foundChain[foundChain.length - 1] !== "/docs/impulse-anvil/workflows/acoustic-bodies/"
) {
  fail("Found Sounds does not point Next to Acoustic Bodies.");
}

const acoustic = fs.readFileSync(
  path.join(repo, "docs", "impulse-anvil", "workflows", "acoustic-bodies", "index.html"),
  "utf8"
);
const acousticChain = prevNextUrls(acoustic);
if (
  acousticChain.length < 2 ||
  acousticChain[0] !== "/docs/impulse-anvil/workflows/found-sounds/" ||
  acousticChain[acousticChain.length - 1] !== "/docs/impulse-anvil/workflows/recursive-baking/"
) {
  fail("Acoustic Bodies Previous/Next chain is inconsistent.");
}

const product = fs.readFileSync(path.join(repo, "impulse-anvil.html"), "utf8");
if (!product.includes('id="ia-draw-path"></div>'))
  fail("Product legacy #ia-draw-path anchor was not preserved.");

if (product.includes('<section class="ia-section" id="ia-draw-path">'))
  fail("Duplicate technical #ia-draw-path sales section still exists.");

console.log("PASS - Impulse Anvil docs/navigation/content validation.");
