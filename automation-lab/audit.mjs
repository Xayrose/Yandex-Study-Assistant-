import { chromium } from "playwright";
import fs from "node:fs/promises";

const base = process.env.LAB_URL ?? "http://127.0.0.1:4173";
const outDir = "artifacts";
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const report = { target: base, generatedAt: new Date().toISOString(), pages: [], note: "Synthetic lab only; does not enter, select, drag, connect, or submit answers." };

try {
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const inventory = await page.evaluate(() => {
    const visible = el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const elements = [...document.querySelectorAll("input,textarea,select,button,[role],a,[draggable='true'],canvas,svg")];
    return elements.filter(visible).map((el, index) => ({
      index,
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      type: el.getAttribute("type"),
      label: (el.getAttribute("aria-label") || el.innerText || el.value || el.getAttribute("placeholder") || "").trim().slice(0, 120),
      draggable: el.getAttribute("draggable") === "true",
      bounds: (() => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }; })()
    }));
  });
  await page.screenshot({ path: `${outDir}/page.png`, fullPage: true });
  report.pages.push({ url: page.url(), title: await page.title(), inventory, counts: {
    total: inventory.length,
    textFields: inventory.filter(e => ["input","textarea"].includes(e.tag) && !["checkbox","radio"].includes(e.type)).length,
    selectable: inventory.filter(e => ["select","checkbox","radio"].includes(e.tag) || ["checkbox","radio"].includes(e.type)).length,
    buttons: inventory.filter(e => e.tag === "button").length,
    draggable: inventory.filter(e => e.draggable).length,
    graphics: inventory.filter(e => ["canvas","svg"].includes(e.tag)).length
  }});
  await fs.writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
