Impulse Anvil v1.0.122 - Optional Bake Semantic Sync FIX10R2
=============================================================

Purpose
-------
Synchronize the last Bake-centric wording on the general homepage and Docs Overview with the already-landed FIX9 rule:

  ANVIL IS THE EFFECT.
  Preset = save the whole setup.
  Bake = optional export of the response as a WAV.

FIX10R2 is the corrected Windows-safe revision of FIX10R1.
It fixes a deeper Git whitespace-policy issue on CRLF working trees. Git can otherwise classify the CR in a normal CRLF line ending as trailing whitespace.

FIX10R2 validates with:

  git -c core.whitespace=cr-at-eol diff --check

This tells Git that CR is part of the line ending, while genuine spaces/tabs before CRLF still fail closed and restore the original files. The patch does not change repository Git configuration.

FIX10R2 changes only:
  - index.html
  - docs/impulse-anvil/index.html
  - docs/impulse-anvil/search-index.json
  - tools/impulse-anvil-docs/validate-learning.cjs

It intentionally does NOT change:
  - impulse-anvil.html
  - Course Mode JS/CSS/lesson IDs/progress
  - Quickstart / Guided Learning / Bake docs
  - llms.txt / llms-full.txt
  - sitemap.xml
  - price, version, features, checkout, CSS or site-wide JS

Apply
-----
1. Discard/ignore the old FIX10 folder.
2. Extract this folder somewhere inside freqtikWebsite.github.io.
3. Double-click RUN_PATCH.cmd.
4. Require final PASS.
5. From repository root review:

   git -c core.whitespace=cr-at-eol diff --check
   git diff -- index.html docs/impulse-anvil/index.html docs/impulse-anvil/search-index.json tools/impulse-anvil-docs/validate-learning.cjs
   git status --short

The patch is idempotent and transactional. If a genuine post-write validator fails, original files are restored.
