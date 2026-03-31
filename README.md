# agents-super-skills

A small repository of reusable AI agent skills.

The current collection contains prompt-oriented skills for AI agents. The skill bodies are authored in Russian and live as standalone `SKILL.md` files under `skills/`.

## Included Skills

| Skill | Description |
| --- | --- |
| `deep-research-prompter` | Generates a self-contained Russian master prompt for deep research workflows with explicit planning, evidence standards, and source hygiene. |
| `frontend-design-prompter` | Generates a self-contained Russian master prompt for production-ready frontend design workflows based on GPT-5.4-oriented implementation guidelines. |
| `presentation-builder-prompter` | Generates a self-contained Russian master prompt for interactive single-file HTML presentations with strong narrative structure, polished motion, and live-demo-friendly UX. |

## Repository Structure

```text
skills/
  deep-research-prompter/
    SKILL.md
  frontend-design-prompter/
    SKILL.md
  presentation-builder-prompter/
    SKILL.md
```

## Notes

- Each skill is packaged as a single `SKILL.md` entrypoint.
- The current skills are intended for Russian-language prompting workflows.
- The repository is designed to stay simple and easy to extend with additional AI agent skills over time.
