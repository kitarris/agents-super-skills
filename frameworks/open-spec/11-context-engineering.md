# 11. Context engineering

## 11.1 Контекст — конечный ресурс

AI-агенты работают в ограниченном контекстном окне. Context engineering — дисциплина управления этим ресурсом для максимальной эффективности.

> "Prompt engineering optimizes human-LLM interaction; context engineering optimizes agent-LLM interaction."

## 11.2 Стратегии управления контекстом

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
1. `CLAUDE.md` и `AGENTS.md`  — конституция
2. `spec.md` — текущие требования
3. `plan.md` — текущий план
4. `status.md` — где остановились

## 11.3 Иерархический ToC

Для крупных спецификаций — создать сводное оглавление, которое помещается в промпт:

```markdown
## Spec Summary (for prompt)

1. Path Containment — write ops validated against VAULT_PATH [3 scenarios]
2. Atomic Writes — temp-file + os.replace() pattern [2 scenarios]  
3. ID Registry — monotonic, collision-safe, atomic persistence [4 scenarios]
4. Logging — append-only JSONL, 5 event types [2 scenarios]

Full spec: `spec.md` (47 requirements, 89 scenarios)
```
