# Component Library

Components assemble content blocks and visual elements into stable layouts.

## Component Spec Format

```yaml
name:
role:
accepts_blocks:
layout_contract:
desktop_grid:
mobile_order:
forbidden_children:
qa_metrics:
```

## ResponsiveSlideFrame

```yaml
role: shell
accepts_blocks: [slide_role, source]
layout_contract: fixed-stage-frame + safe-area
slot_map:
  title: title_slot
  support: support_slot
  content: content_zone
  source: content_zone_or_quiet_footer
scroll_policy: content-zone
qa_metrics: [stage_title_support_content_y_delta_zero, no_horizontal_overflow, controls_do_not_overlap_content]
```

## TitlePromise

```yaml
role: Title / Promise
accepts_blocks: [ClaimTitle, SupportText, VisualAnchor]
layout_contract: promise-visual
forbidden_children: [pills, tags, technical_kicker]
qa_metrics: [one_visual_anchor, no_title_pills]
```

## TensionSplit

```yaml
role: Tension / Why It Matters
accepts_blocks: [ClaimTitle, SupportText, AudienceTension]
layout_contract: tension-split
qa_metrics: [assumption_visible, reality_visible]
```

## FrameworkGrid

```yaml
role: Framework / Mental Model
accepts_blocks: [ClaimTitle, SupportText, FrameworkItem]
layout_contract: framework-2x2
qa_metrics: [max_4_items, card_text_short]
```

## EvidenceRight

```yaml
role: Evidence / Data
accepts_blocks: [ClaimTitle, SupportText, CaveatNote, ProofSignal, DataSource]
layout_contract: evidence-right
qa_metrics: [chart_right_of_text_desktop, chart_centered_to_support_caveat, chart_below_text_mobile]
```

## ContrastDuo

```yaml
role: Contrast / Before-After
accepts_blocks: [ClaimTitle, SupportText, BeforeState, AfterState]
layout_contract: contrast-duo
qa_metrics: [equal_panel_height, one_metric_per_side]
```

## MechanismFlow

```yaml
role: Mechanism / How It Works
accepts_blocks: [ClaimTitle, SupportText, ProcessStep]
layout_contract: mechanism-flow
qa_metrics: [steps_ordered, max_4_steps]
```

## PracticeGrid

```yaml
role: Practice / What To Do
accepts_blocks: [ClaimTitle, SupportText, Action]
layout_contract: practice-grid
qa_metrics: [max_4_actions, actions_concrete]
```

## KeyInsightPause

```yaml
role: Key Insight
accepts_blocks: [BigIdea, SupportText]
layout_contract: key-insight
forbidden_children: [cards, dense_chart, multiple_visuals]
qa_metrics: [low_noise, big_idea_clear]
```

## CTABox

```yaml
role: CTA / Next Step
accepts_blocks: [CTA]
layout_contract: cta-box
qa_metrics: [one_action, success_criterion_present]
```

## SourcesBackup

```yaml
role: Sources / Backup
accepts_blocks: [DataSource, CaveatNote]
layout_contract: sources-backup
qa_metrics: [sources_readable, boundary_present]
```

## ControlLayer

```yaml
role: interface
accepts_blocks: []
layout_contract: peripheral-controls
qa_metrics: [hit_target_44px, opacity_below_content, focus_visible]
```

## KeyboardOnlyNavigation

```yaml
role: interface
accepts_blocks: []
layout_contract: no-visible-controls
qa_metrics: [keyboard_navigation_present, overview_notes_help_keyboard_accessible, no_missing_dom_references]
```
