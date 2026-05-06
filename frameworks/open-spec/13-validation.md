# 13. Валидация и верификация

## 13.1 Почему верификация критична

Верификация — самая пропускаемая фаза в AI-разработке, при этом самая высокодоходная. Агенты систематически переоценивают завершённость. Без верификации "done" часто означает "скомпилировалось, но не работает".

> Workflow с верификацией: ~30-40 минут.  
> Без верификации: 60-90 минут итераций после "завершения" агентом.

## 13.2 Уровни валидации

| Уровень | Инструмент | Что проверяет | Когда |
|---|---|---|---|
| **Syntax** | `py_compile`, `tsc`, linter | Код синтаксически корректен | После каждого шага |
| **Static analysis** | mypy, pylint | Типы, unused imports, style | Перед Plan Gate |
| **Unit test** | pytest, jest | Отдельные функции | При наличии тестов |
| **Dry-run** | `--dry-run` flag | Pipeline проходит без side effects | После каждого шага |
| **Smoke test** | Минимальный реальный запуск | Система работает end-to-end | Validation Gate |
| **Spec conformance** | Ручная проверка BDD-сценариев | Реализация соответствует спеке | Validation Gate |

## 13.3 Формат записи валидации

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
