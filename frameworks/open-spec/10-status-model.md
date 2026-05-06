# 10. Статусная модель и change log

## 10.1 Статусы шагов

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

## 10.2 Progress tracker

```markdown
## Progress tracker
- [x] P1 — Planning artifacts created (`plan.md`, `status.md`)
- [x] P2 — Extract stage alignment
- [x] P3 — Stable ID registry contract
- [→] P4 — Infer thresholds from config
- [ ] P5 — Patch stage contract cleanup
- [!] P6 — Orchestrator hardening ← blocked: need decision on venv strategy
```

## 10.3 Change log

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

## 10.4 Notes секция

В конце status.md — секция для контекстных заметок, решений и оговорок:

```markdown
### Notes
- Live EXTRACT call was not executed in this pass (to avoid uncontrolled
  API side-effects/cost); transport path is implemented and validated
  syntactically.
- No new infrastructure/services/entities were introduced.
```
