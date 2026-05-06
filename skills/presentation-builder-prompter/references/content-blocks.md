# Content Blocks

Content blocks are semantic units. They do not know CSS.

## Spec Format

```yaml
name:
purpose:
required_when:
fields:
max_length:
forbidden:
qa_checks:
```

## ClaimTitle

```yaml
purpose: slide claim, not topic
fields: [text, role]
max_length: 5-11 words for live deck
forbidden: [topic_label, technical_label]
qa_checks: [is_action_title, fits_role]
```

Good: `Норма воды считает не только стаканы`  
Bad: `Сколько нужно?`

## SupportText

```yaml
purpose: explain the claim briefly
fields: [text, tone]
max_length: 1-2 lines
forbidden: [second_claim, title_repetition]
qa_checks: [short_enough, no_duplicate_title]
```

## CaveatNote

```yaml
purpose: constrain interpretation of data or recommendations
fields: [text, severity, accent]
required_when: [medical_claim, financial_claim, legal_claim, quantitative_norm]
forbidden: [hidden_only_in_footer]
qa_checks: [visible_near_support, mobile_order_after_support]
```

## ProofSignal

```yaml
purpose: one signal that proves the claim
fields: [type, message, highlight]
types: [metric, chart, comparison, diagram, image, demo, quote]
forbidden: [decorative_visual_as_proof]
qa_checks: [supports_claim, one_signal_only]
```

## Metric

```yaml
purpose: numeric fact
fields: [label, value, unit, source_id]
forbidden: [unitless_number, sourceless_metric]
qa_checks: [unit_exists, source_exists]
```

## DataSource

```yaml
purpose: trust anchor for a fact
fields: [label, url, trust_level, date_accessed]
trust_level: official | primary | secondary | sample
qa_checks: [url_or_citation_present, sample_marked]
```

## AudienceTension

```yaml
purpose: make the stakes visible
fields: [assumption, reality, stakes]
qa_checks: [assumption_and_reality_present, readable_in_3_seconds]
```

## BigIdea

```yaml
purpose: central memorable point
fields: [text, audience_shift]
max_length: one sentence
qa_checks: [links_title_and_key_insight]
```

## CTA

```yaml
purpose: next step
fields: [action, timeframe, success_criterion]
qa_checks: [one_action, one_timeframe, criterion_present]
```

## SpeakerNote

```yaml
purpose: hold detail that should not crowd the slide
fields: [text, pause_points, risk_note]
forbidden: [verbatim_slide_duplicate]
```
