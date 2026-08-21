"use strict";

const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..", "..");
function fail(message) { throw new Error(message); }
function read(rel) {
  const p = path.join(repo, rel);
  if (!fs.existsSync(p)) fail("Missing: " + rel);
  return fs.readFileSync(p, "utf8");
}

const coursePage = read("learn/impulse-anvil-basics/index.html");
const courseJs = read("assets/impulse-anvil-course/basics-v1.js");
const courseCss = read("assets/impulse-anvil-course/basics-v1.css");
const course = JSON.parse(read("assets/impulse-anvil-course/basics-v1.json"));
const guided = read("docs/impulse-anvil/getting-started/guided-learning/index.html");
const sitemap = read("sitemap.xml");

const expectedIds = [
  "A01","A02","A03","A04","A05","A06","A07","A08","A09","A10",
  "S01","S02","S03","S04","S05","S06","S07","S08","S09",
  "B01","B02","B03",
  "M01","M02","M03",
  "L01","L02","L03","L04","L05","L06","L07",
  "R01","R02"
];
const expectedChapters = ["A","S","B","M","L","R"];

if (course.id !== "impulse-anvil-basics" || course.schema !== 1)
  fail("Basics Course identity/schema changed unexpectedly.");
if (course.storageKey !== "freqtik.impulseAnvil.learning.v2")
  fail("Basics Course must preserve the v2 progress namespace.");
if (JSON.stringify(course.lessons.map(x => x.id)) !== JSON.stringify(expectedIds))
  fail("Basics Course lesson order differs from the canonical 34-lesson curriculum.");
if (JSON.stringify(course.chapters.map(x => x.id)) !== JSON.stringify(expectedChapters))
  fail("Basics Course chapter order must remain A, S, B, M, L, R.");
if (/\bmaterial\b/i.test(JSON.stringify(course)))
  fail('Basics Course regressed to generic "material" wording.');

const byId = Object.fromEntries(course.lessons.map(x => [x.id, x]));
if (byId.B01.bodyHtml.includes("scroll back") || !byId.B01.bodyHtml.includes("use Previous or open the Overview"))
  fail("B01 must use Course Mode navigation language, not old page-scrolling language.");
if (byId.A01.title !== "Load your first sound" ||
    byId.A01.goal !== "Learn how to load a sound into Anvil." ||
    !byId.A01.bodyHtml.includes("That sound is now being used as your IR."))
  fail("A01 must teach loading a sound first, then name its use as the IR.");

if (!byId.A10.bodyHtml.includes("Now press <strong>Undo</strong> to bring your Color/Texture work back."))
  fail("A10 Reset -> Undo continuity disappeared.");

if (!byId.L02.bodyHtml.includes("This decides where the A→B movement begins inside the IR.") ||
    !byId.L02.bodyHtml.includes("This decides how long the movement takes."))
  fail("L02 Lerp Start/Time human explanation drifted.");

if (!byId.L01.bodyHtml.includes("Without A→B Lerp, Morph gives you one static position.") ||
    !byId.L01.bodyHtml.includes("With A→B Lerp, the movement itself becomes part of the IR."))
  fail("A→B Lerp central distinction is missing.");

if (!guided.includes('href="/learn/impulse-anvil-basics/"') ||
    !guided.includes("IMPULSE ANVIL") ||
    !guided.includes("BASICS COURSE") ||
    !guided.includes("But I want to know"))
  fail("Guided Learning is not acting as the Basics Course lobby.");

if (guided.includes("data-learning-quest=") || guided.includes("Show all lessons"))
  fail("The full lesson game is still permanently rendered inside Guided Learning.");

if (/\bmaterial\b/i.test(guided))
  fail('Guided Learning lobby regressed to generic "material" wording.');

if (!coursePage.includes('class="ia-course-page"') ||
    coursePage.includes('class="docs-sidebar"') ||
    coursePage.includes('class="docs-top"'))
  fail("Course Mode must be a focused page without normal documentation chrome.");

for (const required of [
  'data-course-stage',
  'data-course-prev',
  'data-course-next',
  'data-course-overview',
  'data-course-completion',
  'Save certificate PNG',
  'Restart course',
  'ANVIL OPERATOR',
  'Course duration'
]) {
  if (!coursePage.includes(required))
    fail("Course page missing: " + required);
}

for (const required of [
  'function sanitizeState',
  'contiguous = true',
  'function maxUnlockedIndex',
  'if (!canOpenLesson(index)) return',
  'nextButton.disabled = !hasNext || !complete',
  'if (currentIndex !== expected',
  'document.addEventListener("visibilitychange"',
  'window.addEventListener("pagehide"',
  'canvas.toBlob',
  'a.download = filename',
  'prefers-reduced-motion'
]) {
  if (!courseJs.includes(required))
    fail("Course runtime invariant missing: " + required);
}

if (courseJs.includes("showAll") || courseJs.includes("Show all lessons"))
  fail("Course Mode must not contain the old Show-all bypass.");

for (const forbidden of ["XMLHttpRequest", "WebSocket(", "navigator.sendBeacon"]) {
  if (courseJs.includes(forbidden))
    fail("Course runtime contains network-capable primitive: " + forbidden);
}

if (!courseJs.includes('fetch(DATA_URL, { credentials: "same-origin" })') ||
    !courseJs.includes('const DATA_URL = "/assets/impulse-anvil-course/basics-v1.json";'))
  fail("Course runtime must fetch only its same-origin canonical course data.");

if (!courseJs.includes("isCourseComplete(course, state)") ||
    !courseJs.includes("if (!isCourseComplete(course, state)) return;"))
  fail("Certificate save must be gated by canonical full-course completion.");

if (!courseJs.includes('URL.createObjectURL(blob)') ||
    !courseJs.includes('URL.revokeObjectURL(url)'))
  fail("Certificate PNG local-save implementation is incomplete.");

if (!courseCss.includes(".ia-course-card.is-entering") ||
    !courseCss.includes(".ia-course-card.is-leaving") ||
    !courseCss.includes("@media(prefers-reduced-motion:reduce)"))
  fail("Course transition/reduced-motion styling is incomplete.");

if (courseCss.includes("html{background") || courseCss.includes("\n*{box-sizing"))
  fail("Course stylesheet contains unscoped fullscreen rules that can leak into the docs lobby.");

if (!coursePage.includes('href="/docs/impulse-anvil/getting-started/guided-learning/"'))
  fail("Course Mode must always offer a route back to Guided Learning.");

if (!sitemap.includes("<loc>https://freqtik.com/learn/impulse-anvil-basics/</loc>"))
  fail("Basics Course is missing from sitemap.xml.");

const combined = coursePage + "\n" + JSON.stringify(course);
if (/\bcertified\b/i.test(combined) ||
    /professional certification/i.test(combined) ||
    /official certification/i.test(combined))
  fail("Completion reward must not imply formal certification.");

console.log("PASS - Impulse Anvil fullscreen Basics Course validation.");