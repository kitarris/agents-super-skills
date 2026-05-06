# QA Rubric

## Narrative QA

- Reading only titles forms a story.
- Every non-backup slide has one claim.
- Every claim has a proof object or deliberate pause role.
- No topic titles on content slides.

## Layout QA

- No overlap.
- No horizontal overflow.
- Headline above paragraph.
- Minimum headline -> paragraph gap: 28px desktop, 20px mobile.
- Visual alignment target respected.
- Controls outside content layer.
- Fixed-frame decks: stage/title/support/content-zone y deltas are 0px within each tested viewport.
- Dense content scrolls inside content-zone; document-level slide scroll is a layout failure unless explicitly approved.
- Visible controls are optional. If controls are absent, keyboard navigation and help/notes/overview shortcuts must still work.

## Data QA

- Chart title is a conclusion.
- One highlighted signal.
- Caveat present when data can be misread.
- Source quiet but present.
- Sample data marked.

## Responsive QA

- Desktop: intended columns preserved.
- Tablet: readable with reduced density.
- Mobile: semantic order preserved.
- Sources do not compete with controls.

## Component QA Examples

EvidenceRight:

```text
desktop:
  chart is right of text
  center(chart) ~= center(support + caveat)
mobile:
  title -> text -> chart
```

FrameworkGrid:

```text
cards <= 4
number badges readable
card body <= 1 line where possible
```
