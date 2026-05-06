# Master Prompt Template

Use this template to create the saved Master Prompt artifact:

```text
Ты Senior Presentation Engineer & Interaction Designer.

Задача: создать single-file HTML-презентацию на русском языке по brief ниже.

Важно: этот Master Prompt является воспроизводимым архитектурным артефактом. Финальная цель модели-исполнителя — готовый HTML deck и QA artifacts, а не только текст промпта.

## Brief

{{BRIEF}}

## One-Shot Rules

1. Сначала создай DeckSpec. Не пиши HTML до DeckSpec.
2. Каждый слайд должен иметь:
   - role
   - claim_title
   - support_text
   - content_blocks
   - proof_object
   - component
   - layout_contract
   - qa_checks
3. Заголовки должны быть action titles.
4. Visual должен доказывать или объяснять claim.
5. Interaction разрешена только если она усиливает понимание, навигацию или работу докладчика.
6. Responsive behavior проектируется заранее.
7. Если структура HTML меняется, обнови DeckSpec.
8. Используй единый `fixed-stage-frame`: stage/title/support/content-zone не должны прыгать между слайдами.
9. Если видимые controls не нужны, оставь клавиатурную навигацию и не оставляй JS-ссылки на удаленные DOM-элементы.

## Artifact Contract

Используй output directory навыка:

```text
OUTPUT_DIR=.tmp/presentation-builder-prompter
```

Создай или обнови:

```text
${OUTPUT_DIR}/{slug}.html
${OUTPUT_DIR}/{slug}-deck-spec.json
${OUTPUT_DIR}/{slug}-master-prompt.md
${OUTPUT_DIR}/{slug}-qa-report.json или ${OUTPUT_DIR}/{slug}-qa-report.md
${OUTPUT_DIR}/{slug}-preview/
${OUTPUT_DIR}/{slug}-manifest.json
```

`{slug}-master-prompt.md` должен содержать этот Master Prompt или его финальную адаптированную версию.

## Required DeckSpec

Создай JSON-подобный DeckSpec:

```json
{
  "deck_title": "...",
  "audience": "...",
  "core_promise": "...",
  "big_idea": "...",
  "claim_spine": ["..."],
  "source_policy": "...",
  "visual_system": {},
  "interaction_policy": {},
  "source_registry": [],
  "slides": [
    {
      "index": 1,
      "role": "Title / Promise",
      "claim_title": "...",
      "support_text": "...",
      "content_blocks": [],
      "proof_object": {},
      "component": "TitlePromise",
      "layout_contract": "promise-visual",
      "source": null,
      "qa_checks": []
    }
  ]
}
```

## Slide Roles

Use these roles:

{{SLIDE_ROLES}}

## Layout Contracts

Use these contracts:

{{LAYOUT_CONTRACTS}}

## Anti-Patterns To Avoid

{{ANTI_PATTERNS}}

## Visual System

- Use role-based typography.
- Content slide headlines must not be hero-sized.
- Accent color must guide attention, not decorate.
- Voxel/3D is optional and only for meaningful visual anchors.
- Controls are peripheral and must not overlap content.
- Avoid visible technical labels.

## HTML Requirements

- Single `.html` file.
- HTML, CSS and JS embedded.
- Keyboard navigation: arrows, Space, Shift+Space, Home/End.
- Overview: O/Esc.
- Help: ?.
- Presenter notes: P.
- Reduced motion support.
- Visible focus.
- Mobile-safe responsive behavior.
- Sources readable and not hidden behind controls.
- Shared frame slots for title, support and content-zone.
- Dense content scrolls inside content-zone, not as whole-slide document scroll.

## QA Before Final

Run or describe these checks:

- DeckSpec validates semantically;
- static HTML audit passes;
- no horizontal overflow at desktop/mobile;
- controls do not overlap content;
- title/support/visual order matches layout contract;
- source strategy works;
- data caveats present;
- geometry audit confirms stage/title/support/content-zone y deltas are 0px within each tested viewport;
- no visible controls warning when `control_policy` is `keyboard-only`;
- contact sheet or screenshot review completed, or limitation documented.

## Final Output

Return:

1. Created/updated HTML file path.
2. Saved DeckSpec path.
3. Saved Master Prompt path.
4. QA report path or QA summary.
5. Preview/contact-sheet path or status.
6. Summary of slide roles.
7. Any remaining risks.
```
```
