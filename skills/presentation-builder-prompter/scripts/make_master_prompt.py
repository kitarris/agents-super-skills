#!/usr/bin/env python3
"""Build a one-shot master prompt from a brief JSON file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REFS = ROOT / "references"
WORKSPACE_ROOT = ROOT.parents[1]
OUTPUT_DIR_TOKEN = Path(".tmp") / "presentation-builder-prompter"
OUTPUT_DIR = WORKSPACE_ROOT / OUTPUT_DIR_TOKEN
DEFAULT_SLOT_MAP = {
    "title": "title_slot",
    "support": "support_slot",
    "primary_visual": "content_zone",
    "sources": "content_zone",
}


DEFAULT_BRIEF = {
    "audience": "широкая аудитория",
    "goal": "объяснить тему и дать практический следующий шаг",
    "duration_minutes": 10,
    "format": "screen-share",
    "tone": "ясный, доказательный, спокойный",
    "must_include": [],
    "sources": [],
    "constraints": [],
    "output_dir": str(OUTPUT_DIR_TOKEN),
    "control_policy": "keyboard-only",
}


def read_text(name: str) -> str:
    return (REFS / name).read_text(encoding="utf-8").strip()


def normalize_brief(raw: dict) -> dict:
    brief = dict(DEFAULT_BRIEF)
    brief.update({k: v for k, v in raw.items() if v not in (None, "")})
    if not brief.get("topic"):
        raise SystemExit("brief.topic is required")
    return brief


def make_seed_deck_spec(brief: dict) -> dict:
    topic = brief["topic"]
    audience = brief["audience"]
    core = f"{topic} помогает {audience} понять главное и сделать следующий шаг."
    roles = [
        ("Title / Promise", "TitlePromise", "promise-visual"),
        ("Tension / Why It Matters", "TensionSplit", "tension-split"),
        ("Framework / Mental Model", "FrameworkGrid", "framework-2x2"),
        ("Evidence / Data", "EvidenceRight", "evidence-right"),
        ("Contrast / Before-After", "ContrastDuo", "contrast-duo"),
        ("Mechanism / How It Works", "MechanismFlow", "mechanism-flow"),
        ("Practice / What To Do", "PracticeGrid", "practice-grid"),
        ("Key Insight", "KeyInsightPause", "key-insight"),
        ("CTA / Next Step", "CTABox", "cta-box"),
        ("Sources / Backup", "SourcesBackup", "sources-backup"),
    ]
    slides = []
    for index, (role, component, layout) in enumerate(roles, start=1):
        geometry_role = "standard"
        if role == "Title / Promise":
            geometry_role = "title_visual"
        elif role == "Evidence / Data":
            geometry_role = "data"
        elif role == "Key Insight":
            geometry_role = "pause"
        elif role == "Sources / Backup":
            geometry_role = "source_backup"
        slides.append(
            {
                "index": index,
                "role": role,
                "geometry_role": geometry_role,
                "claim_title": f"[сформулировать action title для: {role}]",
                "support_text": "[1-2 строки поддержки]",
                "content_blocks": [],
                "proof_object": {"type": "visual_anchor" if index == 1 else "diagram", "message": "[что доказывает визуал]"},
                "component": component,
                "layout_contract": layout,
                "slot_map": DEFAULT_SLOT_MAP,
                "scroll_policy": "content-zone",
                "interaction": "none",
                "source": "",
                "qa_checks": ["one_claim", "layout_contract_respected", "fixed_stage_frame"],
            }
        )
    slides[-1]["proof_object"] = {"type": "source_list", "message": "источники и границы"}
    slides[-2]["proof_object"] = {"type": "pause", "message": "следующий шаг"}
    return {
        "deck_title": topic,
        "audience": audience,
        "output_dir": brief.get("output_dir", str(OUTPUT_DIR_TOKEN)),
        "control_policy": brief.get("control_policy", "keyboard-only"),
        "geometry_policy": {
            "frame_contract": "fixed-stage-frame",
            "required_slots": ["title_slot", "support_slot", "content_zone"],
            "coordinate_delta_tolerance_px": 0,
            "scroll_policy": "content-zone",
        },
        "core_promise": core,
        "claim_spine": [
            f"{topic}: зачем слушать",
            f"{topic}: где возникает напряжение",
            f"{topic}: какая рамка объясняет тему",
            f"{topic}: какие доказательства важны",
            f"{topic}: что делать дальше",
        ],
        "visual_system": {"mode": "calm editorial evidence deck"},
        "interaction_policy": {"default": "meaning-led, minimal"},
        "source_registry": brief.get("sources", []),
        "slides": slides,
        "qa_gates": [
            "titles_form_story",
            "one_claim_per_slide",
            "layout_contracts_respected",
            "desktop_mobile_checked",
        ],
    }


def build_prompt(brief: dict, seed: dict) -> str:
    template = read_text("master-prompt-template.md")
    slide_roles = read_text("slide-role-library.md")
    layout_contracts = read_text("layout-contracts.md")
    anti_patterns = read_text("anti-patterns.md")
    brief_json = json.dumps(brief, ensure_ascii=False, indent=2)
    seed_json = json.dumps(seed, ensure_ascii=False, indent=2)
    prompt = template.replace("{{BRIEF}}", brief_json)
    prompt = prompt.replace("{{SLIDE_ROLES}}", slide_roles)
    prompt = prompt.replace("{{LAYOUT_CONTRACTS}}", layout_contracts)
    prompt = prompt.replace("{{ANTI_PATTERNS}}", anti_patterns)
    prompt += "\n\n## Seed DeckSpec\n\n```json\n" + seed_json + "\n```\n"
    return prompt


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--brief", required=True, help="Path to brief JSON")
    parser.add_argument("--out", default=str(OUTPUT_DIR / "master-prompt.md"), help="Output master prompt path")
    parser.add_argument("--seed", default=str(OUTPUT_DIR / "deck-spec.seed.json"), help="Output seed DeckSpec path")
    args = parser.parse_args()

    raw = json.loads(Path(args.brief).read_text(encoding="utf-8"))
    brief = normalize_brief(raw)
    seed = make_seed_deck_spec(brief)
    seed_path = Path(args.seed)
    out_path = Path(args.out)
    seed_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    seed_path.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_path.write_text(build_prompt(brief, seed), encoding="utf-8")
    print(f"Wrote {args.out}")
    print(f"Wrote {args.seed}")


if __name__ == "__main__":
    main()
