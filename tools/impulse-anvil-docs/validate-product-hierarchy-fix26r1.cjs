"use strict";
const fs=require("fs"),path=require("path");
const repo=path.resolve(__dirname,"..","..");
const files=["impulse-anvil.html","assets/freqtik-site.js"];
function fail(m){throw new Error(m);}
for(const rel of files){
  const abs=path.join(repo,...rel.split("/"));
  if(!fs.existsSync(abs)) fail("Runtime source missing: "+rel);
  const text=fs.readFileSync(abs,"utf8").toLowerCase();
  if(text.includes("build from two sources")) fail(rel+" still contains: Build from two sources");
  if(text.includes("choose two impulse responses")) fail(rel+" still contains: Choose two impulse responses");
}
const product=fs.readFileSync(path.join(repo,"impulse-anvil.html"),"utf8");
for(const marker of ["ia-single-ir-positioning","IA_REPRODUCIBLE_AUDIO_PROOF_START","NFNTsQ2_1hQ","IA_08_IR_A_Focus"]){
  if(!product.includes(marker)) fail("Commercial invariant lost: "+marker);
}
console.log("PASS - FIX26R1 finds no remaining two-source-first contradiction in the discovered product runtime source.");
