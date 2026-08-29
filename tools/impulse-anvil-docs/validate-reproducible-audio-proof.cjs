"use strict";

const fs=require("fs"),path=require("path"),crypto=require("crypto");
const repo=path.resolve(__dirname,"..","..");
function fail(m){throw new Error(m);}
function read(r){return fs.readFileSync(path.join(repo,r),"utf8");}
function hash(r){return crypto.createHash("sha256").update(fs.readFileSync(path.join(repo,r))).digest("hex");}
function section(html,id){
  const rx=new RegExp("<section\\b[^>]*\\bid=[\"']"+id+"[\"'][^>]*>","i");
  const m=rx.exec(html); if(!m) return "";
  const end=html.indexOf("</section>",m.index+m[0].length);
  return end<0?"":html.slice(m.index,end+"</section>".length);
}

const product=read("impulse-anvil.html");
const about=read("about.html");
const css=read("assets/freqtik-site.css");
const js=read("assets/freqtik-site.js");
const llms=fs.existsSync(path.join(repo,"llms.txt"))?read("llms.txt"):"";
const llmsFull=fs.existsSync(path.join(repo,"llms-full.txt"))?read("llms-full.txt"):"";

const sound=section(product,"ia-sound");
if(!sound.includes("IA_REPRODUCIBLE_AUDIO_PROOF_START")) fail("Featured audio proof missing from #ia-sound.");
if(!sound.includes("This sound. Through this IR. Becomes this.")) fail("Featured proof headline missing.");
if(!sound.includes("More transformations")) fail("Existing examples transition missing.");
if(sound.indexOf("IA_REPRODUCIBLE_AUDIO_PROOF_START")>=sound.indexOf("ia-audio-grid")) fail("Featured proof must appear before existing examples.");
if(!sound.includes("assets/audio/ia-proof-bad-synth-chords-dry.mp3")) fail("Dry proof source missing.");
if(!sound.includes("assets/audio/ia-proof-mystic-march-2-ir.wav")) fail("IR proof source missing.");
if(!sound.includes("assets/audio/ia-proof-bad-synth-chords-anvil.mp3")) fail("Anvil result source missing.");
if(!/download=["']ImpulseAnvil_MysticMarch2\.wav["']/i.test(sound)) fail("Exact IR download filename missing.");
if(!sound.includes("Download this IR · WAV")) fail("IR download action missing.");
if((sound.match(/class=["'][^"']*ia-wave-player/g)||[]).length<6) fail("Existing examples appear to have been replaced rather than preserved.");

if(!css.includes("IA_REPRODUCIBLE_AUDIO_PROOF_FIX16_START")) fail("FIX16 proof styles missing.");

const disliked="Projects begin with a practical problem, an unusual creative possibility or a system that becomes easier to understand through direct interaction. The result may be a focused VST3, a browser game, a production framework or something in between.";
for(const [name,text] of [["about.html",about],["assets/freqtik-site.js",js],["llms.txt",llms],["llms-full.txt",llmsFull]]){
  if(text.replace(/\s+/g," ").includes(disliked)) fail("Disliked About sentence remains in "+name);
}

const expected={
  "assets/audio/ia-proof-bad-synth-chords-dry.mp3":"41dd840f5e0f65213d5c66a3d1587e1874a510fea6e1310fdb1652aab33056de",
  "assets/audio/ia-proof-bad-synth-chords-anvil.mp3":"d545fd4f93870c6044d32e10698519c4653c997bd4b5572bab6aa4c670706893",
  "assets/audio/ia-proof-mystic-march-2-ir.wav":"b8bd17c3d5c36aaa8130761e400a7787a0775caa44db3af38fc2f0aa0ba05629"
};
for(const [r,h] of Object.entries(expected)){
  if(!fs.existsSync(path.join(repo,r))) fail("Audio asset missing: "+r);
  if(hash(r)!==h) fail("Audio asset checksum mismatch: "+r);
}

if(!/1\.0\.123/.test(product)) fail("v1.0.123 product truth lost.");
if(!/(?:€\s*49|&euro;\s*49|49\.00)/i.test(product)) fail("€49 truth lost.");
if(!/21\s+(?:Morph|relationship|mode)/i.test(product)) fail("21-Morph truth lost.");
if(!/macOS testing build/i.test(product)) fail("macOS testing-build disclosure lost.");
if(!/primary supported commercial release/i.test(product)) fail("Windows-primary truth lost.");

console.log("PASS - The Hear It section now opens with a compact, reproducible Dry → IR → Anvil proof; Mystic March 2 is downloadable as the exact WAV; existing audio examples remain intact; and the disliked About sentence is removed from public and legacy discovery surfaces.");
