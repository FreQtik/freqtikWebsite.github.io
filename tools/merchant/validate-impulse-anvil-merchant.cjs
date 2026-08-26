"use strict";

const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..", "..");
function fail(message) { throw new Error(message); }
function read(rel) { return fs.readFileSync(path.join(repo, rel), "utf8"); }

const feed = read("google-merchant-feed.xml");
const page = read("impulse-anvil.html");

function must(text, needle, label) {
  if (!text.includes(needle)) fail(label + " missing: " + needle);
}
function mustNot(text, needle, label) {
  if (text.includes(needle)) fail(label + " must not contain: " + needle);
}

must(feed, "<g:price>49.00 EUR</g:price>", "Merchant feed");
mustNot(feed, "<g:sale_price>", "Merchant feed");
must(feed, "<g:google_product_category>313</g:google_product_category>", "Merchant feed");
must(feed, "<g:identifier_exists>no</g:identifier_exists>", "Merchant feed");
must(feed, "<g:attribute_name>Morph relationships</g:attribute_name><g:attribute_value>21</g:attribute_value>", "Merchant feed");
must(feed, "own stereo convolution engine", "Merchant feed");
must(feed, "Optional reusable WAV export", "Merchant feed");
must(feed, "https://freqtik.com/assets/impulse-anvil/v122/IA_01_Master_Overview.webp", "Merchant feed");

const productScripts = [...page.matchAll(/<script\s+type=[\"']application\/ld\+json[\"']\s*>([\s\S]*?)<\/script>/gi)];
let product = null;
for (const match of productScripts) {
  try {
    const obj = JSON.parse(match[1].trim());
    const types = Array.isArray(obj["@type"]) ? obj["@type"] : [obj["@type"]];
    if (types.includes("Product")) {
      if (product) fail("More than one Product JSON-LD block found.");
      product = obj;
    }
  } catch (_) {}
}
if (!product) fail("Product JSON-LD block missing.");
if (!product.offers || String(product.offers.price) !== "49.00" || product.offers.priceCurrency !== "EUR")
  fail("Product JSON-LD price must be 49.00 EUR.");
if (!Array.isArray(product.image) || !product.image.includes("https://freqtik.com/assets/impulse-anvil/v122/IA_01_Master_Overview.webp"))
  fail("Product JSON-LD must use the current v1.0.122 master overview image.");
if (!Array.isArray(product.additionalProperty) || !product.additionalProperty.some(x => x && x.name === "Delivery" && /no physical shipping/i.test(String(x.value))))
  fail("Product JSON-LD must state digital delivery / no physical shipping.");
if (!product.additionalProperty.some(x => x && x.name === "Morph relationships" && String(x.value) === "21"))
  fail("Product JSON-LD must state 21 Morph relationships.");

console.log("PASS - Impulse Anvil Merchant feed and Product structured data are synchronized: €49, current v1.0.122 product truth, digital delivery, current images, 21 Morph relationships, internal convolution, and optional Bake.");
