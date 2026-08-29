"use strict";
const fs=require("fs"),path=require("path");
const repo=path.resolve(__dirname,"..","..");
function fail(m){throw new Error(m);}
function read(r){return fs.readFileSync(path.join(repo,r),"utf8");}

const home=read("index.html");
const product=read("impulse-anvil.html");
const downloads=read("downloads.html");
const js=read("assets/freqtik-site.js");
const docs=read("docs/impulse-anvil/index.html");
const formats=read("docs/impulse-anvil/reference/formats-paths/index.html");
const llms=read("llms.txt");
const llmsFull=read("llms-full.txt");
const RELEASE_URL="https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.123";
const WIN_URL="https://github.com/freqtik/freqtikWebsite.github.io/releases/latest/download/ImpulseAnvil_Windows_VST3.zip";

function findAnchorByText(html,text){
  const anchors=[...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)];
  return anchors.map(m=>m[0]).find(a=>a.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()===text)||"";
}
function attr(anchor,name){
  const rx=new RegExp("\\b"+name+"=[\\\"']([^\\\"']+)[\\\"']","i");
  const m=anchor.match(rx);
  return m?m[1]:"";
}

if(!downloads.includes('id="macos-testing"')||!downloads.includes('id="macos-beta"')) fail("Mac testing section/compatibility alias missing.");
if(!downloads.includes("IA_MAC_TESTING_ROUTE_SAFE_START")) fail("Route-safe Mac query handler missing.");
if(!downloads.includes("URLSearchParams")) fail("Mac query route parser missing.");
if(!downloads.includes(RELEASE_URL)) fail("GitHub v1.0.123 release link missing.");
if(!downloads.includes("Download macOS Testing Build")) fail("Mac testing CTA missing.");
if(!downloads.includes("Windows remains the primary download")) fail("Windows-primary disclosure missing.");
if(!downloads.includes("notarized by Apple")||!downloads.includes("Developer ID")) fail("Apple distribution disclosure missing.");
if(!downloads.includes("Open Anyway")) fail("Safe Gatekeeper guidance missing.");
if(!downloads.includes("same demo/full-license model as Windows")) fail("Same demo/full-license explanation missing.");

const winAnchor=findAnchorByText(downloads,"Download Windows VST3");
if(!winAnchor) fail("Windows VST3 download button missing.");
if(attr(winAnchor,"href")!==WIN_URL) fail("Windows download URL changed unexpectedly.");
if(!/\bia-btn-primary\b/.test(attr(winAnchor,"class"))) fail("Windows download is no longer the primary CTA.");

const cross=home+"\n"+product+"\n"+downloads+"\n"+docs+"\n"+formats+"\n"+llms+"\n"+llmsFull+"\n"+js;
if(/downloads\.html#macos-(?:beta|testing)/i.test(cross)) fail("Unsafe cross-page Mac hash link still exists.");
if(!home.includes("/downloads.html?platform=mac")) fail("Homepage Mac discovery route is not query-safe.");
if(!product.includes("/downloads.html?platform=mac")) fail("Product Mac discovery route is not query-safe.");
if(!docs.includes("/downloads.html?platform=mac")) fail("Docs Mac discovery route is not query-safe.");
if(!formats.includes("/downloads.html?platform=mac")) fail("Formats Mac discovery route is not query-safe.");

if(!product.includes("ia-side-nav-complete")) fail("Complete product side navigation lost.");
const sections=[...product.matchAll(/<section\b[^>]*\bid=["'](ia-[^"']+)["']/gi)].map(m=>m[1]);
const unique=[...new Set(sections)];
const nav=product.match(/<nav\b[^>]*aria-label=["']Impulse Anvil floating chapter navigation["'][^>]*>[\s\S]*?<\/nav>/i);
if(!nav) fail("Product side nav missing.");
for(const id of unique){
  const token='data-ia-target="'+id+'"';
  const token2="data-ia-target='"+id+"'";
  const count=(nav[0].split(token).length-1)+(nav[0].split(token2).length-1);
  if(count!==1) fail("Side nav target mismatch for "+id+": "+count);
}

console.log("PASS - Mac testing discovery uses a route-safe Downloads URL, the v1.0.123 GitHub release link is explicit, Windows remains the unchanged primary download, Apple trust disclosures remain intact, and complete product navigation is preserved.");
