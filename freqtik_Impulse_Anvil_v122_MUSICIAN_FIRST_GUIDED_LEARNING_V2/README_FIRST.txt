IMPULSE ANVIL v1.0.122
MUSICIAN-FIRST GUIDED LEARNING v2
=================================

WHAT CHANGED
------------
Guided Learning is now the full-workstation course.

The 5-Minute Quickstart remains the explicit demo-safe entrance.

The course no longer begins with A+B+Morph.
It begins with one tiny action at a time:

CHAPTER 1 - MEET A
- click A
- click filename
- double-click any file to load it
- Undo / Redo
- Time
- Normalize + Gain
- Color Time
- Color Amount
- Color Offset
- Texture Depth
- Color 2
- reset Color

CHAPTER 2 - SHAPE THE RESULT
- EQ Bell
- Bell width with mouse wheel
- HP / LP
- EDIT Start / End
- linked scanning
- Shift fine / Ctrl very fine
- reverse
- fades + Fade Out+
- OUT Normalize + Limiter
- IR In
- Width
- Wet Level / Dry-Wet / Out distinction
- first Bake

CHAPTER 3 - BUILD B YOURSELF
- rebuild the A workflow from memory
- understand that EQ / EDIT / OUT affect the prepared result
- reset section gestures
- OPTIONS -> Init / Reset Controls (keep IRs)

CHAPTER 4 - MEET MORPH
- static Time Morph first
- built-in curves
- "Taste every Morph" listening exercise
- no requirement to understand the modes before hearing them

CHAPTER 5 - WRITE MOVEMENT
Central rule:
  Static Morph = one position.
  A->B Lerp = movement inside the IR.

Then:
- Lerp Start / Time
- Draw
- Path
- Glue
- Omni
- Bake the movement

CHAPTER 6 - BAKING IS NOT THE END
- reimport your Bake
- make Generation 2
- final independent IR

VOICE RULE
----------
The user's musician-language is now an explicit maintenance rule.

Allowed:
- spelling/grammar cleanup
- clearer order
- factual correction
- making an instruction executable

Not allowed:
- replacing simple language with DSP jargon
- making direct wording sound corporate / AI-written
- adding convolution terminology when the user does not need it
- replacing examples with abstract descriptions

A new source-truth ledger records the v141ay implementation facts separately:
  tools/impulse-anvil-docs/GUIDED_LEARNING_SOURCE_TRUTH.md

This lets the public course stay human while future edits still have a technical
truth source.

SAFETY
------
- exact SHA guards against the currently deployed FIX2 learning article/JS/CSS/
  validator/grammar
- main branch required
- clean worktree required
- both current permanent validators run first
- complete validator dependency set copied into isolated temp stage:
    docs/impulse-anvil/
    tools/impulse-anvil-docs/
    index.html
    impulse-anvil.html
    sitemap.xml when present
- transformation happens only in stage
- both validators run in stage
- production repo is touched only after STAGE PASS
- exact changed files are backed up
- both validators run again after write
- rollback on post-write failure

HOW TO APPLY
------------
1. Pull origin/main.
2. Make sure GitHub Desktop Changes is clean.
3. Extract this ZIP into ONE folder directly inside:
       J:\GithubWebsite\freqtikWebsite.github.io
4. Run:
       RUN_GUIDED_LEARNING_V2.bat
5. Continue only after:
       PASS - Musician-First Guided Learning v2 applied successfully.
6. Delete the patch folder.
7. Review GitHub Desktop.
8. Open:
       /docs/impulse-anvil/getting-started/guided-learning/
9. Test:
   - only A01 starts unlocked;
   - Done unlocks the next lesson;
   - changing chapters scrolls to the next chapter heading;
   - Show all lessons exposes everything;
   - Reset progress works;
   - progress/history remain local;
   - no WAV upload/file picker exists.
10. Commit:
       Add musician-first Guided Learning v2
11. Push.
