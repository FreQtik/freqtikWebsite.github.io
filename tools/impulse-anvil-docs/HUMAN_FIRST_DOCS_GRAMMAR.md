# Impulse Anvil — Human-First Documentation Grammar

This file is a maintenance rule for future Impulse Anvil documentation work.

## Core principle

**Never make the user learn the vocabulary before they are allowed to understand the idea.**

The default reader is an intelligent first-time musician, producer, sound designer, video editor or creative user with no assumed IR/DSP knowledge.

Simple does not mean childish. Technical depth remains available.

## Teaching-page order

**WHY → DO → NOTICE → UNDERSTAND → TECHNICAL DETAILS**

1. **Why** — What can this help me do?
2. **Do** — Give a concrete action in the plugin.
3. **Notice** — Tell the user what to listen/look for.
4. **Understand** — Give the plain-language mental model.
5. **Technical details** — Precise DSP/implementation depth after the idea is already understandable.

## Feature-card order

**IDEA → LISTEN FOR → TRY IT WHEN → TECHNICAL DETAILS**

Use this especially for Morph relationships.

## Reference-page order

**CONTROL → EFFECT → IMPORTANT CONDITION**

Reference pages are for lookup. Do not force tutorials into every reference table.

## Global rules

- One unknown at a time.
- Teach the idea before attaching the specialist term.
- Teach once; reference forever.
- Hide depth, never hide consequences.
- Prefer concrete verbs: load, move, draw, compare, listen, trim, Bake.
- Prefer a worked example to another paragraph of abstraction.
- When sibling features are confusing, teach the contrast between them.
- Reconnect IR editing to the user's actual track: changing the IR changes the transformation applied to the sound.
- Do not anthropomorphize DSP. Say what is calculated/estimated/emphasized, not what the algorithm "understands."
- Friendly metaphors may explain an idea, but source truth always wins.
- Important limits, directionality, duration changes, destructive/non-destructive behavior and license restrictions must remain visible.
- A learning task must declare its license boundary before asking for a full-only action.
- A demo-friendly task must not require WAV Bake, A→B Lerp/Draw/Path/Glue/Omni, or a Morph relationship other than Time Morph.
- Technical terms may use optional hover/focus definitions at first contact. Do not auto-wrap every occurrence.
- Do not use baby talk, fake excitement or marketing superlatives in reference documentation.

## Morph mental model

**A and B are material. A Morph mode defines a relationship between them. Morph chooses the depth of that relationship. Draw/Path/Glue/Omni can author how the relationship behaves through the response.**

## Guided Learning rule

Guided Learning is the **full-workstation course**. The 5-Minute Quickstart remains the explicit demo-safe entrance.

The course is written from the musician's point of view.

**The author's original musician-language is the primary wording source.**

Allowed editing:
- spelling, grammar and punctuation;
- removing repetition;
- putting actions in a clearer order;
- correcting a factual mistake;
- making an ambiguous instruction executable.

Do NOT:
- replace ordinary words with DSP vocabulary merely because it is more exact;
- "professionalize" a direct sentence until it sounds corporate or machine-written;
- swap concrete examples for abstract terminology;
- introduce convolution/DSP language when the user does not need it to perform the action;
- turn a technically loose but contextually valid sentence into a lecture.

Technical truth is a guardrail, not the teaching voice.

### Card grammar

**ONE CARD = ONE NEW IDEA + ONE PHYSICAL ACTION + ONE THING TO NOTICE**

Prefer:
**DO FIRST → NAME SECOND → COMBINE THIRD**

Teach with obvious differences first. Subtle musical use can come later.

A user should usually be able to understand the instruction for one card in well under a minute.

Gamification is a teaching aid, not a gate:
- core docs remain freely navigable;
- normal reference docs remain freely navigable; Course Mode itself keeps future lessons locked;
- completion is self-checked;
- progress/history remain browser-local;
- no accounts/backend merely for learning progress;
- a fun completion certificate is allowed, but it must not imply professional certification or qualification;
- when the curriculum is replaced with different lesson IDs/meaning, bump the local progress namespace instead of reusing unrelated completion or Show-all state.

### Product truths that must stay central

**Static Morph = one position.**
**A→B Lerp = movement inside the IR.**
**The curve controls how that movement behaves.**
**Draw / Path / Glue / Omni are authored movement/routing tools.**
**Bake keeps the prepared IR.**

Never let A→B Lerp become a secondary footnote in the learning sequence.

If a page is explicitly described as demo-friendly, verify it against the current license gates. Guided Learning itself is intentionally the full-workstation course.


## Course Mode architecture

Guided Learning has two layers:

1. **Guided Learning page = course lobby**
2. **Impulse Anvil — Basics Course = focused Course Mode**

The lobby introduces the course and launches it. It must not permanently render the full curriculum.

Course Mode lives outside the normal documentation chrome at:
`/learn/impulse-anvil-basics/`

Once the user enters Course Mode:
- show one lesson card at a time;
- keep the rest of the website visually out of the way;
- Exit is always available;
- Previous is always available for already reached lessons;
- Next remains locked until the current lesson has been marked Done;
- the Overview is on-demand, never permanently visible;
- Overview may open completed lessons and the current lesson, but not future lessons;
- URL/hash navigation must never grant progress or unlock future lessons;
- only a contiguous sequence of completed canonical lesson IDs counts toward completion.

Animation is feedback, not delay:
- completed card leaves cleanly;
- the next card enters from above with a short fade/slide;
- target roughly 300–400 ms total perceived transition;
- always respect `prefers-reduced-motion`.

### Course wording

**Sound first. IR second. "Material" almost never.**

When the musician is loading audio, call it a sound, IR or file according to what it actually is. Keep abstract architecture vocabulary such as "material" out of the beginner course unless it genuinely helps.

Curiosity is optional:
- a beginner must be able to continue without learning technical vocabulary;
- "But I want to know" / hover explanations may reward curiosity with a real explanation;
- the explanation should still use ordinary language first.

### Local progress and completion

Course progress remains local to the browser/device.

The current Basics curriculum keeps:
`freqtik.impulseAnvil.learning.v2`

Because the lesson IDs and meanings are unchanged, existing sequential v2 progress may be preserved.

Old Show-all or out-of-order completion state must not unlock Course Mode. Only the contiguous completed prefix counts.

Track **active course time**, not wall-clock time:
- count time only while the Course Mode tab is visible;
- pause on `visibilitychange` / `pagehide`;
- resume when visible again.

A local **Certificate of Completion** is allowed as a fun reward after all canonical lessons are complete.

It may show:
- Impulse Anvil — Basics Course;
- ANVIL OPERATOR;
- completion date/time;
- active course duration;
- optional locally entered name;
- local PNG save.

It must not claim professional certification, formal qualification or externally verified skill.

The certificate is generated locally. Nothing is uploaded.

## Acceptance test

A musician with no DSP background should be able to work through Guided Learning and naturally reach this sequence:

1. I can load material into A.
2. I can change A and understand Time / Normalize / Gain.
3. I can hear what Color, Offset and Texture are doing.
4. I can remove unwanted frequencies, isolate a useful piece and finish the IR.
5. I can Bake my first IR.
6. I can rebuild the same idea in B from memory.
7. I understand that Morph creates a relationship between A and B.
8. I understand the difference between one static Morph position and A→B Lerp.
9. I can Draw / Path / Glue / Omni movement without needing their DSP implementation first.
10. I can Bake, re-import and build another generation.

At no point should the reader need to Google a technical term in order to perform the next action.

A technical user must still be able to open Technical details or Reference and find precise terminology.
