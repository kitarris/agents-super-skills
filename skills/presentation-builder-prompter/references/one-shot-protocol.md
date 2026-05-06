# One-Shot Protocol

## Priority Order

```text
1. clarity
2. narrative correctness
3. layout stability
4. evidence quality
5. artifact reproducibility
6. visual polish
7. interaction
8. wow effect
```

## Core Rules

- Start with audience and Big Idea, not visuals.
- Create claim spine before slide content.
- Assign slide role before layout.
- Assign layout contract before CSS.
- Save DeckSpec before or alongside HTML.
- Save Master Prompt as an artifact, not as the final default deliverable.
- Use one proof object per slide.
- If a visual does not prove or explain, treat it as background or remove it.
- If the user gives a mockup, translate it into explicit spatial constraints.

## Default One-Shot Assumptions

Use these defaults when the user gives only a topic:

- Mode: build-deck, not prompt-only.
- Format: live screen sharing, async-readable.
- Duration: 8-12 minutes.
- Slide count: 9-12.
- Style: calm editorial evidence deck.
- Interaction: minimal and meaning-led.
- Sources: required for medical, financial, legal, scientific, or quantitative claims.
- Accessibility: keyboard navigation, reduced motion, visible focus.
- Output directory: `~/.openclaw/workspace/.tmp/presentation-builder-prompter`.

## Prompt-Only Exception

Only stop at Master Prompt when the user explicitly asks for prompt-only mode. In that case, still design the Master Prompt so it requires the downstream model to create DeckSpec, HTML, QA and saved artifacts.

## One-Shot Failure Modes To Prevent

- Pretty but unstructured slides.
- Decorative evidence.
- Topic titles.
- Unplanned responsive behavior.
- Technical labels visible to audience.
- Equal-weight columns with unclear alignment target.
- Too much UI competing with content.
- Master Prompt delivered as the only artifact when the user requested a presentation.
- HTML changes that are not reflected back in DeckSpec.
- Missing QA report or undocumented screenshot limitation.
