# agents-super-skills

A small repository of reusable AI agent skills and workflow frameworks.

The current collection contains prompt-oriented skills for AI agents and reusable documentation bundles for agent workflows. Skill bodies are authored in Russian and live as standalone `SKILL.md` files under `skills/`. Multi-file workflow frameworks live under `frameworks/`.

## Included Skills

| Skill | Description |
| --- | --- |
| `deep-research-prompter` | Generates a self-contained Russian master prompt for deep research workflows with explicit planning, evidence standards, and source hygiene. |
| `frontend-design-prompter` | Generates a self-contained Russian master prompt for production-ready frontend design workflows based on GPT-5.4-oriented implementation guidelines. |
| `presentation-builder-prompter` | Generates a self-contained Russian master prompt for interactive single-file HTML presentations with strong narrative structure, polished motion, and live-demo-friendly UX. |

## Included Frameworks

| Framework | Description |
| --- | --- |
| `open-spec` | Provides a Russian-language markdown framework for spec-driven development with gated phases, artifact lifecycle guidance, validation rules, review protocol, and recovery patterns for AI agents. |

## Repository Structure

```text
skills/
  deep-research-prompter/
    SKILL.md
  frontend-design-prompter/
    SKILL.md
  presentation-builder-prompter/
    SKILL.md
frameworks/
  open-spec/
    README.md
    open-spec-workflow.md
    01-philosophy.md
    ...
    19-sources.md
```

## Notes

- Each prompt skill is packaged as a single `SKILL.md` entrypoint.
- Workflow frameworks may include a README plus supporting phase, reference, and checklist documents.
- The current materials are intended for Russian-language agent workflows.
- The repository is designed to stay simple and easy to extend with additional AI agent skills over time.
