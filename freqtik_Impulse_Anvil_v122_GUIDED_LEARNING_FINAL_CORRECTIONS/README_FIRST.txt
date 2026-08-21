IMPULSE ANVIL v1.0.122
GUIDED LEARNING FINAL CORRECTIONS
=================================

This is intentionally a tiny corrective patch.

1. LERP START / LERP TIME
-------------------------
Old L02 wording overused "source-time window" immediately after ordinary
Time Morph + Linear Lerp.

New beginner wording:

  Lerp Start = where the A->B movement begins inside the IR.
  Lerp Time  = how long that movement takes.

It also asks the learner to compare short vs long Lerp Time.

Path / Omni keep their later source-time explanations where that language
actually becomes useful.

2. COLOR RESET -> UNDO
----------------------
A10 still teaches the useful COLOR-title reset gesture, but now immediately:

  Reset COLOR
  Notice the reset
  Press Undo

This restores the Color/Texture work so Chapter 2 really can begin with:
"You made complexity."

3. NEW PROGRESS NAMESPACE
-------------------------
The old 9-quest course used:
  freqtik.impulseAnvil.learning.v1

The new 34-lesson Musician-First curriculum now uses:
  freqtik.impulseAnvil.learning.v2

Old completion/show-all state is intentionally NOT migrated because the lesson
IDs and meanings changed completely.

The permanent grammar now records this rule for future curriculum replacements.

SAFETY
------
- exact SHA guards against the successfully deployed Musician-First v2 files
- main branch required
- clean worktree required
- existing permanent validators run before staging
- complete validator dependency set copied into isolated temp stage
- changes happen only in stage
- both validators run in stage
- only after STAGE PASS is the real repo backed up/written
- both validators run again after write
- rollback on post-write failure

HOW TO APPLY
------------
1. Pull origin/main.
2. Make sure GitHub Desktop Changes is clean.
3. Extract this ZIP into one folder directly inside the website repo.
4. Run:
       RUN_GUIDED_LEARNING_FINAL_CORRECTIONS.bat
5. Continue only after:
       PASS - Guided Learning final corrections applied successfully.
6. Delete the patch folder.
7. Review GitHub Desktop.
8. Test Guided Learning:
   - it starts fresh (new v2 progress namespace);
   - A10 resets COLOR and tells you to Undo;
   - Chapter 2 therefore keeps the texture;
   - L02 explains Start = where movement begins;
   - L02 explains Time = how long movement takes;
   - Show all lessons still works.
9. Commit:
       Polish Guided Learning progression
10. Push.
