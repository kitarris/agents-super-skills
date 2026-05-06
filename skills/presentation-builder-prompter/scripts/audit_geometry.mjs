#!/usr/bin/env node
// Browser geometry audit through Chrome DevTools Protocol. No external npm deps.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [,, htmlFile, outFile] = process.argv;
if (!htmlFile) {
  console.error("Usage: audit_geometry.mjs <deck.html> [out.json]");
  process.exit(2);
}

if (typeof fetch !== "function" || typeof WebSocket !== "function") {
  console.error("audit_geometry.mjs requires a Node runtime with global fetch and WebSocket support");
  process.exit(2);
}

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "low-desktop", width: 1366, height: 640 },
  { name: "mobile", width: 390, height: 844 }
];
const tolerance = Number(process.env.GEOMETRY_TOLERANCE_PX ?? 1);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chromePath() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  for (const binary of ["google-chrome", "chromium", "chromium-browser", "chrome"]) {
    const found = spawnSync("which", [binary], { encoding: "utf8" }).stdout.trim();
    if (found) return found;
  }
  return "";
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

async function waitForCdp(baseUrl, timeoutMs = 10000) {
  const until = Date.now() + timeoutMs;
  let lastError = "";
  while (Date.now() < until) {
    try {
      await fetchJson(`${baseUrl}/json/version`);
      return;
    } catch (error) {
      lastError = String(error.message || error);
      await delay(150);
    }
  }
  throw new Error(`Chrome DevTools endpoint did not become ready: ${lastError}`);
}

async function launchBrowser() {
  if (process.env.CDP_URL) {
    return {
      baseUrl: process.env.CDP_URL.replace(/\/$/, ""),
      close: async () => {}
    };
  }

  const binary = chromePath();
  if (!binary) throw new Error("Chrome/Chromium not found. Set CHROME_BIN or CDP_URL.");

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "deck-geometry-"));
  const port = 30000 + Math.floor(Math.random() * 20000);
  const proc = spawn(binary, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "about:blank"
  ], { stdio: "ignore" });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await waitForCdp(baseUrl);
  } catch (error) {
    proc.kill();
    fs.rmSync(userDataDir, { recursive: true, force: true });
    throw error;
  }

  return {
    baseUrl,
    close: async () => {
      proc.kill();
      await delay(100);
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  };
}

class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
      else resolve(message.result);
    });
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 8000);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        }
      });
    });
  }

  close() {
    this.ws?.close();
  }
}

async function newPage(baseUrl) {
  let target;
  const targetUrl = `${baseUrl}/json/new?${encodeURIComponent("about:blank")}`;
  try {
    target = await fetchJson(targetUrl, { method: "PUT" });
  } catch {
    target = await fetchJson(targetUrl);
  }
  const session = new CdpSession(target.webSocketDebuggerUrl);
  await session.open();
  return { session, targetId: target.id };
}

async function waitReady(session) {
  const until = Date.now() + 8000;
  while (Date.now() < until) {
    const ready = await session.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true
    });
    if (["interactive", "complete"].includes(ready.result?.value)) {
      await delay(100);
      return;
    }
    await delay(100);
  }
  throw new Error("Timed out waiting for document readiness");
}

async function evaluate(session, expression) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result.value;
}

function geometryExpression() {
  return `(${(() => {
    const round = (value) => Math.round(value * 100) / 100;
    const rect = (element) => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        x: round(box.x),
        y: round(box.y),
        width: round(box.width),
        height: round(box.height),
        right: round(box.right),
        bottom: round(box.bottom)
      };
    };
    const slotRects = (stage) => {
      const stageRect = rect(stage);
      if (!stageRect) return {};
      const style = getComputedStyle(stage);
      const rows = style.gridTemplateRows.trim().split(/\s+/).map((value) => parseFloat(value)).filter((value) => Number.isFinite(value));
      const rowGap = parseFloat(style.rowGap) || 0;
      if (rows.length < 3) return {};
      const titleHeight = rows[0];
      const supportHeight = rows[1];
      const contentHeight = Math.max(0, stageRect.height - titleHeight - supportHeight - rowGap * 2);
      return {
        title: {
          x: stageRect.x,
          y: stageRect.y,
          width: stageRect.width,
          height: round(titleHeight),
          right: stageRect.right,
          bottom: round(stageRect.y + titleHeight)
        },
        support: {
          x: stageRect.x,
          y: round(stageRect.y + titleHeight + rowGap),
          width: stageRect.width,
          height: round(supportHeight),
          right: stageRect.right,
          bottom: round(stageRect.y + titleHeight + rowGap + supportHeight)
        },
        content: {
          x: stageRect.x,
          y: round(stageRect.y + titleHeight + supportHeight + rowGap * 2),
          width: stageRect.width,
          height: round(contentHeight),
          right: stageRect.right,
          bottom: round(stageRect.y + stageRect.height)
        }
      };
    };
    const isVisible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    };
    const slides = [...document.querySelectorAll(".slide")];
    const controls = [...document.querySelectorAll(".controls,.control-layer,[data-controls],[data-role='controls']")]
      .filter(isVisible)
      .map((element) => ({ selector: element.className || element.id || element.tagName, rect: rect(element) }));
    const existingAuditStyle = document.querySelector("[data-geometry-audit-style]");
    if (!existingAuditStyle) {
      const style = document.createElement("style");
      style.dataset.geometryAuditStyle = "true";
      style.textContent = "*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}";
      document.head.appendChild(style);
    }
    const metrics = slides.map((slide, index) => {
      slides.forEach((item, current) => {
        item.classList.toggle("active", current === index);
        item.classList.toggle("past", current < index);
      });
      const stage = slide.querySelector(".slide-inner") || slide;
      const title = slide.querySelector(".title-slot,h1,h2");
      const support = slide.querySelector(".support-slot,.support,.lead");
      const content = slide.querySelector(".content-zone,.title-visual,.visual-zone,.diagram-zone,.source-zone") || stage;
      const slots = slotRects(stage);
      return {
        index: index + 1,
        role: slide.getAttribute("data-type") || slide.getAttribute("data-role") || "",
        geometry_role: slide.getAttribute("data-geometry-role") || "",
        rects: {
          stage: rect(stage),
          title: slots.title || rect(title),
          support: slots.support || rect(support),
          content: slots.content || rect(content)
        },
        element_rects: {
          title: rect(title),
          support: rect(support),
          content: rect(content)
        },
        content_overflow_y: content ? Math.max(0, content.scrollHeight - content.clientHeight) : 0
      };
    });
    return {
      viewport: { width: innerWidth, height: innerHeight },
      slide_count: slides.length,
      document_overflow_x: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      document_overflow_y: Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight),
      controls,
      slides: metrics
    };
  }).toString()})()`;
}

function intersect(a, b) {
  return Boolean(a && b && a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y);
}

function analyzeViewport(sample) {
  const findings = [];
  const coordinateDeltas = {};
  const slides = sample.slides;

  if (slides.length === 0) {
    findings.push({ level: "error", code: "no_slides", message: "No .slide elements found" });
    return { findings, coordinate_deltas: coordinateDeltas };
  }

  const required = ["stage", "title", "content"];
  for (const slide of slides) {
    for (const key of required) {
      if (!slide.rects[key]) {
        findings.push({ level: "error", code: `missing_${key}`, message: `Slide ${slide.index} is missing ${key} geometry` });
      }
    }
  }

  for (const key of ["stage", "title", "support", "content"]) {
    const baselineSlide = slides.find((slide) => slide.rects[key]);
    if (!baselineSlide) continue;
    const baseline = baselineSlide.rects[key];
    coordinateDeltas[key] = { max: 0, offenders: [] };
    for (const slide of slides) {
      const current = slide.rects[key];
      if (!current) continue;
      const delta = Math.max(
        Math.abs(current.x - baseline.x),
        Math.abs(current.y - baseline.y),
        Math.abs(current.width - baseline.width),
        Math.abs(current.height - baseline.height)
      );
      const roundedDelta = Math.round(delta * 100) / 100;
      coordinateDeltas[key].max = Math.max(coordinateDeltas[key].max, roundedDelta);
      if (roundedDelta > tolerance) {
        coordinateDeltas[key].offenders.push({ slide: slide.index, delta: roundedDelta });
      }
    }
    if (coordinateDeltas[key].offenders.length > 0) {
      findings.push({
        level: "error",
        code: `${key}_coordinate_delta`,
        message: `${key} coordinates differ by more than ${tolerance}px`,
        offenders: coordinateDeltas[key].offenders
      });
    }
  }

  if (sample.document_overflow_x > tolerance) {
    findings.push({ level: "error", code: "horizontal_overflow", message: `Document overflows horizontally by ${sample.document_overflow_x}px` });
  }
  if (sample.document_overflow_y > tolerance) {
    findings.push({ level: "error", code: "document_scroll", message: `Document scrolls vertically by ${sample.document_overflow_y}px; use internal content-zone scroll` });
  }

  for (const control of sample.controls) {
    for (const slide of slides) {
      for (const key of ["title", "support", "content"]) {
        if (intersect(control.rect, slide.rects[key])) {
          findings.push({
            level: "error",
            code: "controls_overlap_standard_layer",
            message: `Visible controls overlap ${key} on slide ${slide.index}`
          });
        }
      }
    }
  }

  return { findings, coordinate_deltas: coordinateDeltas };
}

async function audit() {
  const browser = await launchBrowser();
  let page;
  try {
    page = await newPage(browser.baseUrl);
    const { session } = page;
    await session.send("Page.enable");
    await session.send("Runtime.enable");
    const url = pathToFileURL(path.resolve(htmlFile)).href;
    const viewportReports = [];
    const findings = [];

    for (const viewport of viewports) {
      await session.send("Emulation.setDeviceMetricsOverride", {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.width < 600
      });
      await session.send("Page.navigate", { url });
      await waitReady(session);
      const sample = await evaluate(session, geometryExpression());
      const analysis = analyzeViewport(sample);
      viewportReports.push({ ...viewport, ...sample, ...analysis });
      findings.push(...analysis.findings.map((finding) => ({ viewport: viewport.name, ...finding })));
    }

    const internalScrollSlides = [...new Set(viewportReports.flatMap((report) =>
      report.slides.filter((slide) => slide.content_overflow_y > tolerance).map((slide) => slide.index)
    ))].sort((a, b) => a - b);
    const report = {
      passed: findings.every((finding) => finding.level !== "error"),
      slide_count: viewportReports[0]?.slide_count ?? 0,
      tolerance_px: tolerance,
      viewports: viewportReports.map((reportItem) => ({
        name: reportItem.name,
        width: reportItem.width,
        height: reportItem.height,
        coordinate_deltas: reportItem.coordinate_deltas,
        horizontal_overflow: reportItem.document_overflow_x,
        document_overflow_y: reportItem.document_overflow_y,
        controls_count: reportItem.controls.length
      })),
      internal_scroll_slides: internalScrollSlides,
      findings
    };
    if (outFile) {
      fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2) + "\n", "utf8");
    }
    console.log(JSON.stringify({
      passed: report.passed,
      slide_count: report.slide_count,
      internal_scroll_slides: report.internal_scroll_slides,
      findings: report.findings
    }, null, 2));
    process.exit(report.passed ? 0 : 1);
  } finally {
    page?.session?.close();
    await browser.close();
  }
}

audit().catch((error) => {
  console.error(error.message || String(error));
  process.exit(2);
});
