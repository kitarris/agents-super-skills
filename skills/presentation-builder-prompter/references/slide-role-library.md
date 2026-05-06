# Slide Role Library

Every slide must have one role. If one slide needs two roles, split it.

## Role Spec Format

```yaml
role:
  purpose:
  title_formula:
  content_slots:
  proof_object:
  default_component:
  default_layout:
  forbidden:
  qa_checks:
```

## 1. Title / Promise

```yaml
purpose: give a promise, not a topic
title_formula: "[Topic] helps [audience] get [result] without [friction]"
content_slots: [claim_title, support_text, visual_anchor]
proof_object: visual_anchor
default_component: TitlePromise
default_layout: promise-visual
forbidden: [pills, tags, menus, technical_kicker, long_explainer]
qa_checks: [promise_is_clear, one_visual_anchor, no_title_pills]
```

## 2. Tension / Why It Matters

```yaml
purpose: show why the topic is not trivial
title_formula: "Мы думаем, что проблема в X, но на практике она в Y"
content_slots: [claim_title, support_text, audience_tension]
proof_object: contrast_or_tension_panels
default_component: TensionSplit
default_layout: tension-split
forbidden: [generic_problem_statement, long_background]
qa_checks: [tension_visible_in_3_seconds, assumption_vs_reality_present]
```

## 3. Framework / Mental Model

```yaml
purpose: give the audience a map
title_formula: "[Topic] держится на [N] частях"
content_slots: [claim_title, support_text, framework_items]
proof_object: cards_or_diagram
default_component: FrameworkGrid
default_layout: framework-2x2
forbidden: [more_than_4_blocks, long_card_copy]
qa_checks: [max_4_items, one_line_per_item, grid_stable_mobile]
```

## 4. Evidence / Data

```yaml
purpose: prove one claim with one signal
title_formula: "Данные показывают, что [вывод]"
content_slots: [claim_title, support_text, caveat_note, proof_signal, data_source]
proof_object: chart_or_numeric_contrast
default_component: EvidenceRight
default_layout: evidence-right
forbidden: [table_as_slide, chart_without_claim, caveat_footer_only]
qa_checks: [title_is_claim, chart_supports_title, chart_centered_to_summary_caveat]
```

## 5. Contrast / Before-After

```yaml
purpose: make a choice obvious
title_formula: "A делает X, B делает Y"
content_slots: [claim_title, support_text, before_state, after_state, conclusion]
proof_object: side_by_side_comparison
default_component: ContrastDuo
default_layout: contrast-duo
forbidden: [many_bullets_per_side, unclear_before_after]
qa_checks: [contrast_readable_in_3_seconds, equal_panel_weight]
```

## 6. Mechanism / How It Works

```yaml
purpose: explain a process
title_formula: "Когда происходит A, система делает B"
content_slots: [claim_title, support_text, steps]
proof_object: process_flow
default_component: MechanismFlow
default_layout: mechanism-flow
forbidden: [advice_mixed_with_mechanism, more_than_4_steps_without_reveal]
qa_checks: [steps_ordered, max_4_steps, mobile_order_preserved]
```

## 7. Practice / What To Do

```yaml
purpose: give concrete action
title_formula: "Не заставляйте себя X; измените среду так, чтобы Y"
content_slots: [claim_title, support_text, actions]
proof_object: action_grid
default_component: PracticeGrid
default_layout: practice-grid
forbidden: [abstract_advice, more_than_4_actions]
qa_checks: [actions_concrete, max_4_actions]
```

## 8. Key Insight

```yaml
purpose: make the main idea memorable
title_formula: "Главный вывод не в X, а в Y"
content_slots: [big_idea, support_text, minimal_accent]
proof_object: pause
default_component: KeyInsightPause
default_layout: key-insight
forbidden: [cards, dense_text, multiple_visuals]
qa_checks: [pause_slide_low_noise, big_idea_clear]
```

## 9. CTA / Next Step

```yaml
purpose: give the next step
title_formula: "Сегодня сделайте [one action] в [one context]"
content_slots: [claim_title, cta_action, timeframe, success_criterion]
proof_object: cta_box
default_component: CTABox
default_layout: cta-box
forbidden: [multiple_primary_actions, vague_next_step]
qa_checks: [one_action, one_timeframe, success_criterion_present]
```

## 10. Sources / Backup

```yaml
purpose: establish trust and boundaries
title_formula: "Источники задают границы"
content_slots: [source_list, boundary_note]
proof_object: source_list
default_component: SourcesBackup
default_layout: sources-backup
forbidden: [sources_competing_with_main_slides]
qa_checks: [sources_present, high_stakes_boundary_present]
```
