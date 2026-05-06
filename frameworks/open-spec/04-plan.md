# 4. Фаза Plan — технический план

## 4.1 Цель фазы

Определить **КАК** реализовать требования из спеки. Зафиксировать технические решения, ограничения скоупа и архитектурные трейдоффы.

## 4.2 Структура plan.md

```markdown
# <feature-name> — Implementation Plan

## Scope constraints
- Какие файлы/модули являются source of truth
- Ограничения по технологиям и зависимостям
- Что НЕ входит в скоуп реализации

## Architecture decisions
- Выбранный подход и почему
- Отвергнутые альтернативы (кратко)
- Компромиссы и их обоснования

## Tasks
1. **P1 — <имя задачи>**
   - Описание действий
   - Файлы, которые будут затронуты
   - Acceptance criteria для этого шага

2. **P2 — <следующая задача>**
   ...

## Risks
- Известные риски и план их митигации

## Validation strategy
- Как будет проверена реализация в целом
```

## 4.3 Правила планирования

1. **Explicit over implicit** — каждое техническое решение записано, а не подразумевается
2. **Scope constraints первым параграфом** — чтобы агент сразу видел границы
3. **Задачи упорядочены по зависимостям** — каждая задача зависит только от предыдущих
4. **Нет speculative abstractions** — план содержит только то, что реально нужно
5. **Файлы указаны явно** — какие файлы будут созданы/изменены/удалены

## 4.4 Пример из проекта

```markdown
# Agent Core Pipeline — Implementation Plan (v2, no overengineering)

## Scope constraints
- Guide (`guide/`) is source of truth over runtime code, except model-provider decision.
- LLM provider target: OpenAI Codex via centralized OpenClaw model settings.
- No new infrastructure/entities/services; only align and harden existing pipeline.

## Tasks
1. **P1 — Planning artifacts**
   - Create `plan.md` and `status.md` in pipeline root.

2. **P2 — Extract stage alignment**
   - Replace Anthropic client usage in `extract.py` with OpenAI-compatible
     Chat Completions flow.
   - Keep output schema compatible with existing `_registry/statements/**`.
```

## 4.5 Plan Gate — критерии перехода

- [ ] Scope constraints зафиксированы
- [ ] Каждая задача имеет acceptance criteria
- [ ] Задачи упорядочены по зависимостям
- [ ] Нет задач за пределами скоупа спеки
- [ ] Risks идентифицированы
- [ ] Человек подтвердил план
