"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const PATCH_NAME = "Impulse Anvil v1.0.122 - Live Effect + Course Entry FIX9R4";
const TODAY = "2026-08-22";

function fail(message) { throw new Error(message); }
function countOf(text, needle) { return text.split(needle).length - 1; }
function detectEol(text) { return text.includes("\r\n") ? "\r\n" : "\n"; }
function adaptEol(block, text) { return block.replace(/\r?\n/g, detectEol(text)); }
function preserveFinalNewline(original, text) {
  const had = /(?:\r?\n)$/.test(original);
  const stripped = text.replace(/(?:\r?\n)+$/, "");
  return had ? stripped + detectEol(original) : stripped;
}
function findRepo(start) {
  let p = path.resolve(start);
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(p, "impulse-anvil.html")) &&
        fs.existsSync(path.join(p, "docs", "impulse-anvil")) &&
        fs.existsSync(path.join(p, "sitemap.xml"))) return p;
    const parent = path.dirname(p);
    if (parent === p) break;
    p = parent;
  }
  fail("Could not locate the FreQtik website repository. Extract this patch somewhere inside the repository and run it again.");
}
function readFile(repo, rel) {
  const p = path.join(repo, rel);
  if (!fs.existsSync(p)) fail("Required file missing: " + rel);
  return fs.readFileSync(p, "utf8");
}
function replaceState(text, oldText, newText, label) {
  const oldE = adaptEol(oldText, text);
  const newE = adaptEol(newText, text);
  if (text.includes(newE)) return text;
  const n = countOf(text, oldE);
  if (n !== 1) fail(`${label}: expected exactly one current-state anchor, found ${n}.`);
  return text.replace(oldE, newE);
}
function removeExactState(text, oldText, label) {
  const oldE = adaptEol(oldText, text);
  if (!text.includes(oldE)) return text;
  const n = countOf(text, oldE);
  if (n !== 1) fail(`${label}: expected exactly one removable block, found ${n}.`);
  return text.replace(oldE, "");
}
function removeSemanticLineState(text, labelText, url, label) {
  const escLabel = labelText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escUrl = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^[ \t]*(?:-[ \t]*)?${escLabel}[ \t]*${escUrl}[ \t]*(?:\\r?\\n|$)`, "gmi");
  const matches = [...text.matchAll(re)];
  if (matches.length === 0) return text;
  if (matches.length !== 1) fail(`${label}: expected zero or one semantic reference line, found ${matches.length}.`);
  return text.replace(re, "");
}
function removeRangeState(text, startMarker, endMarker, label) {
  if (!text.includes(startMarker)) return text;
  const starts = countOf(text, startMarker);
  const ends = countOf(text, endMarker);
  if (starts !== 1 || ends < 1) fail(`${label}: ambiguous range markers (${starts} start, ${ends} end).`);
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker, start);
  if (end < 0) fail(`${label}: end marker not found after start marker.`);
  return text.slice(0, start) + text.slice(end);
}
function removeDetailsBySummaryState(text, summaryHtml, label) {
  const summaryNeedle = `<summary>${summaryHtml}</summary>`;
  if (!text.includes(summaryNeedle)) return text;
  const escaped = summaryHtml.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<details\\b[^>]*>\\s*<summary>${escaped}<\\/summary>[\\s\\S]*?<\\/details>\\s*`, "g");
  const matches = [...text.matchAll(re)];
  if (matches.length !== 1) fail(`${label}: expected exactly one FAQ details block for summary, found ${matches.length}.`);
  return text.replace(re, "");
}
function replaceRegexState(text, regex, newText, alreadyNeedle, label) {
  if (alreadyNeedle && text.includes(alreadyNeedle)) return text;
  const matches = [...text.matchAll(regex)];
  if (matches.length !== 1) fail(`${label}: expected exactly one current-state match, found ${matches.length}.`);
  return text.replace(regex, newText);
}
function updateSitemapLastmod(text, url, date) {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(<loc>${escaped}<\\/loc>\\s*<lastmod>)(\\d{4}-\\d{2}-\\d{2})(<\\/lastmod>)`, "g");
  const matches = [...text.matchAll(re)];
  if (matches.length !== 1) fail(`sitemap.xml: expected exactly one lastmod entry for ${url}, found ${matches.length}.`);
  return text.replace(re, `$1${date}$3`);
}
function decodeEntities(s) {
  const named = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    rarr: "→", larr: "←", middot: "·", ndash: "–", mdash: "—", euro: "€"
  };
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => Object.prototype.hasOwnProperty.call(named, n.toLowerCase()) ? named[n.toLowerCase()] : m);
}
function articleText(html) {
  const m = html.match(/<article\b[^>]*class="[^"]*docs-card[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
  let s = m ? m[1] : html;
  s = s
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(s).replace(/\s+/g, " ").trim();
}
function syncSearchEntries(searchText, htmlByUrl) {
  const data = JSON.parse(searchText);
  for (const [url, html] of Object.entries(htmlByUrl)) {
    const hits = data.filter(x => x && x.url === url);
    if (hits.length !== 1) fail(`search-index.json: expected exactly one entry for ${url}, found ${hits.length}.`);
    const text = articleText(html);
    if (!text) fail(`search-index.json: extracted empty text for ${url}.`);
    hits[0].text = text;
    hits[0].snippet = text.length > 180 ? text.slice(0, 177).trimEnd() + "..." : text;
  }
  const eol = detectEol(searchText);
  return preserveFinalNewline(searchText, JSON.stringify(data, null, 2).replace(/\n/g, eol));
}
function runNode(repo, args, label) {
  const r = cp.spawnSync(process.execPath, args, { cwd: repo, encoding: "utf8" });
  if (r.status !== 0) fail(`${label} failed:\n${r.stderr || r.stdout || "unknown error"}`);
  return (r.stdout || "").trim();
}

const repo = findRepo(process.cwd());
console.log(PATCH_NAME);
console.log("Repository: " + repo);
console.log("\nPreflight...");

const files = [
  "impulse-anvil.html",
  "docs/impulse-anvil/index.html",
  "docs/impulse-anvil/getting-started/quickstart/index.html",
  "docs/impulse-anvil/getting-started/guided-learning/index.html",
  "docs/impulse-anvil/concepts/what-anvil-does/index.html",
  "docs/impulse-anvil/faq/index.html",
  "docs/impulse-anvil/bake/export/index.html",
  "docs/impulse-anvil/search-index.json",
  "assets/impulse-anvil-course/basics-v1.css",
  "assets/impulse-anvil-course/basics-v1.js",
  "assets/impulse-anvil-course/basics-v1.json",
  "llms.txt",
  "llms-full.txt",
  "sitemap.xml",
  "tools/impulse-anvil-docs/validate-learning.cjs"
];
const original = Object.fromEntries(files.map(rel => [rel, readFile(repo, rel)]));

// Release/product invariants: do not let a communication patch mutate product truth.
for (const required of [
  'softwareVersion": "1.0.122"',
  '"price": "49.00"',
  'Get Impulse Anvil &middot; &euro;49',
  'Stop searching for the sound.',
  'Draw', 'Path', 'Glue', 'Omni'
]) {
  if (!original["impulse-anvil.html"].includes(required)) fail("Product preflight invariant missing: " + required);
}
// FIX9R2: validate the 21-Morph product truth semantically rather than
// depending on a specific HTML wrapper such as <strong>.
const productVisibleText = decodeEntities(original["impulse-anvil.html"]
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " "))
  .replace(/\s+/g, " ")
  .trim();
if (!/(?:\b21\s+Morph\s+relationships\b|\b21-mode\s+Morph\s+relationship\s+library\b)/i.test(productVisibleText))
  fail("Product preflight invariant missing: visible 21-Morph relationship truth.");
const courseBefore = JSON.parse(original["assets/impulse-anvil-course/basics-v1.json"]);
if (courseBefore.id !== "impulse-anvil-basics" || courseBefore.storageKey !== "freqtik.impulseAnvil.learning.v2" || courseBefore.lessons.length !== 34)
  fail("Basics Course identity/progress/34-lesson invariant is not the expected production state.");
const idsBefore = courseBefore.lessons.map(x => x.id).join("|");
if (!original["docs/impulse-anvil/getting-started/guided-learning/index.html"].includes('href="/learn/impulse-anvil-basics/"'))
  fail("Guided Learning is not linked to the canonical Basics Course route.");

const next = { ...original };

// ---------------------------------------------------------------------
// Product page: make the live-effect truth explicit; Bake becomes optional.
let product = next["impulse-anvil.html"];
product = replaceState(product,
  'content="Stop searching for the sound. Build what yours is missing by designing a custom convolution response, hearing it on the track and Baking it as a reusable WAV IR."',
  'content="Stop searching for the sound. Build what yours is missing by designing a custom convolution response and hearing it directly while your track plays. Bake only when you want that response as a reusable WAV IR."',
  "Product Open Graph description");
product = replaceState(product,
  'content="Start with the sound already in your track. Design the response it needs, hear the result through convolution, then Bake the response as a reusable WAV IR."',
  'content="Start with the sound already in your track. Hear Anvil process it through the response while you design, then optionally Bake that response as a reusable WAV IR."',
  "Product Twitter description");
product = replaceState(product,
  '"description": "Impulse Anvil is a Windows 10/11 64-bit VST3 sound-design and impulse-response construction workstation. Start with audio you want to reshape, build a custom response from two IRs or compatible recordings, choose structural relationships, author movement with Draw, Path, Glue or Omni, audition the result through convolution and Bake reusable WAV impulse responses."',
  '"description": "Impulse Anvil is a Windows 10/11 64-bit VST3 sound-design and impulse-response construction workstation with its own stereo convolution engine. Put it on a playing track, build a custom response from two IRs or compatible recordings, choose structural relationships, author movement with Draw, Path, Glue or Omni, hear that response process the track directly, and optionally Bake it as a reusable WAV impulse response."',
  "Product structured-data description");
product = replaceState(product,
  '<p class="ia-hero-sub">Before you replace it or reach for another processing chain, design a response around the tone, resonance, texture, depth, space and identity you want&mdash;then Bake that response as a reusable WAV IR.</p>',
  '<p class="ia-hero-sub">Put Anvil on a playing instrument or audio track and design a response around the tone, resonance, texture, depth, space and identity you want. You hear the response directly while you tweak. Bake only when you want that response as a reusable WAV IR.</p>',
  "Product hero live-effect copy");
product = replaceState(product,
  '<p>A and B are material. Build the response you want the sound to pass through, audition it on the track, then keep the result.</p>',
  '<p>A and B are material. Build the response you want the sound to pass through and hear it directly on the playing track as you tweak.</p>',
  "Product floating live-effect copy");
product = replaceState(product,
  '<div class="ia-proof-item"><strong>Bake and reuse</strong><span>Turn discoveries into portable WAV impulse responses.</span></div>',
  '<div class="ia-proof-item"><strong>Keep it your way</strong><span>Save the whole Anvil setup as a preset, or Bake the response itself as a portable WAV.</span></div>',
  "Product proofbar keep-result copy");
const oldCard3 = '<article class="ia-position-card"><span class="ia-number">03</span><h3>Bake and reuse it</h3><p>Trim, Color, Texture, EQ, widen and level the finished response. Bake it as a WAV and use it again whenever you want.</p></article>';
const newCard3 = '<article class="ia-position-card"><span class="ia-number">03</span><h3>Keep it your way</h3><p>Keep using the response directly in Anvil. Save the whole setup as a preset in <strong>OPTIONS</strong>, or Bake the response as a WAV when you want a portable file.</p></article>';
product = replaceState(product, oldCard3, newCard3, "Product workflow step 03");
if (!product.includes('href="/learn/impulse-anvil-basics/" class="ia-btn ia-btn-primary">New to Anvil? Start the Basics Course')) {
  // FIX9R2: structurally locate the workflow grid instead of depending on
  // one exact whitespace/newline pattern around card 03. The grid currently
  // contains article children only, so its first closing </div> is the grid close.
  const workflowStartMarker = '<section class="ia-section" id="ia-workflow">';
  const workflowEndMarker = '<section class="ia-section ia-material-section" id="ia-material">';
  if (countOf(product, workflowStartMarker) !== 1 || countOf(product, workflowEndMarker) !== 1)
    fail("Product Basics Course CTA: workflow/material section markers are ambiguous or missing.");
  const workflowStart = product.indexOf(workflowStartMarker);
  const workflowEnd = product.indexOf(workflowEndMarker, workflowStart);
  if (workflowEnd < 0) fail("Product Basics Course CTA: material section does not follow workflow section.");
  const workflowBlock = product.slice(workflowStart, workflowEnd);
  const gridMarker = '<div class="ia-position-grid">';
  if (countOf(workflowBlock, gridMarker) !== 1)
    fail("Product Basics Course CTA: expected exactly one workflow position grid.");
  const gridStart = workflowBlock.indexOf(gridMarker);
  const gridClose = workflowBlock.indexOf('</div>', gridStart + gridMarker.length);
  if (gridClose < 0) fail("Product Basics Course CTA: workflow position grid closing tag not found.");
  const absoluteInsert = workflowStart + gridClose + '</div>'.length;
  const eol = detectEol(product);
  const cta = '<div class="ia-actions" style="margin-top:22px"><a href="/learn/impulse-anvil-basics/" class="ia-btn ia-btn-primary">New to Anvil? Start the Basics Course &rarr;</a></div>';
  product = product.slice(0, absoluteInsert) + eol + cta + product.slice(absoluteInsert);
}
product = replaceState(product,
  'aria-label="Source A and Source B enter Impulse Anvil, producing a new impulse response that can be baked to WAV and reused"',
  'aria-label="Source A and Source B enter Impulse Anvil, producing a new impulse response that Anvil plays directly and can optionally Bake to WAV"',
  "Product material-flow accessibility label");
product = replaceState(product,
  '<div class="ia-material-output"><strong>NEW IR</strong><span>&rarr;</span><strong>BAKE</strong><span>&rarr;</span><strong>WAV</strong><span>&rarr;</span><strong>REUSE</strong></div>',
  '<div class="ia-material-output"><strong>NEW IR</strong><span>&rarr;</span><strong>HEAR IT IN ANVIL</strong><span>&middot;</span><strong>OPTIONAL BAKE &rarr; WAV</strong></div>',
  "Product material-flow output");
product = removeRangeState(product, '<section class="ia-section" id="ia-acoustic">', '<section class="ia-section" id="ia-morph">', "Product Acoustic Bodies section");
product = replaceState(product,
  '<details open=""><summary>What is Impulse Anvil?</summary><p>Impulse Anvil is a sound-design workstation built around designing the impulse response itself. Start with audio you want to reshape, build a response from two IRs, recordings or found sounds, audition the result through convolution, then Bake that response as a reusable WAV IR.</p></details>',
  '<details open=""><summary>What is Impulse Anvil?</summary><p>Impulse Anvil is a sound-design workstation built around designing the impulse response itself. Put it on a playing instrument or audio track, build a response from two IRs, recordings or found sounds, and Anvil\'s own stereo convolution engine processes the track through that response while you design it. Bake is optional export.</p></details>',
  "Product FAQ What is Anvil");
product = replaceState(product,
  '<details><summary>Is it a convolution reverb?</summary><p>It can audition the response through convolution, but the product is centered on making and shaping the impulse response itself rather than only choosing a finished reverb preset.</p></details>',
  '<details><summary>Is it a convolution reverb?</summary><p>It includes its own stereo convolution engine and processes your track through the response you are designing. The difference is that Anvil is centered on making and shaping that response instead of only choosing a finished reverb preset.</p></details>',
  "Product FAQ convolution engine");
if (!product.includes('<summary>Do I need another IR loader?</summary>')) {
  const after = '<details><summary>Is it a convolution reverb?</summary><p>It includes its own stereo convolution engine and processes your track through the response you are designing. The difference is that Anvil is centered on making and shaping that response instead of only choosing a finished reverb preset.</p></details>';
  const added = after + '\n<details><summary>Do I need another IR loader?</summary><p><strong>ANVIL IS THE EFFECT.</strong> You do not need another convolution plugin to use the response you are designing. Anvil already processes the playing track through it. Bake only when you want the response itself as a reusable WAV for another compatible convolution tool or another Anvil design pass.</p></details>\n<details><summary>What is the difference between a preset and Bake?</summary><p>A preset saves the complete Anvil setup so you can return to the tweaking session or keep a favorite configuration. Use the preset Save / Load controls in <strong>OPTIONS</strong>. Bake exports the designed response itself as a WAV.</p></details>';
  if (countOf(product, after) !== 1) fail("Product FAQ insertion anchor missing or duplicated.");
  product = product.replace(after, adaptEol(added, product));
}
product = removeDetailsBySummaryState(product,
  "Can I record the body of a guitar or violin and use it as an IR?",
  "Product acoustic-body FAQ 1");
product = removeDetailsBySummaryState(product,
  "Can I compare two instrument-body captures?",
  "Product acoustic-body FAQ 2");
next["impulse-anvil.html"] = product;

// ---------------------------------------------------------------------
// Docs Overview: Anvil is the live effect; preset and Bake are different branches.
let overview = next["docs/impulse-anvil/index.html"];
overview = replaceState(overview,
  '<div class="anvil-kicker">THE IR IS THE THING YOU ARE MAKING</div>',
  '<div class="anvil-kicker">ANVIL IS THE EFFECT</div>',
  "Docs Overview kicker");
overview = replaceState(overview,
  '<p>Impulse Anvil is an <strong>impulse-response design workstation</strong>. Load IRs, recordings or found sounds as material, decide how A and B should relate, then Bake the response you make into a reusable WAV.</p>',
  '<p>Impulse Anvil is an <strong>impulse-response design workstation and the effect that plays the response on your track</strong>. Put it on a playing instrument or audio track, shape the response while you listen, and keep working without exporting anything. Bake only when you want the response itself as a reusable WAV.</p>',
  "Docs Overview live-effect intro");
overview = replaceState(overview,
  '  <div><strong>1. Your sound goes in.</strong><span>A vocal, drum, synth, guitar, field recording or anything else on the track.</span></div>',
  '  <div><strong>1. Your playing track goes through Anvil.</strong><span>Insert Anvil on an instrument or audio track, start playback or loop a section, and keep it running while you tweak.</span></div>',
  "Docs Overview step 1");
overview = replaceState(overview,
  '  <div><strong>3. Anvil changes the IR.</strong><span>A and B are material. Morph defines their relationship. Draw, Path, Glue and Omni can author how that relationship develops.</span></div>',
  '  <div><strong>3. Anvil changes the IR while you listen.</strong><span>A and B are source sounds. Morph defines their relationship. Draw, Path, Glue and Omni can author how that relationship develops while the track keeps playing through it.</span></div>',
  "Docs Overview step 3");
overview = replaceState(overview,
  '  <div><strong>4. Bake keeps the result.</strong><span>Your experiment becomes a reusable WAV impulse response.</span></div>',
  '  <div><strong>4. Keep it your way.</strong><span>Save the whole setup as a preset in OPTIONS when you want to return to it. Bake only when you want the designed response itself as a reusable WAV.</span></div>',
  "Docs Overview step 4");
overview = replaceState(overview,
  '<p class="ia-core-rule"><strong>The useful mental shortcut:</strong> when you reshape the IR, you reshape the transformation that will be applied to your sound.</p>',
  '<p class="ia-core-rule"><strong>ANVIL IS THE EFFECT:</strong> when you reshape the IR, you immediately reshape the transformation being applied to the playing track. You do not need another IR loader.</p>',
  "Docs Overview core rule");
overview = replaceState(overview,
  '<div class="anvil-path">Material &rarr; Relationship &rarr; Movement &rarr; Sculpt &rarr; Bake</div>',
  '<div class="anvil-path">Playing track &rarr; Design response &rarr; Hear it in Anvil &rarr; Save preset / optional Bake</div>',
  "Docs Overview path");
next["docs/impulse-anvil/index.html"] = overview;

// ---------------------------------------------------------------------
// Quickstart: playback first; Bake is optional output, preset saves the session.
let quick = next["docs/impulse-anvil/getting-started/quickstart/index.html"];
quick = replaceState(quick,
  '<div class="ia-core-rule"><strong>The whole idea:</strong> your sound goes into the plugin, an <button class="docs-term" type="button" data-docs-term="impulse-response" aria-expanded="false">impulse response (IR)</button> changes it, and Impulse Anvil lets you redesign that response.</div>',
  '<div class="ia-core-rule"><strong>ANVIL IS THE EFFECT:</strong> put it on a playing track, and an <button class="docs-term" type="button" data-docs-term="impulse-response" aria-expanded="false">impulse response (IR)</button> changes that track while you redesign the response in Anvil. You do not need another IR loader.</div>',
  "Quickstart core rule");
quick = replaceState(quick,
  '<p>Use a sound you already know well: drums, voice, guitar, piano or a synth. A fairly dry source makes the transformation easiest to hear.</p>',
  '<p>Use an instrument or audio track that is already producing sound: drums, voice, guitar, piano or a synth. <strong>Start playback</strong>—a short loop is ideal—and keep it running while you work. A fairly dry source makes the transformation easiest to hear.</p>',
  "Quickstart playback instruction");
quick = replaceState(quick,
  '<h2 id="7-bake-it">7. Bake it</h2>\n<p>When you hear something worth keeping, press <strong>Bake</strong>.</p>\n<p>The full version writes the result as a WAV IR. You can load it back into Anvil, combine it with something else, or use it in another compatible <button class="docs-term" type="button" data-docs-term="convolution" aria-expanded="false">convolution</button> plugin.</p>',
  '<h2 id="7-keep-it">7. Keep it — optionally Bake it</h2>\n<p><strong>You are already using the response.</strong> Anvil is processing the playing track through it while you tweak.</p>\n<p>If you want to return to the complete setup later, open <strong>OPTIONS</strong> and use the preset Save / Load controls. If you want the response itself as a portable file, press <strong>Bake</strong>.</p>\n<p>Bake writes a WAV IR that you can load back into Anvil, combine with something else, or use in another compatible <button class="docs-term" type="button" data-docs-term="convolution" aria-expanded="false">convolution</button> plugin.</p>',
  "Quickstart optional Bake step");
quick = replaceState(quick,
  '<p><strong>Material → relationship → movement → sculpt → Bake.</strong></p>',
  '<p><strong>Playing track → source sounds → relationship → movement → sculpt → keep using it. Save a preset for the setup; Bake only for a WAV.</strong></p>',
  "Quickstart core loop");
next["docs/impulse-anvil/getting-started/quickstart/index.html"] = quick;

// ---------------------------------------------------------------------
// Guided Learning lobby: course CTA near the top + explicit playback setup.
let guided = next["docs/impulse-anvil/getting-started/guided-learning/index.html"];
const launchBlock = '<a class="ia-course-launch" href="/learn/impulse-anvil-basics/" data-course-launch>\n<span class="ia-course-launch-product">IMPULSE ANVIL</span>\n<strong>BASICS COURSE</strong>\n<span class="ia-course-launch-action" data-course-launch-action>START COURSE</span>\n<small data-course-launch-status>34 hands-on lessons · progress stays on this device</small>\n<span class="ia-course-launch-progress" aria-hidden="true"><i data-course-launch-progress></i></span>\n</a>';
if (!guided.includes('<strong>Before you start:</strong> put Anvil on an instrument or audio track that is producing sound')) {
  const launchBlockE = adaptEol(launchBlock, guided);
  if (countOf(guided, launchBlockE) !== 1) fail("Guided Learning: canonical course-launch block missing or duplicated.");
  guided = guided.replace(launchBlockE, "");
  const introAnchor = '<p>You don\'t have to study the plugin before you use it. The Basics Course teaches it one small action at a time while you have Impulse Anvil open.</p>';
  if (countOf(guided, introAnchor) !== 1) fail("Guided Learning: top intro anchor missing or duplicated.");
  const setup = adaptEol(introAnchor + '\n<p><strong>Before you start:</strong> put Anvil on an instrument or audio track that is producing sound, start playback—a short loop is ideal—and keep it running while you work. You should hear each change through the track as you make it.</p>\n' + launchBlock, guided);
  guided = guided.replace(introAnchor, setup);
}
guided = guided.replace(/(?:\r?\n){3,}/g, detectEol(guided) + detectEol(guided));
next["docs/impulse-anvil/getting-started/guided-learning/index.html"] = guided;

// Lobby visual grammar: make the action look like an actual button, not a subheading.
let courseCss = next["assets/impulse-anvil-course/basics-v1.css"];
courseCss = replaceState(courseCss,
`.ia-course-launch-action{\n  margin-top:.4rem;\n  color:#fff;\n  font-size:.8rem;\n  font-weight:900;\n  letter-spacing:.08em;\n}`,
`.ia-course-launch-action{\n  display:inline-flex;\n  align-items:center;\n  justify-content:center;\n  margin-top:.72rem;\n  padding:.64rem .92rem;\n  color:#061017;\n  font-size:.76rem;\n  font-weight:950;\n  letter-spacing:.065em;\n  border:1px solid rgba(255,255,255,.62);\n  border-radius:10px;\n  background:linear-gradient(180deg,#8cf0ff,#58d9f1);\n  box-shadow:0 8px 22px rgba(35,187,218,.20),inset 0 1px rgba(255,255,255,.65);\n}`,
  "Course lobby action-button styling");
if (!courseCss.includes('.ia-course-launch:focus-visible{')) {
  const anchor = adaptEol('.ia-course-launch:hover{\n  transform:translateY(-2px);\n  border-color:rgba(109,231,255,.52);\n  box-shadow:0 20px 48px rgba(5,14,21,.20),inset 0 1px rgba(255,255,255,.06);\n}\n', courseCss);
  if (countOf(courseCss, anchor) !== 1) fail("Course lobby focus-style insertion anchor missing or duplicated.");
  courseCss = courseCss.replace(anchor, anchor + adaptEol('.ia-course-launch:focus-visible{outline:3px solid rgba(109,231,255,.42);outline-offset:3px}\n', courseCss));
}
next["assets/impulse-anvil-course/basics-v1.css"] = courseCss;

let courseJs = next["assets/impulse-anvil-course/basics-v1.js"];
courseJs = replaceState(courseJs,
`      action.textContent = done === 0\n        ? "START COURSE"\n        : (done === course.lessons.length ? "COURSE COMPLETE · OPEN" : \`CONTINUE · \${pct}%\`);`,
`      action.textContent = done === 0\n        ? "START BASICS COURSE →"\n        : (done === course.lessons.length ? "COURSE COMPLETE · OPEN →" : \`CONTINUE COURSE · \${pct}% →\`);`,
  "Course lobby action labels");
next["assets/impulse-anvil-course/basics-v1.js"] = courseJs;

// ---------------------------------------------------------------------
// Basics Course content only: preserve IDs/order/storage/progress architecture.
const course = JSON.parse(next["assets/impulse-anvil-course/basics-v1.json"]);
const byId = Object.fromEntries(course.lessons.map(x => [x.id, x]));
if (!byId.A01 || !byId.B03 || !byId.R02) fail("Basics Course expected lesson IDs A01/B03/R02 are missing.");
if (!byId.A01.bodyHtml.includes("<strong>Before loading anything:</strong>")) {
  byId.A01.bodyHtml = '<p><strong>Before loading anything:</strong> put Anvil on an instrument or audio track that is already producing sound. Start playback—a short loop is ideal—and keep it running while you work. The course is meant to be heard through that track as you tweak.</p>\n' + byId.A01.bodyHtml;
}
byId.B03.title = "Save the setup — or reset it";
byId.B03.goal = "Know the difference between saving an Anvil setup, resetting controls and Baking a WAV.";
byId.B03.bodyHtml = '<p>Open <strong>OPTIONS</strong> and find the preset <strong>Save / Load</strong> controls.</p>\n<p><strong>Preset = the whole Anvil setup.</strong> Save one when you want to return to this tweaking session later or keep a favorite setup. Load it next time to restore that setup.</p>\n<p>Also find <strong>Init / Reset Controls (keep IRs)</strong>. It resets the controls while keeping your chosen A and B files in place.</p>\n<p><strong>Bake is different:</strong> Bake exports the designed response itself as a WAV. You do not need to Bake just to keep using Anvil on the track.</p>';
if (!byId.R02.bodyHtml.includes("save a preset in <strong>OPTIONS</strong>")) {
  byId.R02.bodyHtml += '\n<p>If you want to return to the complete Anvil setup later—not only the baked response—save a preset in <strong>OPTIONS</strong>.</p>';
}
if (course.lessons.length !== 34 || course.lessons.map(x => x.id).join("|") !== idsBefore || course.storageKey !== "freqtik.impulseAnvil.learning.v2")
  fail("Basics Course IDs/order/progress namespace changed while editing copy.");
next["assets/impulse-anvil-course/basics-v1.json"] = preserveFinalNewline(original["assets/impulse-anvil-course/basics-v1.json"], JSON.stringify(course, null, 2).replace(/\n/g, detectEol(original["assets/impulse-anvil-course/basics-v1.json"])));

// ---------------------------------------------------------------------
// Concept / FAQ / Bake docs: remove the preview-tool ambiguity globally where it matters.
let what = next["docs/impulse-anvil/concepts/what-anvil-does/index.html"];
what = replaceState(what,
  '<p>Impulse Anvil is for <strong>making impulse responses</strong>, not only loading them.</p>',
  '<p>Impulse Anvil is for <strong>making impulse responses</strong>, not only loading them—and it already uses the response as the effect on your track while you work.</p>\n<div class="ia-core-rule"><strong>ANVIL IS THE EFFECT.</strong> Put it on a track, start playback, and Anvil\'s own stereo convolution engine processes that track through the response you are designing. You do not need another IR loader.</div>',
  "What Anvil Does live-effect rule");
what = replaceState(what,
  '<p>Anvil adds the creative part before that:</p>\n<blockquote>\n<p>load IRs or recordings → change them → combine them → listen → Bake a new IR</p>\n</blockquote>',
  '<p>Anvil adds the creative part inside the effect itself:</p>\n<blockquote>\n<p>playing track → load IRs or recordings → change them → combine them → hear the result directly in Anvil</p>\n</blockquote>\n<p>When you want the response itself as a portable file, Bake it. If you want to return to the complete Anvil setup later, save a preset in <strong>OPTIONS</strong>.</p>',
  "What Anvil Does workflow");
next["docs/impulse-anvil/concepts/what-anvil-does/index.html"] = what;

let faq = next["docs/impulse-anvil/faq/index.html"];
if (!faq.includes('id="do-i-need-another-convolution-plugin-or-ir-loader"')) {
  const faqAnchor = '<h1 id="faq">FAQ</h1>';
  const newFaq = faqAnchor + '\n<h2 id="do-i-need-another-convolution-plugin-or-ir-loader">Do I need another convolution plugin or IR loader?</h2>\n<p><strong>No. ANVIL IS THE EFFECT.</strong> Put Anvil on a playing track and its own stereo convolution engine already processes that track through the response you are designing. Bake only when you want the response itself as a reusable WAV for another compatible convolution tool or another Anvil design pass.</p>\n<h2 id="what-is-the-difference-between-saving-a-preset-and-baking">What is the difference between saving a preset and Baking?</h2>\n<p><strong>A preset saves the complete Anvil setup.</strong> Use the preset Save / Load controls in <strong>OPTIONS</strong> when you want to continue a tweaking session later or keep a favorite setup. <strong>Bake exports the designed response itself as a WAV.</strong></p>';
  if (countOf(faq, faqAnchor) !== 1) fail("FAQ top insertion anchor missing or duplicated.");
  faq = faq.replace(faqAnchor, newFaq);
}
faq = replaceState(faq,
  '<p>Yes. Path Preview and Bake use the same prepared Path result.</p>',
  '<p>Yes. The Path result you hear through Anvil\'s playback/convolution path is the same prepared Path result that Bake writes to the WAV.</p>',
  "FAQ Path playback/Bake wording");
next["docs/impulse-anvil/faq/index.html"] = faq;

let bake = next["docs/impulse-anvil/bake/export/index.html"];
if (!bake.includes('<strong>Bake is optional export.</strong>')) {
  const anchor = '<p>Whatever prepared response you are hearing can be turned into a reusable WAV.</p>';
  const add = anchor + '\n<div class="ia-core-rule"><strong>Bake is optional export.</strong> Anvil is already the effect while you design: its own stereo convolution engine is processing the track through the current response. Bake only when you want that response itself as a portable WAV.</div>\n<p>Want to return to the complete tweaking setup later? Save a preset in <strong>OPTIONS</strong>. Preset = Anvil setup. Bake = response WAV.</p>';
  if (countOf(bake, anchor) !== 1) fail("Bake page optional-export insertion anchor missing or duplicated.");
  bake = bake.replace(anchor, add);
}
bake = replaceState(bake,
  '<p>Bake commits the resulting prepared construction exactly as used by the prepared Preview path.</p>',
  '<p>Bake commits the resulting prepared construction exactly as used by Anvil\'s playback/convolution path.</p>',
  "Bake page Preview-path wording");
next["docs/impulse-anvil/bake/export/index.html"] = bake;

// ---------------------------------------------------------------------
// Machine-readable product truth: prevent cold readers from inventing a required external convolver.
let llms = next["llms.txt"];
llms = replaceState(llms,
  '- [Impulse Anvil](https://freqtik.com/impulse-anvil.html): Windows 10/11 64-bit VST3 sound-design and impulse-response construction workstation. Start with audio already in a track, design a custom convolution response to reshape tone, resonance, texture, depth and space, then Bake that response as a reusable WAV IR. Underneath, A/B material can be combined through 21 Morph relationships with Draw/Path/Glue/Omni authoring.',
  '- [Impulse Anvil](https://freqtik.com/impulse-anvil.html): Windows 10/11 64-bit VST3 sound-design and impulse-response construction workstation with its own stereo convolution engine. Put it on a playing track and Anvil processes that track through the response while you design it; no separate IR loader is required. Save/load presets to keep the complete Anvil setup. Bake only when you want the response itself as a reusable WAV IR. Underneath, A/B source sounds can be combined through 21 Morph relationships with Draw/Path/Glue/Omni authoring.',
  "llms.txt Anvil summary");
llms = removeSemanticLineState(llms, 'Acoustic bodies & comparison:', 'https://freqtik.com/docs/impulse-anvil/workflows/acoustic-bodies/', "llms.txt acoustic-body prominence");
next["llms.txt"] = llms;

let llmsFull = next["llms-full.txt"];
llmsFull = replaceState(llmsFull,
  'Impulse Anvil 1.0.122 is a Windows 10/11 64-bit VST3 sound-design and impulse-response construction workstation. Its producer-facing idea is to start with audio already in a track and design the response it needs instead of first searching for a replacement. A custom convolution response can reshape multiple perceptual qualities together, including tone, resonance, texture, apparent depth, space, decay and stereo character; this does not mean Anvil replaces dedicated processors.',
  'Impulse Anvil 1.0.122 is a Windows 10/11 64-bit VST3 sound-design and impulse-response construction workstation with its own stereo convolution engine. Its producer-facing idea is to put Anvil on audio already playing in a track and design the response that sound needs instead of first searching for a replacement. Anvil itself processes the track through the response while it is being designed; no separate IR loader is required. A custom convolution response can reshape multiple perceptual qualities together, including tone, resonance, texture, apparent depth, space, decay and stereo character; this does not mean Anvil replaces dedicated processors.',
  "llms-full live-effect summary");
llmsFull = replaceState(llmsFull,
  'Bake turns the prepared response into a reusable WAV impulse response. Draw, Path, Glue and Omni use the prepared Preview/Bake construction path.',
  'The current response is already the effect you hear through Anvil. Save/load presets in OPTIONS when you want to preserve the complete Anvil setup. Bake is optional export: it turns the prepared response itself into a reusable WAV impulse response for reloading into Anvil or using in another compatible convolution tool. Draw, Path, Glue and Omni use the same prepared construction for Anvil playback and Bake.',
  "llms-full preset/Bake distinction");
llmsFull = removeSemanticLineState(llmsFull, 'Acoustic bodies & comparison:', 'https://freqtik.com/docs/impulse-anvil/workflows/acoustic-bodies/', "llms-full acoustic-body prominence");
next["llms-full.txt"] = llmsFull;

// ---------------------------------------------------------------------
// Search entries are generated from the current docs page bodies.
next["docs/impulse-anvil/search-index.json"] = syncSearchEntries(next["docs/impulse-anvil/search-index.json"], {
  "/docs/impulse-anvil/": next["docs/impulse-anvil/index.html"],
  "/docs/impulse-anvil/getting-started/quickstart/": next["docs/impulse-anvil/getting-started/quickstart/index.html"],
  "/docs/impulse-anvil/getting-started/guided-learning/": next["docs/impulse-anvil/getting-started/guided-learning/index.html"],
  "/docs/impulse-anvil/concepts/what-anvil-does/": next["docs/impulse-anvil/concepts/what-anvil-does/index.html"],
  "/docs/impulse-anvil/faq/": next["docs/impulse-anvil/faq/index.html"],
  "/docs/impulse-anvil/bake/export/": next["docs/impulse-anvil/bake/export/index.html"]
});

// Sitemap: only URLs whose public content changes in this patch.
let sitemap = next["sitemap.xml"];
for (const url of [
  "https://freqtik.com/impulse-anvil.html",
  "https://freqtik.com/docs/impulse-anvil/",
  "https://freqtik.com/docs/impulse-anvil/getting-started/quickstart/",
  "https://freqtik.com/docs/impulse-anvil/getting-started/guided-learning/",
  "https://freqtik.com/docs/impulse-anvil/concepts/what-anvil-does/",
  "https://freqtik.com/docs/impulse-anvil/faq/",
  "https://freqtik.com/docs/impulse-anvil/bake/export/",
  "https://freqtik.com/learn/impulse-anvil-basics/"
]) sitemap = updateSitemapLastmod(sitemap, url, TODAY);
next["sitemap.xml"] = sitemap;

// ---------------------------------------------------------------------
// Extend the existing validator with the semantic rule introduced by FIX9.
let validator = next["tools/impulse-anvil-docs/validate-learning.cjs"];
if (!validator.includes("// FIX9: live-effect / preset / optional-Bake communication guard")) {
  const anchor = 'const courseValidator = path.join(__dirname, "validate-course-basics.cjs");';
  const guard = `// FIX9: live-effect / preset / optional-Bake communication guard\nconst productPage = read("impulse-anvil.html");\nconst whatPage = read("docs/impulse-anvil/concepts/what-anvil-does/index.html");\nconst faqPage = read("docs/impulse-anvil/faq/index.html");\nconst bakePage = read("docs/impulse-anvil/bake/export/index.html");\nconst courseData = JSON.parse(read("assets/impulse-anvil-course/basics-v1.json"));\nconst courseById = Object.fromEntries(courseData.lessons.map(x => [x.id, x]));\nif (!quick.includes("Start playback") || !quick.includes("You are already using the response"))\n  fail("Quickstart must establish a playing track and optional Bake.");\nif (!(guided.indexOf("data-course-launch") < guided.indexOf("ia-course-lobby-intro")) || !guided.includes("Before you start:"))\n  fail("Guided Learning must present playback setup + Basics Course launch before the IR introduction.");\nif (!overview.includes("ANVIL IS THE EFFECT") || !overview.includes("Save preset / optional Bake"))\n  fail("Docs Overview lost the live-effect / optional-Bake mental model.");\nif (!productPage.includes("ANVIL IS THE EFFECT") || !productPage.includes("New to Anvil? Start the Basics Course") || productPage.includes('id="ia-acoustic"') || productPage.includes("Can I record the body of a guitar or violin and use it as an IR?") || productPage.includes("Can I compare two instrument-body captures?"))\n  fail("Product page live-effect/course CTA/acoustic-body scope guard failed.");\nif (!whatPage.includes("You do not need another IR loader") || !faqPage.includes("ANVIL IS THE EFFECT") || !bakePage.includes("Bake is optional export"))\n  fail("Docs live-effect/Bake semantics are incomplete.");\nif (!courseById.A01.bodyHtml.includes("Start playback") || !courseById.B03.bodyHtml.includes("Preset = the whole Anvil setup") || !courseById.B03.bodyHtml.includes("Bake is different"))\n  fail("Basics Course must teach playback and preset-vs-Bake without changing lesson IDs.");\nfor (const rel of ["llms.txt", "llms-full.txt"]) {\n  const machine = read(rel);\n  if (!machine.includes("no separate IR loader") || !machine.includes("preset"))\n    fail(rel + " is missing live-effect/preset/Bake machine-readable truth.");\n}\nfor (const url of [\n  "/docs/impulse-anvil/",\n  "/docs/impulse-anvil/getting-started/quickstart/",\n  "/docs/impulse-anvil/getting-started/guided-learning/",\n  "/docs/impulse-anvil/concepts/what-anvil-does/",\n  "/docs/impulse-anvil/faq/",\n  "/docs/impulse-anvil/bake/export/"\n]) {\n  const hits = searchEntry(url);\n  if (hits.length !== 1) fail("FIX9 docs-search entry missing/duplicated: " + url);\n}\nif (!String(searchEntry("/docs/impulse-anvil/")[0].text || "").includes("ANVIL IS THE EFFECT"))\n  fail("Docs-search Overview is missing the FIX9 live-effect rule.");\n\n`;
  if (countOf(validator, anchor) !== 1) fail("validate-learning.cjs FIX9 insertion anchor missing or duplicated.");
  validator = validator.replace(anchor, adaptEol(guard, validator) + anchor);
}
if (!validator.includes("// FIX9R4: machine-readable acoustic-body prominence guard")) {
  const anchorR4 = 'const courseValidator = path.join(__dirname, "validate-course-basics.cjs");';
  const guardR4 = `// FIX9R4: machine-readable acoustic-body prominence guard\nfor (const rel of ["llms.txt", "llms-full.txt"]) {\n  const machineScope = read(rel);\n  if (machineScope.includes("Acoustic bodies & comparison:"))\n    fail(rel + " must keep Acoustic Bodies in deep docs, not the top-level machine-readable product highlights.");\n}\n\n`;
  if (countOf(validator, anchorR4) !== 1) fail("validate-learning.cjs FIX9R4 insertion anchor missing or duplicated.");
  validator = validator.replace(anchorR4, adaptEol(guardR4, validator) + anchorR4);
}
next["tools/impulse-anvil-docs/validate-learning.cjs"] = validator;

// ---------------------------------------------------------------------
// In-memory validation before any write.
function must(rel, needle) { if (!next[rel].includes(needle)) fail(`${rel}: final invariant missing: ${needle}`); }
function mustNot(rel, needle) { if (next[rel].includes(needle)) fail(`${rel}: forbidden stale invariant remains: ${needle}`); }
must("impulse-anvil.html", "ANVIL IS THE EFFECT");
must("impulse-anvil.html", "New to Anvil? Start the Basics Course");
mustNot("impulse-anvil.html", 'id="ia-acoustic"');
mustNot("impulse-anvil.html", "Can I record the body of a guitar or violin and use it as an IR?");
mustNot("impulse-anvil.html", "Can I compare two instrument-body captures?");
must("docs/impulse-anvil/index.html", "Save preset / optional Bake");
must("docs/impulse-anvil/getting-started/quickstart/index.html", "Start playback");
must("docs/impulse-anvil/getting-started/quickstart/index.html", "You are already using the response");
must("docs/impulse-anvil/getting-started/guided-learning/index.html", "Before you start:");
if (!(next["docs/impulse-anvil/getting-started/guided-learning/index.html"].indexOf("data-course-launch") < next["docs/impulse-anvil/getting-started/guided-learning/index.html"].indexOf("ia-course-lobby-intro")))
  fail("Guided Learning final ordering is wrong: launch must precede the IR introduction.");
must("assets/impulse-anvil-course/basics-v1.css", "background:linear-gradient(180deg,#8cf0ff,#58d9f1)");
must("assets/impulse-anvil-course/basics-v1.js", "START BASICS COURSE →");
must("docs/impulse-anvil/concepts/what-anvil-does/index.html", "You do not need another IR loader");
must("docs/impulse-anvil/faq/index.html", "ANVIL IS THE EFFECT");
must("docs/impulse-anvil/bake/export/index.html", "Bake is optional export");
must("llms.txt", "no separate IR loader is required");
must("llms-full.txt", "no separate IR loader is required");
mustNot("llms.txt", "Acoustic bodies & comparison:");
mustNot("llms-full.txt", "Acoustic bodies & comparison:");
const courseAfter = JSON.parse(next["assets/impulse-anvil-course/basics-v1.json"]);
if (courseAfter.lessons.length !== 34 || courseAfter.lessons.map(x => x.id).join("|") !== idsBefore || courseAfter.storageKey !== "freqtik.impulseAnvil.learning.v2")
  fail("Final Basics Course identity/order/progress invariant changed.");
const searchAfter = JSON.parse(next["docs/impulse-anvil/search-index.json"]);
const oneSearch = url => searchAfter.filter(x => x && x.url === url);
for (const url of [
  "/docs/impulse-anvil/",
  "/docs/impulse-anvil/getting-started/quickstart/",
  "/docs/impulse-anvil/getting-started/guided-learning/",
  "/docs/impulse-anvil/concepts/what-anvil-does/",
  "/docs/impulse-anvil/faq/",
  "/docs/impulse-anvil/bake/export/"
]) if (oneSearch(url).length !== 1) fail("Final docs-search entry missing/duplicated: " + url);
if (!oneSearch("/docs/impulse-anvil/")[0].text.includes("ANVIL IS THE EFFECT")) fail("Final Overview search text not synchronized.");
for (const url of [
  "https://freqtik.com/impulse-anvil.html",
  "https://freqtik.com/docs/impulse-anvil/",
  "https://freqtik.com/docs/impulse-anvil/getting-started/quickstart/",
  "https://freqtik.com/docs/impulse-anvil/getting-started/guided-learning/",
  "https://freqtik.com/docs/impulse-anvil/concepts/what-anvil-does/",
  "https://freqtik.com/docs/impulse-anvil/faq/",
  "https://freqtik.com/docs/impulse-anvil/bake/export/",
  "https://freqtik.com/learn/impulse-anvil-basics/"
]) {
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!(new RegExp(`<loc>${escaped}<\\/loc>\\s*<lastmod>${TODAY}<\\/lastmod>`)).test(next["sitemap.xml"]))
    fail("Final sitemap date missing for " + url);
}
console.log("Preflight + in-memory validation: PASS");

// Determine actual changes; idempotent second run writes nothing.
const changed = files.filter(rel => next[rel] !== original[rel]);
if (!changed.length) {
  console.log("\nNo changes required - FIX9R4 is already fully applied.");
  console.log("PASS - Live effect, playback-first learning, preset/Bake distinction and course-entry communication are synchronized.");
  process.exit(0);
}

// Transactional write: restore originals automatically if any post-write validator fails.
console.log("\nApplying transaction...");
try {
  for (const rel of changed) fs.writeFileSync(path.join(repo, rel), next[rel], "utf8");
  runNode(repo, ["--check", path.join(repo, "assets/impulse-anvil-course/basics-v1.js")], "Course JS syntax check");
  runNode(repo, ["--check", path.join(repo, "tools/impulse-anvil-docs/validate-learning.cjs")], "Learning validator syntax check");
  const validation = runNode(repo, [path.join(repo, "tools/impulse-anvil-docs/validate-learning.cjs")], "Existing learning/course validation");
  if (validation) console.log(validation);
} catch (err) {
  for (const rel of changed) fs.writeFileSync(path.join(repo, rel), original[rel], "utf8");
  throw new Error("Post-write validation failed; all FIX9R4 file writes were rolled back automatically.\n" + err.message);
}

console.log("\nChanged files:");
for (const rel of changed) console.log("  M " + rel);
console.log("\nPASS - Live effect, playback-first learning, preset/Bake distinction and course-entry communication are synchronized without changing Course Mode progress architecture, product price/version/features, or site-wide CSS/JS architecture.");
