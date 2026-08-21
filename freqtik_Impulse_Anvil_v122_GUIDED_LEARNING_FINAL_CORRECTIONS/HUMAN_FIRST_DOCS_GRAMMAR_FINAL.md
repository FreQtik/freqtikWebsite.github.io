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
- Show all lessons must bypass the unlock order;
- completion is self-checked;
- progress/history remain browser-local;
- no accounts/backend merely for learning progress;
- no certification or professional-qualification claim;
- when the curriculum is replaced with different lesson IDs/meaning, bump the local progress namespace instead of reusing unrelated completion or Show-all state.

### Product truths that must stay central

**Static Morph = one position.**
**A→B Lerp = movement inside the IR.**
**The curve controls how that movement behaves.**
**Draw / Path / Glue / Omni are authored movement/routing tools.**
**Bake keeps the prepared IR.**

Never let A→B Lerp become a secondary footnote in the learning sequence.

If a page is explicitly described as demo-friendly, verify it against the current license gates. Guided Learning itself is intentionally the full-workstation course.

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
