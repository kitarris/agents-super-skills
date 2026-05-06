# 8. Язык спецификаций: RFC 2119 + BDD

## 8.1 RFC 2119 — полный справочник

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

## 8.2 BDD — Gherkin-совместимый формат

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

## 8.3 Delta markers — маркировка изменений

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
