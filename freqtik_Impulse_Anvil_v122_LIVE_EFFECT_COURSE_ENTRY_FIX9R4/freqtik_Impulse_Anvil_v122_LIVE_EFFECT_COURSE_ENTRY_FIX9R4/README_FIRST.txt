Impulse Anvil v1.0.122 - Live Effect + Course Entry FIX9R4
========================================================

PURPOSE
-------
FIX9R4 supersedes FIX9/FIX9R1/FIX9R2/FIX9R3.

This is the same communication/learning-entry hardening pass, with the remaining machine-readable Acoustic Bodies cleanup made structural and line-ending agnostic.

It establishes one consistent rule across product/docs/course/discovery:

  ANVIL IS THE EFFECT.
  Put it on a playing instrument/audio track and hear the response while you design it.
  Preset = save the complete Anvil setup/session.
  Bake = optional export of the designed response as WAV.

It also:
- adds a direct Basics Course CTA to the product page
- moves the Guided Learning course launch to the top of the lobby
- makes the launch action look unmistakably like a real button
- teaches start playback / keep a short loop running in Quickstart and A01
- teaches preset Save/Load vs Bake in existing lesson B03 without changing lesson IDs
- removes Acoustic Bodies from the main product-page sales narrative and its two niche FAQs
- keeps the Acoustic Bodies workflow in the documentation
- removes Acoustic Bodies from top-level llms.txt / llms-full.txt product highlights
- synchronizes affected docs-search entries and sitemap dates
- extends the existing fail-closed validator with FIX9 + FIX9R4 regression guards

FIX9R4 HARDENING
----------------
The llms.txt and llms-full.txt Acoustic Bodies references are now removed by semantic line identity:

  label: Acoustic bodies & comparison:
  URL:   https://freqtik.com/docs/impulse-anvil/workflows/acoustic-bodies/

The remover is intentionally independent of:
- bullet vs no bullet
- indentation
- spaces/tabs
- CRLF vs LF
- final newline presence

Zero matches means already fixed. Exactly one match is removed. Multiple matches fail closed as ambiguous.

The permanent validator now also rejects this top-level Acoustic Bodies prominence if it ever returns to either machine-readable file.

SAFETY
------
- Preflights v1.0.122 / EUR49 / visible 21-Morph truth / Draw-Path-Glue-Omni.
- Preserves the exact 34 lesson IDs/order and learning.v2 progress namespace.
- Does not change Course Mode unlock/progress/certificate/runtime architecture.
- Does not change checkout URLs, audio examples, price, release version, DSP behavior, demo limits, or site-wide CSS/JS architecture.
- Writes are transactional: if post-write validation fails, original files are restored automatically.
- Idempotent: a second run writes nothing.
- Tested with both Windows CRLF and Unix LF line endings.

APPLY
-----
1. Extract this folder somewhere INSIDE your repository:
     J:\GithubWebsite\freqtikWebsite.github.io
2. Double-click RUN_PATCH.cmd
3. Look for:
     Preflight + in-memory validation: PASS
   and the final PASS line.
4. From the repository root run:

   git diff --check
   git diff -- impulse-anvil.html docs/impulse-anvil assets/impulse-anvil-course llms.txt llms-full.txt sitemap.xml tools/impulse-anvil-docs/validate-learning.cjs
   git status --short

5. Review visually before pushing, especially:
   - product page workflow + Basics Course button
   - Guided Learning top course button
   - Quickstart Step 1 and Step 7

COURSE IMAGES
-------------
Intentionally not added. The learner should look at and operate the real plugin instead of matching screenshots.

CREATIVE TECHNIQUES COURSE
--------------------------
Intentionally not bundled here. It should be a separate atomic follow-up built on the stable Course Mode architecture.
