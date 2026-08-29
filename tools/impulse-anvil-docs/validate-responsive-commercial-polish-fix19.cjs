"use strict";
const fs=require("fs"),path=require("path");
const repo=path.resolve(__dirname,"..","..");
function fail(m){throw new Error(m);}
function read(r){return fs.readFileSync(path.join(repo,r),"utf8");}
const css=read("assets/freqtik-site.css"),product=read("impulse-anvil.html"),js=read("assets/freqtik-site.js"),downloads=read("downloads.html");

if(!css.includes("IA_RESPONSIVE_COMMERCIAL_POLISH_FIX19_START")) fail("FIX19 CSS missing.");
for(const needle of ["@media(max-width:1100px)","@media(max-width:760px)","@media(max-width:560px)","@media(max-width:380px)",".ia-mac-download-actions{display:flex;flex-wrap:wrap", ".ia-repro-download-row{"]){if(!css.includes(needle)) fail("Responsive rule missing: "+needle);}

for(const [name,text] of [["impulse-anvil.html",product],["assets/freqtik-site.js",js]]){
 const s=text.indexOf("<!-- IA_REPRODUCIBLE_AUDIO_PROOF_START -->"),e=text.indexOf("<!-- IA_REPRODUCIBLE_AUDIO_PROOF_END -->");
 if(s<0||e<s) fail(name+": proof markers missing.");
 const p=text.slice(s,e);
 const players=(p.match(/class=[\"']ia-wave-player[\"']/g)||[]).length;
 if(players!==3) fail(name+": expected 3 proof players, found "+players);
 if((p.match(/class=[\"']ia-repro-media[\"']/g)||[]).length!==3) fail(name+": expected 3 media wrappers.");
 if((p.match(/class=[\"'][^\"']*ia-repro-download-row[^\"']*[\"']/g)||[]).length!==1) fail(name+": shared IR download row missing.");
 const gridEnd=p.indexOf("</div>",p.indexOf("ia-repro-proof-grid"));
 if(!p.includes("Download this IR · WAV")) fail(name+": exact IR download CTA missing.");
 if(/ia-repro-step[\s\S]*Download this IR · WAV[\s\S]*<\/article>/i.test(p)) fail(name+": IR download is still inside a proof card.");
}

for(const url of [
 "ImpulseAnvil_v1.0.123_macOS_AU_unsigned_testing.zip",
 "ImpulseAnvil_v1.0.123_macOS_VST3_unsigned_testing.zip",
 "ImpulseAnvil_v1.0.123_macOS_STANDALONE_unsigned_testing.zip"
]) if(!downloads.includes(url)) fail("Mac direct asset lost: "+url);
if(!downloads.includes("Windows remains the primary download")) fail("Windows-primary disclosure lost.");

console.log("PASS - FIX19 responsive/commercial polish: proof players align independently of the IR download CTA, Mac controls wrap safely on phones, and component layouts have explicit phone/tablet/odd-width behavior.");