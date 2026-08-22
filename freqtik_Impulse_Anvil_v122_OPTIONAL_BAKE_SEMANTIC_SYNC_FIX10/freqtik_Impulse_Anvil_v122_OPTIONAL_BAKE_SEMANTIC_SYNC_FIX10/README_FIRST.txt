Impulse Anvil v1.0.122 - Optional Bake Semantic Sync FIX10
==========================================================

Purpose
-------
Synchronize the last Bake-centric wording on the general homepage and Docs Overview with the already-landed FIX9 rule:

  ANVIL IS THE EFFECT.
  Preset = save the whole setup.
  Bake = optional export of the response as a WAV.

FIX10 changes only:
  - index.html
  - docs/impulse-anvil/index.html
  - docs/impulse-anvil/search-index.json
  - tools/impulse-anvil-docs/validate-learning.cjs

It intentionally does NOT change:
  - impulse-anvil.html
  - Course Mode JS/CSS/lesson IDs/progress
  - Quickstart / Guided Learning / Bake docs
  - llms.txt / llms-full.txt
  - sitemap.xml (the affected URLs are already dated 2026-08-22)
  - price, version, features, checkout, CSS or site-wide JS

Apply
-----
1. Extract this folder somewhere inside freqtikWebsite.github.io.
2. Double-click RUN_PATCH.cmd.
3. Require final PASS.
4. From repository root review:

   git diff --check
   git diff -- index.html docs/impulse-anvil/index.html docs/impulse-anvil/search-index.json tools/impulse-anvil-docs/validate-learning.cjs
   git status --short

The patch is idempotent and transactional. If a post-write validator fails, original files are restored.
