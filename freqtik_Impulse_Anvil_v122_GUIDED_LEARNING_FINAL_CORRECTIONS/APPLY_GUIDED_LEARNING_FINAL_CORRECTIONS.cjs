"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const os = require("os");
const crypto = require("crypto");

const patchDir = __dirname;
const repo = path.resolve(patchDir, "..");
const patchFolder = path.basename(patchDir);

const OLD = {
  "article": "ac7edf4ae493b855bb19b4fb1b4cde58ca06f305d958ea5e44b7e5133fb4548d",
  "js": "9c58ecf3f59eaac82ecfe82d35e7ec8646983697182f49640f71afc7cf85956e",
  "grammar": "3ed0c5f2ced67035d7203ee54fc8a86ada5c2dacb0584c05699bb0070d53117a",
  "validator": "766f9b25fa9467cef12ad74fe3849362ef2f8e8e088fd575c3e51755fad38486"
};
const NEW = {
  "article": "88a7685f5ddd00beb2276dbc6185f5636b4da60ba73b65aff56dfe0a0a558bf2",
  "js": "41a6283580f93ada6699c5947014611e6ee7f85faeaabf1d5778ea58edefac54",
  "grammar": "9640d6117d0d728233029f39003e4997ccd09908ed8813c75886a468ada3b75e",
  "validator": "64f915eed7671e8c1df37a11274bcf177f22621fad311a252c44c280c854ab33"
};

function fail(message) { throw new Error(message); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function read(p) {
  if (!fs.existsSync(p)) fail("Missing required file: " + p);
  return fs.readFileSync(p, "utf8");
}
function write(p, text) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, text, "utf8");
}
function sha(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}
function git(args) {
  const r = cp.spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  if (r.status !== 0) fail(`git ${args.join(" ")} failed\n${r.stderr || r.stdout}`);
  return (r.stdout || "").trim();
}
function runNode(file, cwd) {
  const r = cp.spawnSync(process.execPath, [file], { cwd, encoding: "utf8" });
  if (r.status !== 0) fail(`${path.basename(file)} failed:\n${r.stderr || r.stdout}`);
  return (r.stdout || "").trim();
}
function syntaxCheck(file) {
  const r = cp.spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (r.status !== 0) fail(`${path.basename(file)} failed node --check:\n${r.stderr || r.stdout}`);
}
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
function rel(root, abs) {
  return path.relative(root, abs).split(path.sep).join("/");
}
function extractArticle(html) {
  const m = /<article class="docs-card"[^>]*>[\s\S]*?<\/article>/i.exec(html);
  if (!m) fail("Could not find Guided Learning docs-card article.");
  return m[0];
}
function guardedArticle(html, oldHash, newHash, replacement) {
  const current = extractArticle(html);
  const h = sha(current);
  if (h === newHash) return html;
  if (h !== oldHash)
    fail(`Guided Learning article changed since the reviewed Musician-First v2 release. Refusing to overwrite unknown content.\nExpected SHA: ${oldHash}\nActual SHA: ${h}`);
  return html.replace(current, replacement);
}
function guardedFile(stage, relPath, oldHash, newHash, payloadName) {
  const p = path.join(stage, relPath);
  const current = read(p);
  const h = sha(current);
  if (h === newHash) return;
  if (h !== oldHash)
    fail(`${relPath} changed since the reviewed Musician-First v2 release. Refusing to overwrite unknown content.\nExpected SHA: ${oldHash}\nActual SHA: ${h}`);
  write(p, read(path.join(patchDir, payloadName)));
}
function canonicalUrl(html) {
  const tag = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.exec(html);
  if (!tag) fail("Docs page missing canonical link.");
  const href = /\bhref=["']([^"']+)["']/i.exec(tag[0]);
  if (!href) fail("Canonical link missing href.");
  const prefix = "https://freqtik.com";
  return href[1].startsWith(prefix) ? href[1].slice(prefix.length) : href[1];
}
function htmlText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&middot;/g, "·")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rarr;|&#8594;/g, "→")
    .replace(/&larr;|&#8592;/g, "←")
    .replace(/&euro;/g, "€")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
function h1Text(html) {
  const m = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  return m ? htmlText(m[1]) : "Impulse Anvil";
}
function rebuildSearchIndex(stage) {
  const docsRoot = path.join(stage, "docs", "impulse-anvil");
  const entries = [];
  for (const p of walk(docsRoot)) {
    if (path.basename(p).toLowerCase() !== "index.html") continue;
    const html = read(p);
    const text = htmlText(extractArticle(html));
    entries.push({
      title: h1Text(html),
      url: canonicalUrl(html),
      text,
      snippet: text.length > 180 ? text.slice(0, 177).trimEnd() + "..." : text
    });
  }
  entries.sort((a, b) => a.title.localeCompare(b.title));
  write(path.join(docsRoot, "search-index.json"), JSON.stringify(entries, null, 2) + "\n");
}
function copyStage(stage) {
  // Full dependency set required by the permanent docs validators.
  for (const relPath of [
    "docs/impulse-anvil",
    "tools/impulse-anvil-docs",
    "index.html",
    "impulse-anvil.html"
  ]) {
    const source = path.join(repo, relPath);
    if (!fs.existsSync(source)) fail("Missing required base path: " + relPath);
    const dest = path.join(stage, relPath);
    ensureDir(path.dirname(dest));
    fs.cpSync(source, dest, { recursive: true, force: true });
  }
  const sitemap = path.join(repo, "sitemap.xml");
  if (fs.existsSync(sitemap))
    fs.copyFileSync(sitemap, path.join(stage, "sitemap.xml"));
}
function apply(stage) {
  const guidedPath = path.join(stage, "docs", "impulse-anvil", "getting-started", "guided-learning", "index.html");
  let guided = read(guidedPath);
  guided = guardedArticle(
    guided, OLD.article, NEW.article,
    read(path.join(patchDir, "GUIDED_LEARNING_ARTICLE_FINAL.html"))
  );
  write(guidedPath, guided);

  guardedFile(stage, "docs/impulse-anvil/assets/learning.js", OLD.js, NEW.js, "LEARNING_FINAL.js");
  guardedFile(stage, "tools/impulse-anvil-docs/HUMAN_FIRST_DOCS_GRAMMAR.md", OLD.grammar, NEW.grammar, "HUMAN_FIRST_DOCS_GRAMMAR_FINAL.md");
  guardedFile(stage, "tools/impulse-anvil-docs/validate-learning.cjs", OLD.validator, NEW.validator, "VALIDATE_LEARNING_FINAL.cjs");

  rebuildSearchIndex(stage);
}
function collectChanged(stage) {
  const changed = [];
  for (const rootRel of ["docs/impulse-anvil", "tools/impulse-anvil-docs"]) {
    for (const stageFile of walk(path.join(stage, rootRel))) {
      if (!fs.statSync(stageFile).isFile()) continue;
      const r = rel(stage, stageFile);
      const repoFile = path.join(repo, r);
      const a = fs.readFileSync(stageFile);
      const b = fs.existsSync(repoFile) ? fs.readFileSync(repoFile) : null;
      if (!b || !a.equals(b)) changed.push(r);
    }
  }
  return [...new Set(changed)].sort();
}
function backupAndWrite(stage, changed) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = path.resolve(repo, "..", `freqtikWebsite_backup_before_guided_learning_final_corrections_${stamp}`);
  ensureDir(backup);
  const manifest = [];

  for (const r of changed) {
    const target = path.join(repo, r);
    const existed = fs.existsSync(target);
    manifest.push({ rel: r, existed });
    if (existed) {
      const dest = path.join(backup, r);
      ensureDir(path.dirname(dest));
      fs.copyFileSync(target, dest);
    }
  }
  write(path.join(backup, "manifest.json"), JSON.stringify(manifest, null, 2));

  try {
    for (const r of changed) {
      const source = path.join(stage, r);
      const dest = path.join(repo, r);
      ensureDir(path.dirname(dest));
      fs.copyFileSync(source, dest);
    }
    console.log(runNode(path.join(repo, "tools", "impulse-anvil-docs", "validate.cjs"), repo));
    console.log(runNode(path.join(repo, "tools", "impulse-anvil-docs", "validate-learning.cjs"), repo));
    return backup;
  } catch (e) {
    console.error("Post-write validation failed. Restoring backup...");
    for (const item of manifest) {
      const target = path.join(repo, item.rel);
      if (item.existed) {
        const source = path.join(backup, item.rel);
        ensureDir(path.dirname(target));
        fs.copyFileSync(source, target);
      } else {
        try { fs.rmSync(target, { force: true }); } catch (_) {}
      }
    }
    console.error("Rollback completed.");
    throw e;
  }
}

function main() {
  console.log("");
  console.log("Impulse Anvil v1.0.122 - Guided Learning Final Corrections");
  console.log("Repository:", repo);
  console.log("");

  const top = path.resolve(git(["rev-parse", "--show-toplevel"]));
  if (top.toLowerCase() !== repo.toLowerCase())
    fail("Put this patch folder directly inside the website repository root.");
  if (git(["rev-parse", "--abbrev-ref", "HEAD"]) !== "main")
    fail("Switch to main first.");

  const status = git(["status", "--porcelain"])
    .split(/\r?\n/).filter(Boolean)
    .filter(line => !line.slice(3).replace(/\\/g, "/").startsWith(`${patchFolder}/`));
  if (status.length)
    fail("The repo already has uncommitted changes outside this patch folder:\n" + status.join("\n"));

  const baseValidator = path.join(repo, "tools", "impulse-anvil-docs", "validate.cjs");
  const learningValidator = path.join(repo, "tools", "impulse-anvil-docs", "validate-learning.cjs");

  console.log("Validating current repository...");
  console.log(runNode(baseValidator, repo));
  console.log(runNode(learningValidator, repo));

  for (const f of ["APPLY_GUIDED_LEARNING_FINAL_CORRECTIONS.cjs", "LEARNING_FINAL.js", "VALIDATE_LEARNING_FINAL.cjs"])
    syntaxCheck(path.join(patchDir, f));

  const stage = fs.mkdtempSync(path.join(os.tmpdir(), "freqtik-guided-final-stage-"));
  try {
    console.log("Creating isolated stage...");
    copyStage(stage);
    apply(stage);

    console.log("Running both permanent validators in isolated stage...");
    syntaxCheck(path.join(stage, "docs", "impulse-anvil", "assets", "learning.js"));
    syntaxCheck(path.join(stage, "tools", "impulse-anvil-docs", "validate-learning.cjs"));
    console.log(runNode(path.join(stage, "tools", "impulse-anvil-docs", "validate.cjs"), stage));
    console.log(runNode(path.join(stage, "tools", "impulse-anvil-docs", "validate-learning.cjs"), stage));
    console.log("STAGE PASS - real repository is still untouched.");

    const changed = collectChanged(stage);
    if (!changed.length) {
      console.log("Nothing to change; final corrections are already applied.");
      return;
    }

    console.log(`Validated staged changes: ${changed.length} file(s).`);
    const backup = backupAndWrite(stage, changed);

    console.log("");
    console.log("PASS - Guided Learning final corrections applied successfully.");
    console.log("Backup:", backup);
  } finally {
    try { fs.rmSync(stage, { recursive: true, force: true }); } catch (_) {}
  }
}

try { main(); }
catch (e) {
  console.error("");
  console.error("FAILED - do not commit or push.");
  console.error(e && e.stack ? e.stack : String(e));
  process.exit(1);
}
