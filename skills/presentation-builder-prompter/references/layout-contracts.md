# Layout Contracts

Layout contract is a spatial promise. A grid class is not enough.

Each contract must define:

- areas
- alignment target
- max width
- shared frame slots
- desktop behavior
- mobile behavior
- forbidden patterns

## Global Frame Contract: `fixed-stage-frame`

Use this frame for every production deck unless the brief explicitly asks for a freeform visual essay.

```text
stage: same width, height and top-left origin on every slide within a viewport
title_slot: same y coordinate and max width on every slide
support_slot: same y coordinate below title on every slide
content_zone: same y coordinate and bottom reserve on every slide
source_slot: inside content_zone or quiet footer; never outside the safe area
scroll_policy: dense content scrolls inside content_zone, not the document
coordinate_delta: stage/title/support/content y deltas must be 0px within each tested viewport
controls: optional; if visible, outside content layer; if absent, keyboard navigation must remain
mobile: same semantic order and same slot coordinates for all slides
forbidden: centered-by-content slides that shift vertically from slide to slide
```

## `promise-visual`

```text
title: left column or centered, primary
support: below title, 1-2 lines
visual: one calm object, right or below
alignment: visual center aligns to title/support group
mobile: title -> support -> visual
forbidden: pills, tags, menu-like blocks, technical labels
```

## `tension-split`

```text
title: left or top
support: below title
panels: assumption/reality or before/after
alignment: signal panel gets restrained accent
mobile: title -> support -> panels
forbidden: long background paragraphs
```

## `framework-2x2`

```text
title: top
support: below title
cards: 2x2 below
card: number + short title + one-line body
mobile: 2 columns if readable, else 1 column
forbidden: more than 4 cards, long card body
```

## `evidence-right`

```text
title: top row, full width
text: left column, support paragraph + caveat note
chart: right column
alignment: center(chart) = center(support paragraph + caveat note)
source: quiet footer
mobile: title -> text -> chart
forbidden: chart below title on desktop unless viewport forces single column
```

## `contrast-duo`

```text
title: top
support: optional below title
left: before/problem
right: after/solution
alignment: panels equal height and equal importance unless one is intentionally highlighted
mobile: title -> support -> before -> after
forbidden: many bullets per panel
```

## `mechanism-flow`

```text
title: top
support: below title
steps: 3-4 connected blocks
alignment: horizontal flow on desktop
mobile: vertical sequence
forbidden: advice mixed into mechanism
```

## `practice-grid`

```text
title: top
support: below title
actions: 3-4 cards
alignment: equal cards, concrete commands
mobile: 2 columns or 1 column depending width
forbidden: abstract principles without action
```

## `key-insight`

```text
big_idea: centered, large, short
support: one line below
accent: minimal line or object
mobile: same semantic order
forbidden: cards, dense charts, multiple accents
```

## `cta-box`

```text
title: top or center
cta: one box with action + timeframe + success criterion
alignment: box centered below title/support
mobile: same order
forbidden: multiple competing CTA buttons
```

## `sources-backup`

```text
title: top
sources: readable list
boundary: caveat block below
mobile: sources remain readable, controls do not overlap
forbidden: tiny unreadable URLs
```
