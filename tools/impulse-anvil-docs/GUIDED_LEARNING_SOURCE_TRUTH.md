# Impulse Anvil Guided Learning — v141ay Source-Truth Ledger

Basis:
`IA_v141ay_1.0.122_omni_multistroke_buildfix_full_source`

Purpose:
This file protects the human teaching language from two opposite errors:
1. teaching something the plugin does not actually do;
2. replacing a simple true instruction with unnecessary DSP vocabulary.

The public Guided Learning copy should stay musician-first. This ledger is for maintainers.

## Loading

- Clicking the visible A/B filename opens the IR Library:
  `Source/PluginEditor.cpp` — `lblA.onClick`, `lblB.onClick`.
- Double-clicking a file row loads it:
  `IRLibraryOverlay::listBoxItemDoubleClicked`.
- Supported creative file extensions in the UI/index:
  WAV, AIF, AIFF, FLAC.
- Drag/drop accepts WAV/AIF/AIFF/FLAC onto A/B.

Human wording allowed:
**"In Impulse Anvil, any WAV can become an IR."**

Do not interrupt that beginner sentence with acoustic-measurement theory. The technical definition of an impulse response belongs in technical reference.

## A/B preparation

- Slot Time changes the time scale before Color and Morph.
- Slot Normalize is per-slot and occurs after Color/Texture, before slot Gain.
- Slot Gain remains active after Normalize.
- Moving a Color Time/Offset/Amount slider automatically enables that Color voice.
- Color Offset range is 0–500 ms.
- Color Amount range is -24 to +24 dB.
- Texture Depth is full-license only, 0–4.
- Depth 0 = off; 1–4 adds recursive Color layers.
- One active Color is reused through recursive layers.
- With both Colors active, layers alternate C1 / C2.
- Color 2 is full-license only.

## EQ

- The selected Bell can be dragged horizontally for frequency and vertically for boost/cut.
- Double-click another Bell node to select it.
- Mouse wheel over the graph changes the selected Bell Q/bandwidth.
- Shift = fine, Ctrl = very fine for EQ graph wheel behavior.
- HP removes lows below its cutoff.
- LP removes highs above its cutoff.

## EDIT

- Start/End choose the prepared IR slice.
- Link Start/End keeps the current slice length fixed while scanning.
- Slider fine-drag system samples Shift for fine and Ctrl for ultra-fine at drag start.
- Start after End is a valid reverse slice.
- Fade In and Fade Out lengths are editable.
- Fade Out + uses the inverted fade-out shape, producing a swell/stutter-style ending.

## OUT

- OUT Normalize defaults ON.
- OUT Limiter defaults ON.
- OUT Normalize peak-normalizes the final prepared/baked IR after EQ and Width.
- IR In changes the prepared/baked IR level. With OUT Normalize on, normalization largely cancels that level change.
- Width range is 0–2:
  - 0 = mono;
  - 1 = original side level;
  - above 1 = wider existing stereo side information.
- Dry/Wet, Wet Level and Out are playback controls.
- Dry/Wet, Wet Level and Out are NOT baked.
- IR In, Width, OUT Normalize and the IR-side Limiter ARE part of Bake.

Human wording allowed:
**"OUT Normalize manages the loudness of the final IR automatically."**

## Reset / recovery

- Global Undo/Redo history covers the taught parameter edits.
- Double-click COLOR title resets that slot's Color/Texture.
- Double-click EQ / EDIT / OUT titles resets that section.
- OPTIONS contains exact menu item:
  `Init / Reset Controls (keep IRs)`.

## Morph

- Ordinary Morph with A→B Lerp OFF builds one static Morph snapshot at the current Morph position.
- Linear / Exp / Log / S-Curve / Draw can shape ordinary Morph position.
- Path / Glue / Omni are not ordinary static-Morph transfer curves.
- The full license exposes the complete Morph relationship collection.

## A→B Lerp — central teaching truth

- A→B Lerp is full-license only.
- When A→B Lerp is active, the ordinary Morph knob is deliberately not meaningful / disabled.
- The selected Morph Mode is rendered through the authored curve/route.
- Preview and Bake share the same mode-aware Lerp renderer.
- Lerp Start and Lerp Time define the selected source-time window for normal authored Lerp/Path/Omni behavior.
- Glue owns its constructed duration independently of Lerp Start/Time.
- Path can revisit earlier source-time.
- Omni:
  - X = source-time in the selected Lerp window;
  - Y = A/B relationship depth;
  - movement in X OR Y consumes output time;
  - supports up to six free strokes.
- Glue:
  - free strokes;
  - timing comes from horizontal source-time travel only;
  - duration independent of Lerp Start/Time.

Required beginner distinction:
**Static Morph = one position.**
**A→B Lerp = movement inside the IR.**

Do not bury this distinction.

## Bake

- Demo cannot Bake.
- Bake exports the exact current prepared/export-ready IR.
- Bake includes:
  A/B processing, Morph/Lerp/Draw/Path/Omni/Glue, EDIT, EQ, Width, IR In, OUT Normalize and IR-side Limiter.
- Bake excludes:
  Dry/Wet, Wet Level and Out.
- Output format is 32-bit float WAV.
- Prepared IR safety cap is 30 seconds.

Human wording allowed:
**"Bake keeps the IR you've built."**

Add the listening-control caveat only where it matters:
**"Dry/Wet, Wet Level and Out are only for how you listen inside the plugin, so those three aren't baked."**
