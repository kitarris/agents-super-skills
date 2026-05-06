# Open Spec Workflow — Полное руководство для AI-агента

> Руководство по spec-driven development для агента, разрабатывающего код и документацию.  
> Уровень: intro → intermediate. Версия: 2026-04-13.

---

## Содержание

1. [Философия и принципы](#1-философия-и-принципы)
2. [Архитектура workflow](#2-архитектура-workflow)
3. [Фаза Specify — формирование требований](#3-фаза-specify--формирование-требований)
4. [Фаза Plan — технический план](#4-фаза-plan--технический-план)
5. [Фаза Tasks — декомпозиция](#5-фаза-tasks--декомпозиция)
6. [Фаза Execute — реализация](#6-фаза-execute--реализация)
7. [Артефакты и их жизненный цикл](#7-артефакты-и-их-жизненный-цикл)
8. [Язык спецификаций: RFC 2119 + BDD](#8-язык-спецификаций-rfc-2119--bdd)
9. [Gates — контрольные точки](#9-gates--контрольные-точки)
10. [Статусная модель и change log](#10-статусная-модель-и-change-log)
11. [Context engineering](#11-context-engineering)
12. [Living document — стратегия обновления](#12-living-document--стратегия-обновления)
13. [Валидация и верификация](#13-валидация-и-верификация)
14. [Восстановление после ошибок](#14-восстановление-после-ошибок)
15. [Мульти-сессионная работа](#15-мульти-сессионная-работа)
16. [Review protocol](#16-review-protocol)
17. [Anti-patterns](#17-anti-patterns)
18. [Quick-start checklist](#18-quick-start-checklist)
19. [Источники](#19-источники)

---

## 1. Философия и принципы

### 1.1 Что такое Open Spec

Open Spec (Spec-Driven Development, SDD) — методология, в которой **структурированная спецификация является источником правды** для всего цикла разработки. Спецификация — не одноразовый бриф и не бэклог-тикет: это исполняемый контракт между человеком и агентом, из которого выводятся реализация, тесты и документация.

> "The specification IS the source code" — код является лишь деталями реализации; спецификация — душа системы.  
> — OpenSpec framework, 2026

### 1.2 Зачем это нужно

Текущая практика AI-разработки страдает от "vibe coding" — разработчик общается с AI через неструктурированные промпты, требования размазаны по длинным чат-логам, не персистентны и не систематизированы. Когда контекстное окно заполняется, AI демонстрирует "амнезию": логические пробелы, регрессии кода, галлюцинации.

SDD решает эти проблемы через:
- **Прозрачность** — каждое решение зафиксировано и трассируемо
- **Воспроизводимость** — любой агент может продолжить работу по спеке
- **Контроль** — gates предотвращают неконтролируемую генерацию
- **Масштабируемость** — спека работает как внешняя память, компенсируя ограничения контекстного окна

### 1.3 Ключевые принципы 2026

| Принцип | Описание |
|---|---|
| **Spec-first** | Никакой код не пишется до согласования спецификации |
| **Living document** | Спека обновляется при каждом решении, не только в начале |
| **Gate discipline** | Между фазами — обязательная пауза для review человеком |
| **Brownfield-first** | Подход оптимизирован для эволюции существующего кода (1→n), а не greenfield (0→1) |
| **Context as finite resource** | Контекст агента — расходный материал; спека компенсирует его ограничения |
| **Deterministic orchestration** | Workflow контролируется детерминистически; агент выполняет творческую работу внутри фиксированных рамок |

### 1.4 Отличие от ad-hoc промптинга

| Аспект | Ad-hoc промпт | Open Spec |
|---|---|---|
| Форма | Свободный текст в чате | Структурированный `.md` с секциями и ключевыми словами |
| Жизненный цикл | Одноразовый, потерян после сессии | Living document в VCS, эволюционирует с проектом |
| Трассируемость | Отсутствует | Полная: spec → plan → status → change log |
| Воспроизводимость | Зависит от контекста сессии | Любой агент продолжает по спеке |
| Верификация | Субъективная ("выглядит правильно") | Объективная: BDD-сценарии, syntax check, dry-run |
| Скоуп | Размытый, часто overflow | Один скоуп — одна спека |

---

## 2. Архитектура workflow

### 2.1 Четыре фазы

Workflow состоит из четырёх последовательных фаз, разделённых gates:

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ SPECIFY │────▶│  PLAN   │────▶│  TASKS  │────▶│ EXECUTE │
│         │     │         │     │         │     │         │
│ ЧТО/    │     │ КАК     │     │ Деком-  │     │ Реали-  │
│ ЗАЧЕМ   │     │         │     │ позиция │     │ зация   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘
     │               │               │               │
  [Spec Gate]    [Plan Gate]    [Task Gate]    [Validation Gate]
     │               │               │               │
   review          review          review          review
   человеком       человеком       человеком       человеком
```

### 2.2 Принцип gated workflow

Каждая фаза следует одному жизненному циклу:
1. **Pre-event** (детерминистический) — подготовка контекста, загрузка артефактов предыдущей фазы
2. **Творческая работа** — агент выполняет основную задачу фазы
3. **Post-event** (детерминистический) — валидация вывода, фиксация артефактов
4. **Gate** — человек проверяет и подтверждает переход

**Правило:** агент **НИКОГДА** не переходит к следующей фазе без явного подтверждения человека.

### 2.3 Артефакты по фазам

```
Specify  →  spec.md (requirements + BDD-сценарии)
Plan     →  plan.md (технический план + scope constraints)
Tasks    →  status.md / tasks.md (декомпозиция + progress tracker)
Execute  →  код + обновления status.md + change log
```

---

## 3. Фаза Specify — формирование требований

### 3.1 Цель фазы

Зафиксировать **ЧТО** нужно сделать и **ЗАЧЕМ**, без технических решений. Результат — структурированная спецификация, которая становится контрактом.

### 3.2 Структура spec.md

```markdown
# <feature-name> Specification

## Purpose
Краткое описание цели изменения и контекста, который его вызвал.
Ссылка на исходный запрос или инцидент.

## Scope
- IN SCOPE: что входит в рамки этой спецификации
- OUT OF SCOPE: что явно исключено

## Requirements

### Requirement: <Имя требования>

<Текст требования с использованием RFC 2119 ключевых слов>

**GIVEN** <предусловие>
**WHEN** <действие>
**THEN** <ожидаемый результат>

### Requirement: <Следующее требование>
...

## Acceptance Criteria
Сводный список критериев приёмки для всей спеки.

## Dependencies
Внешние зависимости, блокеры, связанные спеки.

## Open Questions
Вопросы, требующие решения до перехода к Plan.
```

### 3.3 Правила написания требований

**RFC 2119 ключевые слова** определяют уровень обязательности:

| Ключевое слово | Значение | Когда использовать |
|---|---|---|
| **MUST** / **SHALL** | Абсолютное требование | Безусловные ограничения безопасности, целостности данных |
| **MUST NOT** / **SHALL NOT** | Абсолютный запрет | Критические ограничения, нарушение которых = дефект |
| **SHOULD** / **RECOMMENDED** | Рекомендация, допускающая обоснованное исключение | Лучшие практики, предпочтительное поведение |
| **SHOULD NOT** / **NOT RECOMMENDED** | Не рекомендуется, но допустимо с обоснованием | Нежелательные но не критичные паттерны |
| **MAY** / **OPTIONAL** | Полностью опционально | Расширения, дополнительные возможности |

**BDD-сценарии** (Behavior-Driven Development) обеспечивают верифицируемость:

```markdown
### Requirement: Path Containment

The system SHALL validate that all file write operations
target paths within the configured vault directory.
Paths containing traversal sequences or resolving outside
the vault MUST be rejected.

**GIVEN** a configured vault at `VAULT_PATH`
**WHEN** `Document.save()` is called with a path inside `VAULT_PATH`
**THEN** the file is written successfully

**WHEN** `Document.save()` is called with `../outside/file.txt`
**THEN** the operation MUST raise `PathViolationError`
**AND** no file is written to disk

**WHEN** `Document.save()` is called with a path containing `..` 
  that resolves inside `VAULT_PATH`
**THEN** the path is normalized and the file is written successfully
```

### 3.4 Шесть обязательных областей (по Addy Osmani)

Анализ 2,500+ конфигураций агентов показал, что эффективные спеки покрывают шесть областей:

1. **Commands** — полные команды с флагами, а не только имена инструментов  
   `pytest -v --tb=short`, не просто "запустите тесты"

2. **Testing** — фреймворк, расположение тестов, ожидания по coverage  
   "Unit tests в `tests/`, pytest, минимум 80% coverage для новых модулей"

3. **Project structure** — где лежит код, тесты, документация  
   "`src/` — application code, `tests/` — unit tests, `docs/` — documentation"

4. **Code style** — форматирование, naming conventions, лимиты  
   "PEP 8, максимум 120 символов на строку, snake_case для функций"

5. **Boundaries** — что агент НЕ должен делать  
   "Не модифицировать `_config/`, не создавать новые сервисы"

6. **Dependencies** — разрешённые и запрещённые зависимости  
   "stdlib + pyyaml + urllib; никаких новых pip-зависимостей без согласования"

### 3.5 Spec Gate — критерии перехода

Перед переходом к Plan, проверяется:
- [ ] Purpose заполнен и понятен
- [ ] Scope определён (IN/OUT)
- [ ] Все requirements используют RFC 2119 ключевые слова
- [ ] Каждое requirement имеет минимум один BDD-сценарий
- [ ] Open Questions пусты или помечены как deferred
- [ ] Человек подтвердил спеку

---

## 4. Фаза Plan — технический план

### 4.1 Цель фазы

Определить **КАК** реализовать требования из спеки. Зафиксировать технические решения, ограничения скоупа и архитектурные трейдоффы.

### 4.2 Структура plan.md

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

### 4.3 Правила планирования

1. **Explicit over implicit** — каждое техническое решение записано, а не подразумевается
2. **Scope constraints первым параграфом** — чтобы агент сразу видел границы
3. **Задачи упорядочены по зависимостям** — каждая задача зависит только от предыдущих
4. **Нет speculative abstractions** — план содержит только то, что реально нужно
5. **Файлы указаны явно** — какие файлы будут созданы/изменены/удалены

### 4.4 Пример из проекта

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

### 4.5 Plan Gate — критерии перехода

- [ ] Scope constraints зафиксированы
- [ ] Каждая задача имеет acceptance criteria
- [ ] Задачи упорядочены по зависимостям
- [ ] Нет задач за пределами скоупа спеки
- [ ] Risks идентифицированы
- [ ] Человек подтвердил план

---

## 5. Фаза Tasks — декомпозиция

### 5.1 Цель фазы

Разбить план на **атомарные, исполняемые шаги** с чёткими критериями завершения.

### 5.2 Принципы декомпозиции

**Правильная гранулярность** — ключевой навык:

| Слишком крупно | Правильно | Слишком мелко |
|---|---|---|
| "Реализовать rate limiting" | "Добавить rate-limit middleware в auth router, используя существующий Redis client из `services/cache.js`" | "Открыть файл `services/cache.js`" |
| "Настроить тесты" | "Написать pytest для `next_id()`: 3 кейса — нормальный, коллизия, пустой registry" | "Импортировать pytest" |

**Правила:**

1. **Каждый шаг — один логический change** — можно проверить изолированно
2. **Acceptance criteria конкретны** — не "работает", а "возвращает 429 с correct headers на шестом запросе в 60-секундном окне"
3. **Зависимости явные** — "P3 зависит от P2 (нужен `id_registry.json`)"
4. **Шаг можно retry изолированно** — если P5 упал, не нужно переделывать P1-P4
5. **Один шаг — одна сессия** — для сложных задач каждый шаг = отдельная execution session

### 5.3 Формат задачи

```markdown
### P3 — Stable ID registry contract

**Файлы:** `extract.py`  
**Зависимости:** P2 (extract stage alignment)

**Действия:**
- Добавить `ID_REGISTRY_PATH = _registry/id_registry.json`
- Реализовать `load_id_registry()`, `save_id_registry()` с atomic temp-write
- Реализовать monotonic allocator `next_id(layer, run_id, registry)`

**Acceptance criteria:**
- [ ] ID allocation monotonic и persisted
- [ ] Atomic write: при crash во время записи — registry не повреждён
- [ ] Bootstrap из existing `_registry/statements/**/*.json`
- [ ] `py_compile extract.py` проходит
```

### 5.4 Task Gate — критерии перехода

- [ ] Все задачи из плана декомпозированы
- [ ] Каждый шаг атомарен и может быть проверен изолированно
- [ ] Acceptance criteria определены для каждого шага
- [ ] Зависимости между шагами указаны
- [ ] Человек подтвердил декомпозицию

---

## 6. Фаза Execute — реализация

### 6.1 Цель фазы

Последовательно выполнить каждый шаг, фиксируя прогресс и результаты в `status.md`.

### 6.2 Протокол выполнения шага

```
1. Обновить status.md: шаг → [→] (in-progress)
2. Выполнить действия шага
3. Проверить acceptance criteria
4. Записать change log entry
5. Обновить status.md: шаг → [✓] (done)
6. Если acceptance criteria не пройдены → шаг → [!] (blocked)
```

### 6.3 Правила выполнения

1. **Один шаг за раз** — не начинать следующий, пока текущий не проверен
2. **Change log сразу** — не откладывать запись на потом
3. **Валидация перед "done"** — syntax check, dry-run, smoke test
4. **Не расширять скоуп** — если обнаружена новая задача, добавить в plan, а не делать "по ходу"
5. **Не ломать существующее** — каждый шаг оставляет систему в рабочем состоянии
6. **Фиксация решений** — если в процессе изменилось техническое решение → обновить plan.md и spec.md

### 6.4 Validation Gate — критерии завершения

- [ ] Все шаги отмечены [✓]
- [ ] Change log заполнен для каждого шага
- [ ] Syntax validation пройдена (`py_compile`, `tsc`, и т.д.)
- [ ] Runtime smoke check пройден (dry-run)
- [ ] Spec.md отражает финальное состояние (нет drift)
- [ ] Человек провёл финальный review

---

## 7. Артефакты и их жизненный цикл

### 7.1 Каталог артефактов

| Артефакт | Тип | Назначение | Создаётся | Обновляется |
|---|---|---|---|---|
| `spec.md` | Контракт | Требования + BDD-сценарии | Specify | При изменении требований |
| `plan.md` | Решения | Технический план + scope | Plan | При изменении подхода |
| `status.md` | Трекинг | Прогресс + change log | Tasks | После каждого шага |
| `CLAUDE.md` | Конституция | Инструкции агенту | Инициализация проекта | При изменении конвенций |

### 7.2 Иерархия артефактов

```
CLAUDE.md          ← конституция (глобальные правила)
  └── spec.md      ← контракт текущей задачи (ЧТО/ЗАЧЕМ)
       └── plan.md ← решения (КАК)
            └── status.md ← исполнение (ПРОГРЕСС)
```

Каждый нижний артефакт **подчинён** верхнему. Если `status.md` противоречит `plan.md` — обновить `plan.md` или скорректировать `status.md`. Если `plan.md` противоречит `spec.md` — спека приоритетнее.

### 7.3 Хранение в VCS

Артефакты хранятся в репозитории рядом с кодом, которого они касаются:

```
project-root/
├── CLAUDE.md
├── feature-x/
│   ├── spec.md
│   ├── plan.md
│   ├── status.md
│   └── src/
│       └── ...
```

Или по конвенции проекта (как в текущем проекте):

```
agent-core-pipeline/
├── plan.md
├── status.md
└── guide/
    └── ...
```

---

## 8. Язык спецификаций: RFC 2119 + BDD

### 8.1 RFC 2119 — полный справочник

RFC 2119 определяет ключевые слова для уровней обязательности в технических спецификациях. Использование этих слов **устраняет двусмысленность** — каждый reader точно знает, обязательно ли требование.

**Полная таблица:**

| Уровень | Позитивная форма | Негативная форма | Семантика |
|---|---|---|---|
| Обязательно | **MUST**, **SHALL**, **REQUIRED** | **MUST NOT**, **SHALL NOT** | Нарушение = дефект. Нет исключений |
| Рекомендовано | **SHOULD**, **RECOMMENDED** | **SHOULD NOT**, **NOT RECOMMENDED** | Допустимо отклониться при обосновании |
| Опционально | **MAY**, **OPTIONAL** | — | На усмотрение реализатора |

**Правила употребления:**
- Ключевые слова пишутся **ЗАГЛАВНЫМИ** когда используются в значении RFC 2119
- Строчное "must" или "should" — обычное английское слово, не терминологическое
- Каждое требование с MUST/SHALL должно быть верифицируемо (есть способ проверить)
- Не перегружать MUST — если всё MUST, приоритизация теряет смысл

**Примеры использования в спецификации:**

```markdown
### Requirement: Atomic Write Safety

The registry writer MUST use atomic temp-write + replace
to prevent data corruption on interrupted writes.

The writer SHOULD use `os.replace()` for atomicity on POSIX systems.

The writer MAY implement an optional backup before overwrite,
but this is not required for the current scope.
```

### 8.2 BDD — Gherkin-совместимый формат

BDD-сценарии превращают требования в **верифицируемые спецификации**: каждый сценарий описывает конкретное поведение, которое можно проверить вручную или автоматически.

**Ключевые слова:**

| Ключевое слово | Назначение | Пример |
|---|---|---|
| **GIVEN** | Предусловие, начальное состояние | `GIVEN a vault with 3 existing entries` |
| **WHEN** | Действие, которое выполняется | `WHEN extract.py processes a new source file` |
| **THEN** | Ожидаемый результат | `THEN a new statement file is created in _registry/statements/` |
| **AND** | Дополнительное условие (к любому) | `AND the id_registry.json is updated` |
| **BUT** | Исключение или негативное условие | `BUT no duplicate IDs are assigned` |

**Шаблоны сценариев:**

```markdown
### Happy path — нормальный поток
**GIVEN** a configured vault at `VAULT_PATH` with valid `openclaw.json`
**WHEN** `run_pipeline.py --stage extract` is executed
**THEN** statements are extracted and saved to `_registry/statements/`
**AND** `id_registry.json` is updated with new IDs
**AND** `api_usage.jsonl` records the LLM call

### Error path — обработка ошибок
**GIVEN** a vault without `openclaw.json`
**WHEN** `run_pipeline.py --stage extract` is executed
**THEN** the pipeline MUST exit with a descriptive error message
**AND** no partial files are written to `_registry/`

### Edge case — граничное условие
**GIVEN** an `id_registry.json` with IDs up to 999
**WHEN** `next_id()` is called
**THEN** the returned ID MUST be 1000
**AND** the registry file is atomically updated

### Concurrent access — параллельный доступ
**GIVEN** a pipeline run is already in progress (lock file exists)
**WHEN** a second `run_pipeline.py` is started
**THEN** the second run MUST exit immediately
**AND** a message "Pipeline already running" is logged to stderr
```

### 8.3 Delta markers — маркировка изменений

При обновлении спеки каждое изменение категоризируется маркером, чтобы reviewer видел, что именно изменилось:

| Маркер | Значение |
|---|---|
| `[ADDED]` | Новое требование, которого раньше не было |
| `[MODIFIED]` | Существующее требование изменено |
| `[REMOVED]` | Требование удалено |
| `[CLARIFIED]` | Формулировка уточнена без изменения семантики |

```markdown
### Requirement: Path Containment [MODIFIED]

The system SHALL validate that all file write operations target paths
within the configured vault directory. [ADDED] Symbolic links
resolving outside the vault MUST also be rejected.
```

---

## 9. Gates — контрольные точки

### 9.1 Назначение gates

Gates — это **обязательные точки синхронизации** между человеком и агентом. Они предотвращают:
- Реализацию невалидных требований
- Drift между спекой и кодом
- Неконтролируемое расширение скоупа
- Накопление технического долга из-за пропущенных проверок

### 9.2 Типы gates

| Gate | Расположение | Кто проверяет | Что проверяется |
|---|---|---|---|
| **Spec Gate** | Specify → Plan | Человек | Требования полны? Скоуп ясен? BDD-сценарии покрывают edge cases? |
| **Plan Gate** | Plan → Tasks | Человек | План согласован? Scope constraints адекватны? Риски учтены? |
| **Task Gate** | Tasks → Execute | Человек | Шаги атомарны? Acceptance criteria конкретны? |
| **Step Gate** | Между шагами Execute | Агент (автоматически) | Acceptance criteria шага пройдены? Change log записан? |
| **Validation Gate** | Execute → Done | Человек + автоматика | Syntax OK? Dry-run OK? Спека не drift-нула? |

### 9.3 Pre-Implementation Gates

Перед началом реализации агент проверяет чеклист и **документирует обоснование** для каждого пункта, который не проходит:

```markdown
## Pre-Implementation Gates

- [x] Спецификация согласована с человеком
- [x] Scope constraints зафиксированы в plan.md
- [x] Все open questions разрешены
- [ ] Security review проведён ← JUSTIFIED: scope не затрагивает auth/data paths
- [x] Зависимости проверены (нет breaking changes)
```

### 9.4 Правило паузы

**Gate = пауза. Пауза = норма, не задержка.**

Агент при достижении gate:
1. Фиксирует текущее состояние в артефакте
2. Формулирует что готово и что требует review
3. **Останавливается** и ждёт подтверждения человека
4. НЕ продолжает работу "пока человек смотрит"

---

## 10. Статусная модель и change log

### 10.1 Статусы шагов

```
[ ] → [→] → [✓]       штатный путь
              ↘
              [!]      blocked / needs-review
              ↘
              [↻]      retry (после исправления блокера)
```

| Маркер | Значение | Когда ставить | Действие |
|---|---|---|---|
| `[ ]` | **todo** | Шаг запланирован | — |
| `[→]` | **in-progress** | Агент начал выполнение | Обновить status.md |
| `[✓]` / `[x]` | **done** | Шаг завершён И проверен | Записать change log |
| `[!]` | **blocked** | Требуется решение человека или найдена проблема | Описать блокер |
| `[↻]` | **retry** | Блокер устранён, шаг перезапущен | Записать причину retry |

### 10.2 Progress tracker

```markdown
## Progress tracker
- [x] P1 — Planning artifacts created (`plan.md`, `status.md`)
- [x] P2 — Extract stage alignment
- [x] P3 — Stable ID registry contract
- [→] P4 — Infer thresholds from config
- [ ] P5 — Patch stage contract cleanup
- [!] P6 — Orchestrator hardening ← blocked: need decision on venv strategy
```

### 10.3 Change log

Каждая запись change log отвечает на три вопроса:

1. **ЧТО** изменено — файлы, функции, конфигурация
2. **ПОЧЕМУ** — ссылка на requirement или решение
3. **КАК ПРОВЕРЕНО** — команда валидации и её результат

**Формат:**

```markdown
### Change log

#### P3 — Stable ID registry contract (`extract.py`)
- Added `ID_REGISTRY_PATH = _registry/id_registry.json`.
- Implemented:
  - `load_id_registry()`
  - `save_id_registry()` with atomic temp-write + replace
  - bootstrap from existing `_registry/statements/**/*.json`
  - monotonic allocator `next_id(layer, run_id, registry)`
- ID allocation now persisted and collision-safe within registry contract.
- **Validation:** `python3 -m py_compile extract.py` — passed.
```

### 10.4 Notes секция

В конце status.md — секция для контекстных заметок, решений и оговорок:

```markdown
### Notes
- Live EXTRACT call was not executed in this pass (to avoid uncontrolled
  API side-effects/cost); transport path is implemented and validated
  syntactically.
- No new infrastructure/services/entities were introduced.
```

---

## 11. Context engineering

### 11.1 Контекст — конечный ресурс

AI-агенты работают в ограниченном контекстном окне. Context engineering — дисциплина управления этим ресурсом для максимальной эффективности.

> "Prompt engineering optimizes human-LLM interaction; context engineering optimizes agent-LLM interaction."

### 11.2 Стратегии управления контекстом

**a) Спека как внешняя память**

Детали хранятся в файлах, в промпт агенту загружается только сводка:

```
В промпте:         Иерархический ToC спеки (ключевые пункты, ссылки)
В файлах:          Полные тексты requirements, BDD-сценарии, архитектурные решения
```

**b) Один скоуп — одна сессия**

Не смешивать задачи в одной сессии. Если задача меняет и auth и schema — это две разные спеки и две разные сессии.

**c) Новая задача — новая сессия**

Не копить контекст бесконечно. Завершённая задача → status.md обновлён → новая сессия для следующей задачи.

**d) Chunking**

Большие документы разбиваются на чанки. Агент работает с чанком, релевантным текущему шагу, а не со всем документом.

**e) Context re-grounding**

В начале каждой сессии агент перечитывает:
1. `CLAUDE.md` — конституция
2. `spec.md` — текущие требования
3. `plan.md` — текущий план
4. `status.md` — где остановились

### 11.3 Иерархический ToC

Для крупных спецификаций — создать сводное оглавление, которое помещается в промпт:

```markdown
## Spec Summary (for prompt)

1. Path Containment — write ops validated against VAULT_PATH [3 scenarios]
2. Atomic Writes — temp-file + os.replace() pattern [2 scenarios]  
3. ID Registry — monotonic, collision-safe, atomic persistence [4 scenarios]
4. Logging — append-only JSONL, 5 event types [2 scenarios]

Full spec: `spec.md` (47 requirements, 89 scenarios)
```

---

## 12. Living document — стратегия обновления

### 12.1 Когда обновлять спеку

Спека обновляется **при каждом решении**, которое меняет её содержание:

| Событие | Действие |
|---|---|
| Человек изменил требование | Обновить requirement + BDD-сценарии + delta marker |
| Агент обнаружил невозможность реализации | Пометить [!], предложить альтернативу, дождаться решения |
| Изменился технический подход | Обновить plan.md + проверить spec.md на согласованность |
| Обнаружен edge case не покрытый спекой | Добавить BDD-сценарий, пометить [ADDED] |
| Вырезана фича из скоупа | Перенести в OUT OF SCOPE, пометить [REMOVED] |

### 12.2 Spec drift detection

Spec drift — ситуация, когда код разошёлся со спекой. Это **главный risk** SDD.

**Признаки drift:**
- Код делает то, чего нет в спеке
- Спека требует то, чего нет в коде
- BDD-сценарий описывает поведение, отличное от реального

**Предотвращение:**
- Обновлять спеку СРАЗУ при принятии решения, не "потом"
- В Validation Gate проверять: "спека всё ещё описывает то, что реализовано?"
- Delta markers делают изменения явными

### 12.3 Версионирование спеки

Для значимых ревизий — обновлять заголовок с версией:

```markdown
# Pipeline Security Specification (v2, 2026-04-13)
```

Git history хранит полную историю, но версия в заголовке помогает быстро ориентироваться.

---

## 13. Валидация и верификация

### 13.1 Почему верификация критична

Верификация — самая пропускаемая фаза в AI-разработке, при этом самая высокодоходная. Агенты систематически переоценивают завершённость. Без верификации "done" часто означает "скомпилировалось, но не работает".

> Workflow с верификацией: ~30-40 минут.  
> Без верификации: 60-90 минут итераций после "завершения" агентом.

### 13.2 Уровни валидации

| Уровень | Инструмент | Что проверяет | Когда |
|---|---|---|---|
| **Syntax** | `py_compile`, `tsc`, linter | Код синтаксически корректен | После каждого шага |
| **Static analysis** | mypy, pylint | Типы, unused imports, style | Перед Plan Gate |
| **Unit test** | pytest, jest | Отдельные функции | При наличии тестов |
| **Dry-run** | `--dry-run` flag | Pipeline проходит без side effects | После каждого шага |
| **Smoke test** | Минимальный реальный запуск | Система работает end-to-end | Validation Gate |
| **Spec conformance** | Ручная проверка BDD-сценариев | Реализация соответствует спеке | Validation Gate |

### 13.3 Формат записи валидации

```markdown
#### P8 — Validation
- Syntax validation passed:
  - `python3 -m py_compile extract.py infer.py patch.py publish.py`
- Runtime smoke check passed (dry-run, infer stage):
  - `python3 run_pipeline.py --dry-run --stage infer --stop-after infer`
  - stage `infer` completed successfully
  - lock released after run (`run_pipeline.lock` absent)
  - `runs.jsonl` entries created.
```

---

## 14. Восстановление после ошибок

### 14.1 Принципы recovery

1. **Изолированный retry** — если шаг P5 упал, retry только P5, не P1-P4
2. **Диагностика до retry** — разобраться ПОЧЕМУ упало, а не повторять вслепую
3. **Status.md как audit trail** — записать причину failure и что было сделано для fix
4. **Эскалация при неясности** — если причина неясна после investigation → [!] blocked → вопрос человеку

### 14.2 Протокол recovery

```
1. Шаг падает → пометить [!] в status.md
2. Записать: что именно упало, ошибка, контекст
3. Диагностика: прочитать ошибку, проверить assumptions
4. Определить: можно ли fix самостоятельно?
   ├── ДА → fix, пометить [↻], повторить шаг
   └── НЕТ → эскалировать человеку с описанием проблемы
5. После успешного retry → записать change log entry с объяснением
```

### 14.3 Rollback

Если шаг привёл к поломке, не покрываемой простым fix:

1. Git revert до последнего рабочего состояния
2. Обновить status.md: шаг → [!] с описанием почему rollback
3. Обновить plan.md если подход оказался нерабочим
4. Дождаться решения человека

---

## 15. Мульти-сессионная работа

### 15.1 Проблема потери контекста

Сложные задачи не помещаются в одну сессию. При смене сессии агент теряет весь контекст. Артефакты SDD решают эту проблему, являясь **персистентной внешней памятью**.

### 15.2 Протокол начала новой сессии

При входе в новую сессию агент:

```
1. Прочитать CLAUDE.md — глобальные правила
2. Прочитать spec.md — текущие требования
3. Прочитать plan.md — текущий план
4. Прочитать status.md — где остановились, что сделано, что впереди
5. Определить текущий шаг (первый незавершённый)
6. Продолжить работу
```

### 15.3 Протокол завершения сессии

Перед завершением сессии агент:

```
1. Обновить status.md — зафиксировать прогресс
2. Если шаг in-progress → записать где именно остановились
3. Если есть open questions → записать в Notes
4. Убедиться что артефакты согласованы (нет drift)
```

### 15.4 Принцип session scope

Одна сессия — один или несколько шагов одной задачи. Не смешивать задачи из разных спек в одной сессии.

---

## 16. Review protocol

### 16.1 Что ревьюит человек

Человек проверяет не код строчка за строчкой, а **соответствие спецификации**:

- Реализация покрывает все MUST/SHALL требования?
- BDD-сценарии проходят?
- Нет scope creep (агент не добавил лишнего)?
- Change log адекватно описывает изменения?
- Delta markers расставлены при обновлении спеки?

### 16.2 Что ревьюит агент (автоматически)

На каждом Step Gate агент самостоятельно проверяет:

- [ ] Syntax validation пройдена
- [ ] Dry-run не упал
- [ ] Acceptance criteria шага выполнены
- [ ] Change log записан
- [ ] status.md обновлён

### 16.3 Review как дифф

Человек ревьюит изменения **как PR** — через дифф файлов, не через чтение всего кода:

```bash
git diff HEAD~1          # что изменил последний шаг
git diff main..feature   # что изменилось по всей задаче
```

---

## 17. Anti-patterns

| # | Anti-pattern | Проблема | Решение |
|---|---|---|---|
| 1 | **Skip Specify** | Агент угадывает требования → переделки | Всегда начинать со спеки, даже для мелких задач |
| 2 | **Monolith prompt** | Контекст переполнен, агент теряет фокус | Один скоуп — одна спека — одна сессия |
| 3 | **Spec drift** | Код разошёлся со спекой, спека врёт | Обновлять спеку при каждом решении |
| 4 | **Overengineered spec** | 50 страниц для однострочного фикса | Масштабировать спеку по сложности задачи |
| 5 | **No gates** | Агент уходит в неконтролируемую генерацию | Явные паузы между фазами |
| 6 | **Unvalidated done** | Шаг отмечен без проверки | py_compile, dry-run, smoke test — до [✓] |
| 7 | **Context hoarding** | Всё в одной бесконечной сессии | Новая задача = новая сессия |
| 8 | **Implicit decisions** | Решения приняты, но не записаны | Каждое решение → plan.md или Notes |
| 9 | **Scope creep** | Агент делает "полезные улучшения" сверх плана | Строго следовать scope constraints |
| 10 | **Vibe coding** | Неструктурированный промпт вместо спеки | SDD workflow: Specify → Plan → Tasks → Execute |

---

## 18. Quick-start checklist

Полный чеклист для запуска Open Spec workflow. Ссылки `[→ §N]` указывают на секцию руководства с деталями.

---

### Фаза Specify — формирование требований [→ §3]

```
- [ ] Создать spec.md
  - [ ] Purpose: цель изменения + контекст/инцидент
  - [ ] Scope:
    - [ ] IN SCOPE — что входит
    - [ ] OUT OF SCOPE — что явно исключено
  - [ ] Requirements (каждый отдельным подзаголовком):
    - [ ] Используют RFC 2119 ключевые слова (MUST/SHALL/SHOULD/MAY) [→ §8.1]
    - [ ] Каждый requirement имеет ≥1 BDD-сценарий (GIVEN/WHEN/THEN) [→ §8.2]
    - [ ] Покрыты шаблоны сценариев:
      - [ ] Happy path — нормальный поток
      - [ ] Error path — обработка ошибок
      - [ ] Edge case — граничные условия
      - [ ] Concurrent access — параллельный доступ (если применимо)
  - [ ] 6 обязательных областей покрыты (по Osmani) [→ §3.4]:
    - [ ] Commands — полные команды с флагами
    - [ ] Testing — фреймворк, расположение, coverage
    - [ ] Project structure — где код, тесты, документация
    - [ ] Code style — форматирование, naming, лимиты
    - [ ] Boundaries — что агент НЕ должен делать
    - [ ] Dependencies — разрешённые и запрещённые
  - [ ] Acceptance Criteria — сводный список критериев приёмки
  - [ ] Dependencies — внешние зависимости, блокеры, связанные спеки
  - [ ] Open Questions — перечислены; пустые или помечены как deferred
- [ ] [SPEC GATE] Спека согласована с человеком [→ §9.2]
```

---

### Фаза Plan — технический план [→ §4]

```
- [ ] Создать plan.md
  - [ ] Scope constraints — первым параграфом:
    - [ ] Source of truth указан (какие файлы/модули)
    - [ ] Ограничения по технологиям и зависимостям
    - [ ] Что НЕ входит в скоуп реализации
  - [ ] Architecture decisions:
    - [ ] Выбранный подход и почему
    - [ ] Отвергнутые альтернативы (кратко)
    - [ ] Компромиссы и их обоснования
  - [ ] Tasks — список задач:
    - [ ] Каждая задача с acceptance criteria
    - [ ] Задачи упорядочены по зависимостям
    - [ ] Файлы, которые будут затронуты, указаны явно
    - [ ] Нет задач за пределами скоупа спеки
  - [ ] Risks — известные риски и план митигации
  - [ ] Validation strategy — как будет проверена реализация в целом
- [ ] [PLAN GATE] План согласован с человеком [→ §9.2]
```

---

### Фаза Tasks — декомпозиция [→ §5]

```
- [ ] Декомпозировать задачи на атомарные шаги
  - [ ] Каждый шаг — один логический change (можно проверить изолированно)
  - [ ] Acceptance criteria конкретны и проверяемы
    (не "работает", а "возвращает 429 на 6-м запросе в 60s окне")
  - [ ] Файлы указаны для каждого шага
  - [ ] Зависимости между шагами явные ("P3 зависит от P2")
  - [ ] Каждый шаг можно retry изолированно (P5 упал → retry P5, не P1-P4)
  - [ ] Для сложных задач: один шаг ≈ одна execution session [→ §15.4]
- [ ] Pre-Implementation Gates пройдены [→ §9.3]:
  - [ ] Спецификация согласована
  - [ ] Scope constraints зафиксированы в plan.md
  - [ ] Все open questions разрешены
  - [ ] Security review проведён (или JUSTIFIED с обоснованием)
  - [ ] Зависимости проверены (нет breaking changes)
- [ ] [TASK GATE] Декомпозиция согласована с человеком [→ §9.2]
```

---

### Фаза Execute — реализация [→ §6]

```
- [ ] Создать status.md:
  - [ ] Progress tracker — все шаги со статусами [ ] [→ §10.2]
  - [ ] Change log — секция для записей [→ §10.3]
  - [ ] Notes — секция для контекстных заметок [→ §10.4]

- [ ] Для каждого шага — протокол выполнения [→ §6.2]:
  - [ ] Обновить status.md: шаг → [→] (in-progress)
  - [ ] Выполнить действия шага
  - [ ] Проверить acceptance criteria шага
  - [ ] Step Gate — автоматическая проверка агентом [→ §16.2]:
    - [ ] Syntax validation пройдена (`py_compile`, `tsc`, linter)
    - [ ] Dry-run не упал
    - [ ] Acceptance criteria выполнены
    - [ ] Система осталась в рабочем состоянии после шага
  - [ ] Записать change log entry (ЧТО / ПОЧЕМУ / КАК ПРОВЕРЕНО) [→ §10.3]
  - [ ] Обновить status.md: шаг → [✓] (done)

- [ ] При ошибке — протокол recovery [→ §14.2]:
  - [ ] Пометить шаг [!] в status.md
  - [ ] Записать: что упало, ошибка, контекст
  - [ ] Диагностика: прочитать ошибку, проверить assumptions
  - [ ] Если fix возможен → fix, пометить [↻], повторить шаг
  - [ ] Если fix невозможен → эскалировать человеку с описанием
  - [ ] Если нужен rollback → git revert, обновить status.md [→ §14.3]

- [ ] При изменении решений в процессе [→ §12.1]:
  - [ ] Обновить plan.md (если изменился подход)
  - [ ] Обновить spec.md (если изменились требования)
  - [ ] Расставить delta markers: [ADDED] / [MODIFIED] / [REMOVED] / [CLARIFIED] [→ §8.3]
  - [ ] НЕ расширять скоуп — новые задачи → в plan, а не "по ходу" [→ §6.3]

- [ ] [VALIDATION GATE] Финальная проверка [→ §13.2]:
  - [ ] Syntax validation — `py_compile`, `tsc`, linter
  - [ ] Static analysis — mypy, pylint (если применимо)
  - [ ] Unit tests — pytest, jest (если тесты существуют)
  - [ ] Dry-run — pipeline проходит без side effects
  - [ ] Smoke test — минимальный реальный запуск end-to-end
  - [ ] Spec conformance — BDD-сценарии проходят (ручная проверка)
  - [ ] Spec drift check — спека описывает то, что реализовано [→ §12.2]
  - [ ] Change log заполнен для каждого шага
  - [ ] Notes секция заполнена (оговорки, контекст)
  - [ ] Финальный review человеком [→ §16.1]:
    - [ ] MUST/SHALL requirements покрыты
    - [ ] BDD-сценарии проходят
    - [ ] Нет scope creep
    - [ ] Change log адекватен
    - [ ] Delta markers расставлены (если спека обновлялась)
```

---

### Мульти-сессионная работа [→ §15]

```
- [ ] Протокол начала новой сессии [→ §15.2]:
  - [ ] Прочитать CLAUDE.md — глобальные правила
  - [ ] Прочитать spec.md — текущие требования
  - [ ] Прочитать plan.md — текущий план
  - [ ] Прочитать status.md — где остановились
  - [ ] Определить текущий шаг (первый незавершённый)
  - [ ] Продолжить работу

- [ ] Протокол завершения сессии [→ §15.3]:
  - [ ] Обновить status.md — зафиксировать прогресс
  - [ ] Если шаг in-progress → записать где именно остановились
  - [ ] Если есть open questions → записать в Notes
  - [ ] Проверить: артефакты согласованы, нет drift
```

---

### Context engineering [→ §11]

```
- [ ] Один скоуп — одна спека — одна сессия
- [ ] Спека как внешняя память: детали в файлах, в промпте — сводка
- [ ] Для крупных спек: создать иерархический ToC [→ §11.3]
- [ ] Большие документы: chunking по релевантности к текущему шагу [→ §11.2d]
- [ ] Context re-grounding при входе в сессию [→ §11.2e]
- [ ] Новая задача = новая сессия (не копить контекст)
```

---

## 19. Источники

### Методология и принципы
- [Addy Osmani — How to write a good spec for AI agents](https://addyosmani.com/blog/good-spec/) — 6 областей спецификации, управление контекстом
- [Thoughtworks — Spec-driven development: key new engineering practice](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices) — SDD как методология
- [arXiv — Spec-Driven Development: From Code to Contract (Feb 2026)](https://arxiv.org/html/2602.00180v1) — академический анализ SDD

### Фреймворки и инструменты
- [GitHub Spec Kit](https://github.com/github/spec-kit) — open-source toolkit для SDD, 4-фазный gated workflow
- [Fission-AI OpenSpec](https://github.com/Fission-AI/OpenSpec) — spec-driven framework для AI assistants
- [OpenSpec Deep Dive](https://redreamality.com/garden/notes/openspec-guide/) — архитектура и практика OpenSpec

### Практика применения
- [Heeki Park — Using SDD with Claude Code](https://heeki.medium.com/using-spec-driven-development-with-claude-code-4a1ebe5d9f29) — SDD + Claude Code
- [Nimbalyst — Coding with AI Agents: Best Practices 2026](https://nimbalyst.com/blog/coding-with-ai-agents-best-practices-2026/) — обзор best practices
- [Mike Mason — AI Coding Agents: Coherence Through Orchestration](https://mikemason.ca/writing/ai-coding-agents-jan-2026/) — orchestration vs autonomy

### Context engineering
- [Context Engineering & SDD](https://contextua.dev/specification-driven-development/) — спецификация и контекст
- [WeBuild-AI — Aligning SDD and Context Engineering for 2026](https://www.webuild-ai.com/insights/aligning-spec-driven-development-and-context-engineering-for-2026) — конвергенция SDD и CE

### Стандарты
- [RFC 2119 — Key words for use in RFCs](https://www.rfc-editor.org/info/rfc2119) — SHALL, MUST, SHOULD, MAY
- [Dave Patten — SDD: From Build to Runtime Diagnostics](https://medium.com/@dave-patten/spec-driven-development-with-ai-agents-from-build-to-runtime-diagnostics-415025fb1d62) — SDD в полном цикле
