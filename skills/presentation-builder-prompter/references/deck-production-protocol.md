# Deck Production Protocol

## Purpose

This protocol turns the former prompt-only workflow into a production workflow. The Master Prompt is a saved reproducibility artifact, not the final deliverable, unless the user explicitly requests prompt-only mode.

## Production Pipeline

```text
1. Brief normalization
2. BigIdea and claim spine
3. Slide roles
4. Content blocks
5. Components
6. Layout contracts
7. DeckSpec artifact
8. Master Prompt artifact
9. Single-file HTML deck
10. QA report
11. Screenshots/contact sheet where possible
12. Final delivery
```

## Required Artifacts

Use a short lowercase slug derived from the topic. Save artifacts under the skill tmp output directory unless the user gives another destination:

```text
OUTPUT_DIR=.tmp/presentation-builder-prompter
```

```text
${OUTPUT_DIR}/{slug}.html
${OUTPUT_DIR}/{slug}-deck-spec.json
${OUTPUT_DIR}/{slug}-master-prompt.md
${OUTPUT_DIR}/{slug}-qa-report.json or ${OUTPUT_DIR}/{slug}-qa-report.md
${OUTPUT_DIR}/{slug}-preview/
${OUTPUT_DIR}/{slug}-manifest.json
```

`OUTPUT_DIR` трактуется относительно `workspace root`.

The manifest should be small and machine-readable:

```json
{
  "deck": "{slug}.html",
  "deck_spec": "{slug}-deck-spec.json",
  "master_prompt": "{slug}-master-prompt.md",
  "qa_report": "{slug}-qa-report.json",
  "preview_dir": "{slug}-preview"
}
```

## Output Directory Rule

Never create deck HTML, previews, screenshots, generated prompts, generated specs, QA reports, backups, or other production artifacts inside the skill directory. Use `OUTPUT_DIR` or a user-provided external destination. The skill directory may contain only reusable skill code, schemas, references, scripts, examples, and assets.

## Artifact Responsibilities

### DeckSpec

- Captures audience, core promise, BigIdea, claim spine, visual system, interaction policy, source policy and slides.
- Every slide has role, claim_title, support_text, content_blocks, proof_object, component, layout_contract and qa_checks.
- Evidence slides include source references or inherit a source registry.

### Master Prompt

- Captures the one-shot instruction that could regenerate the deck from the same brief and DeckSpec intent.
- Must include artifact contract, QA expectations and source/data policy.
- Must not be the only deliverable in default build-deck mode.

### HTML Deck

- Single file with embedded HTML, CSS and JS.
- Uses slide roles and layout contracts from the DeckSpec.
- Includes keyboard navigation, overview/help/presenter notes when useful, visible focus and reduced-motion support.
- Does not expose internal technical labels to the audience.

### QA Report

Include:

- DeckSpec validation result.
- Static HTML audit result.
- Composition/layout audit result.
- Geometry audit result for fixed frame slots.
- Screenshot/contact sheet status.
- Known caveats and remaining risks.

## Build Rules

- Create DeckSpec before HTML.
- Save Master Prompt before or alongside HTML.
- If HTML changes structure, update DeckSpec.
- Use one shared `fixed-stage-frame` unless the brief explicitly requests a freeform deck.
- Keep title, support paragraph and content-zone coordinates stable across slides within a viewport.
- Put dense content scroll inside content-zone; do not let the whole slide jump or collide with controls.
- Visible controls are optional; keyboard navigation is required.
- If QA finds overlap, overflow, unreadable text, missing sources or broken navigation, fix the deck before final delivery.
- If screenshots cannot be rendered because runtime dependencies are missing, say so in QA and complete static checks.

## Delivery Summary

Final response should be compact:

```text
Готово: {html_path}
DeckSpec: {deck_spec_path}
Master Prompt: {master_prompt_path}
QA: {qa_report_or_summary}
Preview: {preview_dir_or_status}
```
