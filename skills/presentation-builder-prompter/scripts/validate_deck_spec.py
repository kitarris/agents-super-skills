#!/usr/bin/env python3
"""Lightweight semantic validation for DeckSpec JSON."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = ROOT.parents[1]


TOPIC_TITLE_PATTERNS = [
    r"^о\s+",
    r"^про\s+",
    r"^введение$",
    r"^обзор$",
    r"^контекст$",
    r"^данные$",
    r"^метрики$",
    r"^источники$",
    r"^что такое",
]

VALID_ROLES = {
    "Title / Promise",
    "Tension / Why It Matters",
    "Framework / Mental Model",
    "Evidence / Data",
    "Contrast / Before-After",
    "Mechanism / How It Works",
    "Practice / What To Do",
    "Key Insight",
    "CTA / Next Step",
    "Sources / Backup",
}


def looks_topic_like(title: str) -> bool:
    normalized = title.strip().lower()
    return any(re.search(pattern, normalized) for pattern in TOPIC_TITLE_PATTERNS)


def validate(spec: dict) -> list[dict]:
    findings: list[dict] = []
    slides = spec.get("slides", [])
    output_dir = spec.get("output_dir")
    if not output_dir:
        findings.append({"level": "warning", "path": "output_dir", "message": "Missing output_dir; generated artifacts should go under .tmp/<skill-name> relative to workspace root"})
    else:
        raw_output = Path(output_dir).expanduser()
        resolved_output = raw_output.resolve() if raw_output.is_absolute() else (WORKSPACE_ROOT / raw_output).resolve()
        relative = Path()
        try:
            relative = resolved_output.relative_to(ROOT)
        except ValueError:
            relative = None
        if relative is not None:
            findings.append({"level": "error", "path": "output_dir", "message": "output_dir points inside the skill directory"})
    if not spec.get("geometry_policy"):
        findings.append({"level": "warning", "path": "geometry_policy", "message": "Missing geometry_policy for fixed-stage frame QA"})
    if not spec.get("claim_spine") or len(spec.get("claim_spine", [])) < 3:
        findings.append({"level": "error", "path": "claim_spine", "message": "claim_spine must contain at least 3 claims"})
    if not slides:
        findings.append({"level": "error", "path": "slides", "message": "DeckSpec must contain slides"})
        return findings

    for i, slide in enumerate(slides, start=1):
        path = f"slides[{i}]"
        role = slide.get("role")
        title = slide.get("claim_title", "")
        if role not in VALID_ROLES:
            findings.append({"level": "error", "path": f"{path}.role", "message": f"Unknown slide role: {role!r}"})
        if not title:
            findings.append({"level": "error", "path": f"{path}.claim_title", "message": "Missing claim_title"})
        elif looks_topic_like(title):
            findings.append({"level": "warning", "path": f"{path}.claim_title", "message": f"Title looks topic-like: {title!r}"})
        if role not in {"Key Insight", "Sources / Backup"} and not slide.get("proof_object"):
            findings.append({"level": "error", "path": f"{path}.proof_object", "message": "Missing proof_object"})
        if not slide.get("component"):
            findings.append({"level": "error", "path": f"{path}.component", "message": "Missing component"})
        if not slide.get("layout_contract"):
            findings.append({"level": "error", "path": f"{path}.layout_contract", "message": "Missing layout_contract"})
        if not slide.get("slot_map"):
            findings.append({"level": "warning", "path": f"{path}.slot_map", "message": "Missing slot_map for title/support/content geometry"})
        if not slide.get("scroll_policy"):
            findings.append({"level": "warning", "path": f"{path}.scroll_policy", "message": "Missing scroll_policy; dense slides should scroll inside content-zone"})
        if not slide.get("qa_checks"):
            findings.append({"level": "warning", "path": f"{path}.qa_checks", "message": "Missing qa_checks"})
        support = slide.get("support_text", "")
        if len(support) > 260:
            findings.append({"level": "warning", "path": f"{path}.support_text", "message": "Support text is likely too long"})
        if role == "Evidence / Data" and not (slide.get("source") or spec.get("source_registry")):
            findings.append({"level": "warning", "path": f"{path}.source", "message": "Evidence slide should have a source"})
    return findings


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("deck_spec")
    args = parser.parse_args()
    spec = json.loads(Path(args.deck_spec).read_text(encoding="utf-8"))
    findings = validate(spec)
    errors = [item for item in findings if item["level"] == "error"]
    print(json.dumps({"passed": not errors, "findings": findings}, ensure_ascii=False, indent=2))
    raise SystemExit(1 if errors else 0)


if __name__ == "__main__":
    main()
