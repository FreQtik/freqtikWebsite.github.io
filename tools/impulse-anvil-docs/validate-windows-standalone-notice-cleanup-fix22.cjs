"use strict";

const fs=require("fs"),path=require("path");
const repo=path.resolve(__dirname,"..","..");
function fail(m){throw new Error(m);}
function strip(s){return String(s).replace(/<[^>]+>/g," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;/gi,"&").replace(/\s+/g," ").trim();}
function attr(a,n){
  const rx=new RegExp("\\b"+n+"=(?:\\\"([^\\\"]+)\\\"|'([^']+)')","i");
  const m=String(a).match(rx);
  return m?(m[1]||m[2]||""):"";
}
function anchor(html,text){
  for(const m of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)){
    if(strip(m[0])===text) return m[0];
  }
  return "";
}

const d=fs.readFileSync(path.join(repo,"downloads.html"),"utf8");
const js=fs.readFileSync(path.join(repo,"assets","freqtik-site.js"),"utf8");
const RELEASE="https://github.com/FreQtik/freqtikWebsite.github.io/releases/tag/v1.0.123";

if(!/Current\s+v?1\.0\.123/i.test(d)) fail("Current v1.0.123 missing.");
if(!/Get license\s+(?:€|&euro;)\s*49/i.test(d)) fail("€49 license CTA missing.");
if(!/v1\.0\.123[\s\S]{0,300}Stability Fix|Stability Fix[\s\S]{0,300}v1\.0\.123/i.test(d)) fail("v1.0.123 Stability Fix missing.");

const vst3=anchor(d,"Download Windows VST3");
const stand=anchor(d,"Windows Standalone");
if(!vst3) fail("Windows VST3 CTA missing.");
if(!stand) fail("Windows Standalone CTA missing.");
if(!/\bia-btn-primary\b/.test(attr(vst3,"class"))) fail("VST3 is not primary.");
if(!/\bia-btn-dark\b/.test(attr(stand,"class"))) fail("Standalone is not secondary.");
if(attr(stand,"href")!==RELEASE) fail("Standalone release target incorrect.");

const stale=/Current(?:\s|&nbsp;|&#160;|<[^>]*>)*1\.0\.122(?:\s|&nbsp;|&#160;|<[^>]*>)*package(?:\s|&nbsp;|&#160;|<[^>]*>)*includes(?:\s|&nbsp;|&#160;|<[^>]*>)*Omni(?:\s|&nbsp;|&#160;|<[^>]*>)*Path\./i;
if(stale.test(d)||stale.test(js)) fail("Obsolete 1.0.122 Omni Path notice remains.");

console.log("PASS - Windows VST3 remains primary, Windows Standalone is available from the v1.0.123 GitHub release, the €49/current-release state is intact, and the obsolete 1.0.122 Omni Path notice is gone.");
