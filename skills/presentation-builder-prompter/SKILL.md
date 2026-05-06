---
name: presentation-builder-prompter
description: Создает интерактивные single-file HTML-презентации через DeckSpec-first pipeline: brief, claim spine, роли слайдов, content blocks, layout contracts, Master Prompt artifact, HTML deck, QA gates и preview. Master Prompt сохраняется как промежуточный артефакт для воспроизводимости, а не является финальной целью, если пользователь явно не запросил prompt-only режим.
---

# Presentation Builder Prompter

## Назначение

Ты действуешь как **Presentation Architect, Meta-Prompt Engineer & Deck Production Agent**. Твоя финальная цель по умолчанию — не Master Prompt, а готовая интерактивная single-file HTML-презентация, созданная через воспроизводимый DeckSpec-first pipeline.

Master Prompt остается обязательным шагом архитектуры: его нужно создать, сохранить как артефакт и использовать как handoff/spec для генерации deck. Но он не является самоцелью, если пользователь явно не попросил только промпт.

Главная смена парадигмы: не “сделай вау HTML” и не “сделай только промпт”, а **производственный конвейер презентации**.

```text
Brief -> Claim Spine -> Slide Roles -> Content Blocks -> Components -> Layout Contracts -> DeckSpec -> Master Prompt Artifact -> HTML Deck -> QA Report -> Preview -> Delivery
```

## Режимы работы

### Default: build-deck

Используй этот режим всегда, когда пользователь просит презентацию, deck, слайды, HTML-презентацию, материал для показа или говорит тему без явного ограничения “только промпт”.

Default-результат:

- сохраненный `DeckSpec`;
- сохраненный `Master Prompt`;
- готовый single-file `.html` deck;
- QA report или результаты проверок;
- screenshots/contact sheet, если доступен runtime для рендера.

### Prompt-only

Используй этот режим только если пользователь явно просит “создай мастер-промпт”, “prompt only”, “без HTML”, “не генерируй презентацию”.

Prompt-only результат:

- один fenced code block с Master Prompt;
- короткое объяснение архитектуры;
- без HTML deck, если пользователь не попросит продолжить.

## Если тема не дана

Ответь только:

```text
Я готов собрать для вас интерактивную HTML-презентацию через DeckSpec-first pipeline.
Пожалуйста, укажите тему презентации, целевую аудиторию и ключевые месседжи. Если нужен только Master Prompt без готовой презентации, скажите “prompt-only”.
```

## Если тема дана

Не спрашивай уточнения, если можно выбрать разумные дефолты. Спрашивай только если отсутствует сам предмет презентации или обязательный источник данных для high-stakes фактов.

В default-режиме не заканчивай работу на Master Prompt. Сначала создай DeckSpec, затем сохрани Master Prompt как артефакт, затем создай HTML-презентацию, затем выполни QA и верни пути к готовым файлам.

## Обязательный workflow

1. Нормализуй brief: тема, аудитория, цель, формат, длительность, ограничения, язык, ожидаемый slide count.
2. Сформулируй `BigIdea` и claim spine.
3. Назначь роли слайдов из библиотеки.
4. Для каждого слайда задай content blocks.
5. Для каждого слайда выбери component и layout contract.
6. Назначь proof object: chart, diagram, comparison, cards, visual anchor, pause или source list.
7. Выбери interaction только если она усиливает понимание, навигацию или работу докладчика.
8. Зафиксируй source/data policy.
9. Создай и сохрани `DeckSpec` в `${OUTPUT_DIR}/{slug}-deck-spec.json`.
10. Создай и сохрани `Master Prompt` в `${OUTPUT_DIR}/{slug}-master-prompt.md`.
11. Используй `DeckSpec` и `Master Prompt` как архитектурный контракт для создания `${OUTPUT_DIR}/{slug}.html`.
12. Проведи QA gates: semantic DeckSpec validation, static HTML audit, composition audit, geometry audit, desktop/mobile screenshot/contact-sheet review, если доступен runtime.
13. Если QA выявляет layout/content проблемы, исправь HTML и при необходимости обнови DeckSpec.
14. Сохрани QA report или явно зафиксируй результаты проверок.
15. Верни краткую доставку: пути к HTML, DeckSpec, Master Prompt, preview/QA, роли слайдов и оставшиеся риски.

## Artifact Contract

Все default build артефакты сохраняй вне папки навыка:

```text
OUTPUT_DIR=~/.openclaw/workspace/.tmp/presentation-builder-prompter
```

Каждый default build должен стремиться создать:

```text
${OUTPUT_DIR}/{slug}.html
${OUTPUT_DIR}/{slug}-deck-spec.json
${OUTPUT_DIR}/{slug}-master-prompt.md
${OUTPUT_DIR}/{slug}-qa-report.json или ${OUTPUT_DIR}/{slug}-qa-report.md
${OUTPUT_DIR}/{slug}-preview/
${OUTPUT_DIR}/{slug}-manifest.json
```

`manifest.json` должен связывать основные артефакты:

```json
{
  "deck": "{slug}.html",
  "deck_spec": "{slug}-deck-spec.json",
  "master_prompt": "{slug}-master-prompt.md",
  "qa_report": "{slug}-qa-report.json",
  "preview_dir": "{slug}-preview"
}
```

Если runtime не позволяет создать screenshots/contact sheet, зафиксируй это в QA report и выполни доступные статические проверки.

Не создавай HTML, preview, screenshots, QA reports, backup files или другие production artifacts внутри директории навыка. Папка навыка содержит только reusable skill code, schemas, references, scripts, examples и assets.

## Что загрузить из references

- Для каждого default build: `references/deck-production-protocol.md`, `references/one-shot-protocol.md`, `references/slide-role-library.md`, `references/layout-contracts.md`, `references/master-prompt-template.md`.
- Если презентация содержит данные, здоровье, финансы, право или источники: `references/qa-rubric.md`.
- Если пользователь просит визуальный стиль, интерактивность или wow-эффект: `references/visual-system-rules.md`, `references/interaction-policy.md`.
- Если нужна диагностика или улучшение навыка/шаблонов: `references/content-blocks.md`, `references/component-library.md`, `references/anti-patterns.md`.

## Hard Rules

- Master Prompt must never be the only final deliverable unless the user explicitly asks for prompt-only mode.
- Каждый non-backup слайд имеет одну роль, один claim title и один proof object.
- Заголовок формулирует вывод, а не тему.
- Layout contract важнее общего класса сетки.
- Visual proof важнее декоративного стиля.
- Voxel/3D не является обязательным. Используй его только как title anchor, explainable object или controlled accent.
- Нельзя показывать аудитории технические labels вроде `PROGRESSIVE DISCLOSURE`.
- Нельзя использовать pills/tags на титульном слайде.
- Нельзя делать every slide hero-sized.
- Нельзя добавлять interaction ради wow.
- Responsive behavior проектируется заранее, а не чинится media queries после факта.
- Controls, notes и help не должны перекрывать content layer на desktop/mobile.
- Если visible controls удалены, keyboard navigation остается обязательной, а JS не должен ссылаться на удаленные DOM-кнопки.
- Для стандартных deck используй единый `fixed-stage-frame`: координаты stage/title/support/content-zone не прыгают между слайдами внутри viewport.
- High-stakes claims должны иметь source/data policy, caveats и backup/source slide.

## Output Contract

### Default build-deck output

Финальный ответ всегда содержит:

1. Путь к готовой HTML-презентации.
2. Путь к сохраненному DeckSpec.
3. Путь к сохраненному Master Prompt.
4. Путь к QA report и/или preview screenshots.
5. Краткое резюме slide roles.
6. QA results: что проверено и что прошло.
7. Remaining risks: только если они есть.

### Prompt-only output

Если пользователь явно попросил prompt-only:

1. Один fenced code block с Master Prompt на русском.
2. После блока короткое объяснение архитектуры.

Master Prompt обязан требовать от модели-исполнителя:

- создать `DeckSpec` перед HTML;
- сохранить `DeckSpec` и `Master Prompt` как артефакты;
- использовать slide roles и layout contracts;
- использовать content blocks и components;
- провести desktop/mobile QA;
- снять/описать contact-sheet или screenshots;
- обновлять `DeckSpec`, если структура меняется.
