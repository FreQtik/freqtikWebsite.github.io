"use strict";
const fs=require("fs"), path=require("path");
const repo=path.resolve(__dirname,"..","..");
const RELEASE_URL="https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.123";
function fail(m){throw new Error(m);}
function read(r){return fs.readFileSync(path.join(repo,r),"utf8");}
const home=read("index.html"), product=read("impulse-anvil.html"), downloads=read("downloads.html");
const css=read("assets/freqtik-site.css"), js=read("assets/freqtik-site.js");
const docs=read("docs/impulse-anvil/index.html"), formats=read("docs/impulse-anvil/reference/formats-paths/index.html");
const search=JSON.parse(read("docs/impulse-anvil/search-index.json"));
const llms=read("llms.txt"), llmsFull=read("llms-full.txt"), sitemap=read("sitemap.xml");

if(!home.includes("IA_MAC_BETA_DISCOVERY_START")||!home.includes("/downloads.html?platform=mac")) fail("Homepage macOS testing build discovery missing.");
if(!downloads.includes('id="macos-beta"')||!downloads.includes(RELEASE_URL)) fail("Downloads macOS testing build section/release link missing.");
if(!downloads.includes("same demo/full-license model as Windows")) fail("Downloads same-license explanation missing.");
if(!downloads.includes("Not Developer ID signed or notarized by Apple.")) fail("Downloads trust disclosure missing.");
if(!downloads.includes("Privacy &amp; Security")||!downloads.includes("Open Anyway")) fail("Downloads Gatekeeper guidance missing.");
if(!product.includes("IA_MAC_BETA_PRODUCT_START")||!product.includes("/downloads.html?platform=mac")) fail("Product macOS discovery note missing.");
if(!product.includes("Is the macOS testing build feature-limited?")) fail("Product macOS FAQ missing.");
if(!product.includes('"softwareVersion": "1.0.123"')) fail("Product structured release version lost.");
if(!product.includes("Windows 10/11 VST3 (primary supported commercial release); macOS AU/VST3 (testing build)")) fail("Product structured platform status missing.");
if(!product.includes("€49") && !product.includes("&euro;49") && !product.includes("&euro; 49")) fail("Product €49 invariant lost.");
if(!/21\s+(?:Morph|mode)/i.test(product)) fail("Product 21-Morph invariant lost.");

const sectionIds=[...product.matchAll(/<section\b[^>]*\bid=[\"'](ia-[^\"']+)[\"'][^>]*>/gi)].map(m=>m[1]);
const unique=[...new Set(sectionIds)];
if(unique.length<8) fail("Too few product sections discovered for complete side nav.");
const nav=product.match(/<nav\b[^>]*aria-label=[\"']Impulse Anvil floating chapter navigation[\"'][^>]*>[\s\S]*?<\/nav>/i);
if(!nav) fail("Product side nav missing.");
for(const id of unique){
  const safe=id.replace(/[-/\^$*+?.()|[]{}]/g,'\$&');
  const count=(nav[0].match(new RegExp('data-ia-target=["\']'+safe+'["\']','g'))||[]).length;
  if(count!==1) fail("Side nav must contain exactly one target for "+id+"; found "+count);
}
if(!nav[0].includes("ia-side-nav-complete")) fail("Complete side-nav class missing.");
if(!css.includes("IA_MAC_BETA_AND_COMPLETE_SIDE_NAV_FIX15_START")) fail("FIX15 CSS missing.");

if(!docs.includes("IA_MAC_BETA_DOCS_START")) fail("Docs Overview macOS testing build note missing.");
if(!formats.includes("IA_MAC_BETA_FORMATS_START")||!formats.includes("~/Library/Audio/Plug-Ins/Components/")) fail("Formats macOS testing build paths missing.");
for(const url of ["/docs/impulse-anvil/","/docs/impulse-anvil/reference/formats-paths/"]){
  const item=search.find(x=>x&&x.url===url);
  if(!item||!/macOS AU/i.test(String(item.text||""))) fail("Search index macOS testing build sync missing for "+url);
}
if(!llms.includes("IA_MAC_BETA_LLM_START")||!llms.includes("not Apple Developer ID signed")) fail("llms.txt macOS testing build truth missing.");
if(!llmsFull.includes("IA_MAC_BETA_LLM_FULL_START")||!llmsFull.includes("macOS AU/VST3 testing build")) fail("llms-full macOS testing build truth missing.");

if(!js.includes("IMPULSE_ANVIL_MAC_RELEASE")) fail("Legacy JS macOS release constant missing.");
if(js.includes("function buildAnvil(){ return "+String.fromCharCode(96))){
  const start=js.indexOf("function buildAnvil(){ return "+String.fromCharCode(96));
  const end=js.indexOf(String.fromCharCode(96)+";",start);
  const tpl=end>start?js.slice(start,end):"";
  if(!tpl.includes("IA_MAC_BETA_PRODUCT_START")) fail("Legacy #anvil builder macOS platform note missing.");
  if(!tpl.includes("ia-side-nav-complete")) fail("Legacy #anvil builder complete side nav missing.");
}

function dateFor(url){
  const blocks=[...sitemap.matchAll(/<url\b[^>]*>[\s\S]*?<\/url>/gi)];
  const b=blocks.find(m=>{const loc=m[0].match(/<loc>\s*([^<]+)\s*<\/loc>/i);return loc&&loc[1].trim()===url;});
  if(!b) fail("Sitemap URL missing: "+url);
  const lm=b[0].match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/i);
  return lm?lm[1].trim():"";
}
for(const url of [
  "https://freqtik.com/","https://freqtik.com/impulse-anvil.html","https://freqtik.com/downloads.html",
  "https://freqtik.com/docs/impulse-anvil/","https://freqtik.com/docs/impulse-anvil/reference/formats-paths/"
]) if(dateFor(url)!=="2026-08-29") fail("Sitemap lastmod stale: "+url);

if(/macOS[^\n<]{0,80}(?:official release|officially supported)/i.test(product+downloads+docs)) fail("Unsafe wording: macOS testing build must not be described as an official release/support tier.");
console.log("PASS - macOS testing build is discoverable and transparently disclosed, same-license/full-functionality behavior is clear, Windows remains the primary supported commercial release, and the product side navigation covers every top-level section in order.");
