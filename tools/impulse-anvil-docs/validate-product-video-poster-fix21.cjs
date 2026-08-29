"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const repo=path.resolve(__dirname,"..","..");
function fail(m){throw new Error(m);}function read(r){return fs.readFileSync(path.join(repo,r),"utf8");}function sha(r){return crypto.createHash("sha256").update(fs.readFileSync(path.join(repo,r))).digest("hex");}
const product=read("impulse-anvil.html"),css=read("assets/freqtik-site.css"),js=read("assets/freqtik-site.js");
for(const [name,text] of [["product",product],["legacy builder",js]]){
 const s=text.indexOf("<!-- IA_PRODUCT_VIDEO_FIX20_START -->"),e=text.indexOf("<!-- IA_PRODUCT_VIDEO_FIX20_END -->"),p=text.indexOf("<!-- IA_REPRODUCIBLE_AUDIO_PROOF_START -->");
 if(s<0||e<s)fail(name+": video block missing.");if(!(s<p))fail(name+": video must precede audio proof.");const block=text.slice(s,e);
 if(!block.includes("assets/impulse-anvil-product-showcase.webp"))fail(name+": local poster image missing.");
 if(!block.includes("Play the Impulse Anvil product showcase"))fail(name+": accessible play button missing.");
 if(!block.includes("document.createElement('iframe')"))fail(name+": click-to-load iframe creation missing.");
 if(!block.includes("youtube-nocookie.com/embed/NFNTsQ2_1hQ"))fail(name+": privacy-enhanced YouTube target missing.");
 if(/<iframe\b/i.test(block))fail(name+": eager iframe markup remains; poster must load YouTube only after click.");
 if(block.includes("srcdoc="))fail(name+": old generic srcdoc placeholder remains.");
 if(!block.includes("Watch on YouTube"))fail(name+": YouTube fallback link missing.");
}
if(!css.includes("IA_PRODUCT_VIDEO_POSTER_FIX21"))fail("FIX21 poster CSS marker missing.");
for(const needle of ["aspect-ratio:16/9",".ia-product-video-poster img","@media(max-width:760px)","@media(max-width:380px)","prefers-reduced-motion:reduce"])if(!css.includes(needle))fail("Responsive/accessibility poster rule missing: "+needle);
if(!css.includes("IA_RESPONSIVE_COMMERCIAL_POLISH_FIX19_START"))fail("FIX19 responsive state lost.");
const poster="assets/impulse-anvil-product-showcase.webp";if(!fs.existsSync(path.join(repo,poster)))fail("Poster asset missing.");if(sha(poster)!=="11341ee1d2faf573bdfe9db854012c3330cf658a3598238d160d10ba5b2b3ec8")fail("Poster asset checksum mismatch.");
console.log("PASS - FIX21 poster video: the real Impulse Anvil thumbnail is served locally, YouTube is contacted only after play, the video remains before the audio proof, and responsive/accessibility behavior is preserved.");