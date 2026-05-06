# Interaction Policy

Interaction must map to a slide role.

## Allowed Patterns

```yaml
progressive_disclosure:
  use_for: [Framework, Mechanism]
  avoid_for: [Title, KeyInsight]

before_after_slider:
  use_for: [Contrast]
  avoid_for: [Static facts]

3d_rotation:
  use_for: [Title visual anchor, product/object inspection]
  avoid_for: [Every slide, decorative filler]

data_toggle:
  use_for: [Evidence with one variable]
  avoid_for: [Hover-only details]

timeline_scrub:
  use_for: [Evolution, process over time]
  avoid_for: [Simple lists]
```

## Hard Rules

- No hover-only interactions.
- Minimum target size: 44px.
- Keyboard alternative required.
- No autoplay audio/video.
- Interaction must reveal causality, comparison, sequence, inspection, or exploration.
- If interaction does not clarify the claim, remove it.

## Visible Control Policy

Visible navigation controls are optional.

```yaml
visible_controls:
  use_for: [facilitated workshops, kiosk mode, non-keyboard audiences]
  avoid_for: [clean exported decks, screenshot-first decks, strict fixed-stage layouts]

keyboard_only:
  requires: [ArrowLeft, ArrowRight, Space, Shift+Space, Home, End]
  optional_shortcuts: [overview_O, presenter_notes_P, help_question_mark]
  qa_checks: [no_missing_dom_references, keyboard_navigation_present]
```

If a visible control layer is removed, scripts must not keep references to deleted DOM buttons.
