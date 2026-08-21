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

## Learning-layer rule

Gamification is a teaching aid, not a gate.

- Core docs remain freely navigable.
- Quest locks must have a "Show all" escape hatch.
- Completion is self-checked.
- Browser progress is local only.
- Do not imply certification, licensing status or professional qualification.
- Do not add accounts/backends merely to track learning.
- Prefer a dated local history over streaks or daily-pressure mechanics.
- Do not add local file pickers merely as decoration. If user-created artifacts are not meaningfully persisted or used in a real learning action, leave them out.

## Acceptance test

A newcomer who has never heard the term "impulse response" should be able to use the free demo to:

1. understand roughly why an IR matters;
2. load factory material;
3. create and hear the Time Morph A/B relationship;
4. change one source before Morph;
5. trim/sculpt a useful result;

without being instructed to use a locked feature.

With the full license, the same path should then continue naturally into:

6. additional Morph relationships;
7. Draw/Path/Glue/Omni authoring;
8. WAV Bake and reuse.

A technical user must still be able to open Technical details or Reference and find precise terminology.
