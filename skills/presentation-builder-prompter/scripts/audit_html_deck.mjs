#!/usr/bin/env node
// Static HTML audit for generated single-file decks. No external dependencies.

import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("Usage: audit_html_deck.mjs <deck.html>");
  process.exit(2);
}

const html = fs.readFileSync(file, "utf8");
const slides = [...html.matchAll(/<article\b[^>]*class=["'][^"']*\bslide\b[^"']*["'][^>]*>/gi)];
const findings = [];
const controlPolicy = (html.match(/data-control-policy=["']([^"']+)["']/i)?.[1] || "").toLowerCase();
const keyboardOnly =
  controlPolicy === "keyboard-only" ||
  /control_policy["']?\s*:\s*["']keyboard-only/i.test(html) ||
  /KeyboardOnlyNavigation|no-visible-controls/i.test(html);

function add(level, code, message) {
  findings.push({ level, code, message });
}

if (slides.length === 0) add("error", "no_slides", "No <article class=\"slide\"> elements found");

const skillRoot = process.env.SKILL_ROOT ? path.resolve(process.env.SKILL_ROOT) : "";
if (skillRoot) {
  const resolvedFile = path.resolve(file);
  const relative = path.relative(skillRoot, resolvedFile);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    add("error", "artifact_in_skill_dir", "Generated deck HTML is inside the skill directory; use the skill .tmp output directory");
  }
}

slides.forEach((match, index) => {
  const tag = match[0];
  if (!/data-type=/.test(tag)) {
    add("error", "missing_data_type", `Slide ${index + 1} lacks data-type`);
  }
});

const forbiddenVisible = [
  "PROGRESSIVE DISCLOSURE",
  "BODY CLIMATE",
  "WELLNESS BRIEFING",
  "INTERACTION MAP"
];

for (const term of forbiddenVisible) {
  if (html.includes(term)) add("warning", "technical_kicker", `Forbidden visible technical label: ${term}`);
}

if (/<script\s+src=["']https?:\/\/unpkg\.com\/three/i.test(html) && !/no-three|fallback|graceful/i.test(html)) {
  add("warning", "three_without_fallback", "Three.js appears to be used without obvious fallback");
}

if (!/prefers-reduced-motion|reduce-motion/i.test(html)) {
  add("warning", "missing_reduced_motion", "No reduced motion support detected");
}

if (!/keydown|ArrowRight|Space|Home|End/.test(html)) {
  add("warning", "keyboard_navigation", "Keyboard navigation not detected");
}

if (keyboardOnly && !/keydown|ArrowRight|Space|Home|End/.test(html)) {
  add("error", "keyboard_only_without_keyboard", "Keyboard-only deck lacks keyboard navigation");
}

const staleControlRefs = ["prev", "next", "overview", "present", "help", "fullscreen"].filter((id) => {
  const hasElement = new RegExp(`id=["']${id}["']`, "i").test(html);
  const hasRef = new RegExp(`getElementById\\(["']${id}["']\\)|querySelector\\(["']#${id}["']\\)`, "i").test(html);
  return hasRef && !hasElement;
});
if (staleControlRefs.length > 0) {
  add("error", "stale_control_dom_refs", `Script references missing control elements: ${staleControlRefs.join(", ")}`);
}

if (!/slide-inner/.test(html) || !/content-zone/.test(html)) {
  add("warning", "missing_fixed_stage_classes", "Fixed-stage frame classes (.slide-inner/.content-zone) not detected");
}

if (!/source|источник/i.test(html)) {
  add("warning", "missing_sources", "No source strategy detected");
}

const errors = findings.filter((item) => item.level === "error");
console.log(JSON.stringify({ passed: errors.length === 0, slide_count: slides.length, findings }, null, 2));
process.exit(errors.length ? 1 : 0);
