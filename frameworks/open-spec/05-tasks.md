# 5. Фаза Tasks — декомпозиция

## 5.1 Цель фазы

Разбить план на **атомарные, исполняемые шаги** с чёткими критериями завершения.

## 5.2 Принципы декомпозиции

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

## 5.3 Формат задачи

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

## 5.4 Task Gate — критерии перехода

- [ ] Все задачи из плана декомпозированы
- [ ] Каждый шаг атомарен и может быть проверен изолированно
- [ ] Acceptance criteria определены для каждого шага
- [ ] Зависимости между шагами указаны
- [ ] Человек подтвердил декомпозицию
