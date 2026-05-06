#!/usr/bin/env node
// Heuristic static composition checks. Use browser-based QA for final pixel checks.

import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: score_composition.mjs <deck.html>");
  process.exit(2);
}

const html = fs.readFileSync(file, "utf8");
const findings = [];
const controlPolicy = (html.match(/data-control-policy=["']([^"']+)["']/i)?.[1] || "").toLowerCase();
const keyboardOnly =
  controlPolicy === "keyboard-only" ||
  /control_policy["']?\s*:\s*["']keyboard-only/i.test(html) ||
  /KeyboardOnlyNavigation|no-visible-controls/i.test(html);

function add(level, code, message) {
  findings.push({ level, code, message });
}

if (!/--fs-title/.test(html) || !/--fs-heading/.test(html) || !/--fs-body/.test(html)) {
  add("warning", "missing_type_tokens", "Role-based typography tokens not detected");
}

if (/font-size:\s*clamp\([^;]*vw/i.test(html)) {
  add("warning", "viewport_scaled_type", "Viewport-scaled typography detected; prefer role-based breakpoints");
}

if (/\.card\s+span\s*\{[\s\S]*?color:/i.test(html) && !/\.card\s+\.number/.test(html)) {
  add("warning", "number_badge_cascade", "Card span styles may override number badges");
}

if (/data-type=["']Evidence \/ Data["']/i.test(html) && !/evidence-right|evidence-template|EvidenceRight/i.test(html)) {
  add("warning", "evidence_contract_missing", "Evidence slide detected without evidence-right/template contract");
}

if (/pill/i.test(html) && /data-type=["']Title \/ Promise["'][\s\S]{0,800}pill/i.test(html)) {
  add("warning", "title_pills", "Title slide appears to contain pills/tags");
}

if (!/control|controls/.test(html) && !keyboardOnly) {
  add("warning", "missing_control_layer", "No control layer detected");
}

if (keyboardOnly && !/keydown|ArrowRight|Space|Home|End/.test(html)) {
  add("error", "keyboard_only_without_keyboard", "Keyboard-only deck lacks keyboard navigation");
}

if (!/slide-inner/.test(html) || !/content-zone/.test(html)) {
  add("warning", "missing_fixed_stage_classes", "Fixed-stage frame classes (.slide-inner/.content-zone) not detected");
}

console.log(JSON.stringify({ passed: findings.every((f) => f.level !== "error"), findings }, null, 2));
