# 3. Фаза Specify — формирование требований

## 3.1 Цель фазы

Зафиксировать **ЧТО** нужно сделать и **ЗАЧЕМ**, без технических решений. Результат — структурированная спецификация, которая становится контрактом.

## 3.2 Структура spec.md

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

## 3.3 Правила написания требований

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

## 3.4 Шесть обязательных областей (по Addy Osmani)

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

## 3.5 Spec Gate — критерии перехода

Перед переходом к Plan, проверяется:
- [ ] Purpose заполнен и понятен
- [ ] Scope определён (IN/OUT)
- [ ] Все requirements используют RFC 2119 ключевые слова
- [ ] Каждое requirement имеет минимум один BDD-сценарий
- [ ] Open Questions пусты или помечены как deferred
- [ ] Человек подтвердил спеку
