#!/usr/bin/env node
// Optional screenshot renderer. Requires Playwright to be installed in the runtime.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [,, htmlFile, outDir = "preview"] = process.argv;
if (!htmlFile) {
  console.error("Usage: render_contact_sheet.mjs <deck.html> [outDir]");
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  fs.mkdirSync(outDir, { recursive: true });
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const geometryScript = path.join(scriptDir, "audit_geometry.mjs");
  if (!fs.existsSync(geometryScript)) {
    console.error("Playwright is not available, and audit_geometry.mjs fallback was not found.");
    process.exit(2);
  }
  const reportPath = path.join(outDir, "geometry-report.json");
  const result = spawnSync(process.execPath, [geometryScript, htmlFile, reportPath], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  let report = null;
  try {
    report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  } catch {
    report = null;
  }
  console.log(JSON.stringify({
    slide_count: report?.slide_count ?? null,
    screenshots: [],
    geometry_report: reportPath,
    geometry_passed: report?.passed ?? true,
    renderer: "geometry-fallback"
  }, null, 2));
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });

const fileUrl = "file://" + path.resolve(htmlFile);
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "low-desktop", width: 1366, height: 640 },
  { name: "mobile", width: 390, height: 844 }
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: viewports[0] });
await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
const count = await page.locator(".slide").count();
await page.close();

const screenshots = [];
for (const viewport of viewports) {
  const p = await browser.newPage({ viewport });
  await p.goto(fileUrl, { waitUntil: "domcontentloaded" });
  for (let i = 0; i < count; i += 1) {
    await p.evaluate((index) => {
      const slides = [...document.querySelectorAll(".slide")];
      slides.forEach((slide, j) => {
        slide.classList.toggle("active", j === index);
        slide.classList.toggle("past", j < index);
      });
    }, i);
    const target = path.join(outDir, `${viewport.name}-slide-${String(i + 1).padStart(2, "0")}.png`);
    await p.screenshot({ path: target, fullPage: false });
    screenshots.push(target);
  }
  await p.close();
}

await browser.close();
console.log(JSON.stringify({ slide_count: count, screenshots }, null, 2));
