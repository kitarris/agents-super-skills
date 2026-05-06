# Anti-Patterns

Use this file to block common one-shot failures.

## Technical Kicker

Symptom: visible labels like `PROGRESSIVE DISCLOSURE`, `BODY CLIMATE`, `INTERACTION MAP`.

Why bad: the audience sees implementation vocabulary instead of meaning.

Replacement: use claim title or meaningful section label.

Detection: uppercase English technical phrase above title.

## Decorative Evidence

Symptom: visual is beautiful but does not prove or explain the claim.

Why bad: style competes with comprehension.

Replacement: mark as `visual_anchor` or replace with chart/diagram/comparison.

Detection: proof object message cannot be stated in one sentence.

## Equal-Weight Columns

Symptom: two columns look balanced, but alignment target is undefined.

Why bad: visual relationship is accidental.

Replacement: define alignment target: title group, support+caveat, chart center, panel baseline.

Detection: layout says only “two columns”.

## Pill Soup

Symptom: tags/pills on title or insight slides.

Why bad: looks like UI filters and adds unexplained blocks.

Replacement: one promise + one visual anchor.

Detection: 2+ small rounded labels near hero title.

## Hero Everywhere

Symptom: every slide uses huge headline scale.

Why bad: content slides lose hierarchy and spacing.

Replacement: role-based typography.

Detection: content slide headline consumes more than 25% slide height.

## Responsive Afterthought

Symptom: desktop first, then media queries patch overflow.

Why bad: semantic order breaks on mobile.

Replacement: define mobile order in layout contract before HTML.

Detection: visual comes before title/support on mobile without reason.

## Over-Interactive Deck

Symptom: sliders, 3D, hover, buttons everywhere.

Why bad: interaction competes with message.

Replacement: interaction only where it reveals process, contrast, exploration, or demo.

Detection: interaction has no slide-role mapping.

## Source Noise

Symptom: sources compete with content or controls.

Why bad: trust layer becomes visual clutter.

Replacement: quiet footer on desktop, source slide on mobile/backup.

Detection: source text larger/brighter than body copy or inside proof object.

## Table-as-Slide

Symptom: data slide is a table of facts.

Why bad: no visible insight.

Replacement: one chart or numeric contrast plus quiet source.

Detection: more than 6 cells and no highlighted signal.

## Chart Without Claim

Symptom: chart title names metric, not conclusion.

Why bad: audience must infer the point.

Replacement: action title states the insight.

Detection: title is “Revenue”, “Water Intake”, “Metrics”, etc.
