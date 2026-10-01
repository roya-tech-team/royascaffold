#!/usr/bin/env node
// RoyaScaff smoke check for a web app (engine 1.4, step 12c · WP-C5).
// Installed by `royascaff smoke init`; run by `royascaff check` as the app's Smoke command.
//
// What it does, in a real browser (Playwright Chromium):
//   1. serves the built app (SERVE below; set ROYASCAFF_SERVE="" when URL is already served);
//   2. opens it at 1440×900, 1024×768 and 430×932 and saves one screenshot per size;
//   3. fails on any console error or uncaught page error;
//   4. at the first size, clicks every visible button and fails, by name, when a click changes
//      nothing on screen (fewer than 50 pixels differ); saves one screenshot after each click;
//   5. with the web-3d adapter (the runner sets ROYASCAFF_ADAPTERS): samples frames for 3 s and fails
//      below the fps floor, fails on a blank canvas, saves a close-up after clicking the canvas centre;
//   6. prints a JSON summary. Screenshots go to $ROYASCAFF_SHOTS (the runner sets it).
//
// Needs: npm i -D playwright && npx playwright install chromium

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SERVE = process.env.ROYASCAFF_SERVE ?? "npx vite preview --port 4173 --strictPort";
const URL = process.env.ROYASCAFF_URL || "http://localhost:4173/";
const SIZES = [[1440, 900], [1024, 768], [430, 932]];
const SHOTS = process.env.ROYASCAFF_SHOTS || path.resolve("smoke-shots");
const CONTROLS = "button, [role=button], input[type=button], input[type=submit]";
const SETTLE_MS = Number(process.env.ROYASCAFF_SETTLE_MS || 600);

const MIN_PIXELS = Number(process.env.ROYASCAFF_MIN_PIXELS || 50); // pixels that must change for a click to count

const WEB_3D = String(process.env.ROYASCAFF_ADAPTERS || "").split(",").map((x) => x.trim()).includes("web-3d");
const FPS_MIN = Number(process.env.ROYASCAFF_FPS_MIN || 30);
// Controls a person accepted as "no visible change" (- **Smoke ignore:** on the APP record).
const IGNORE = String(process.env.ROYASCAFF_SMOKE_IGNORE || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);

const summary = { url: URL, shots: [], errors: [], controls: [], pass: false };
const done = (code) => {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(code);
};

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  summary.errors.push("Playwright is missing: npm i -D playwright && npx playwright install chromium");
  done(1);
}

async function waitFor(url, ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

let server = null;
if (SERVE && /^https?:/.test(URL)) {
  server = spawn(SERVE, { shell: true, stdio: "ignore", detached: process.platform !== "win32" });
  if (!(await waitFor(URL, 30000))) {
    summary.errors.push(`the app did not answer at ${URL} within 30s (server: ${SERVE})`);
    stop();
    done(1);
  }
}
function stop() {
  if (!server) return;
  try {
    if (process.platform === "win32") server.kill();
    else process.kill(-server.pid);
  } catch {}
}

fs.mkdirSync(SHOTS, { recursive: true });
const save = (name, buffer) => {
  const file = path.join(SHOTS, name);
  fs.writeFileSync(file, buffer);
  summary.shots.push(name);
};
const slug = (s) => String(s || "control").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "control";

// Pixels that differ between two PNG screenshots, measured in a blank page of the browser
// (tiny differences such as a caret or an anti-aliasing seam do not count as a change).
let differ = null;
async function changedPixels(a, b) {
  if (a.equals(b)) return 0;
  return differ.evaluate(async ([x, y]) => {
    const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = `data:image/png;base64,${src}`; });
    const [ia, ib] = await Promise.all([load(x), load(y)]);
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const px = (img) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h).data; };
    const da = px(ia), db = px(ib);
    let n = 0;
    for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 24) n += 1;
    return n;
  }, [a.toString("base64"), b.toString("base64")]);
}

// web-3d: frame rate, a canvas that shows something, and a close-up after clicking its centre.
async function check3d(page) {
  const canvas = await page.evaluateHandle(() => [...document.querySelectorAll("canvas")].sort((a, b) => b.width * b.height - a.width * a.height)[0] || null);
  if (!(await canvas.evaluate((c) => Boolean(c)))) {
    summary.errors.push("web-3d: no canvas on the page");
    return;
  }
  const fps = await page.evaluate(() => new Promise((done) => {
    let frames = 0;
    const start = performance.now();
    const tick = (t) => {
      frames += 1;
      if (t - start >= 3000) done(Math.round((frames * 1000) / (t - start)));
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
  summary.fps = fps;
  if (fps < FPS_MIN) summary.errors.push(`web-3d: ${fps} fps over 3 s, below the floor of ${FPS_MIN}`);
  const shot = await canvas.asElement().screenshot();
  const lit = await differ.evaluate(async (src) => {
    const i = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = `data:image/png;base64,${src}`; });
    const c = document.createElement("canvas"); c.width = i.width; c.height = i.height;
    const g = c.getContext("2d"); g.drawImage(i, 0, 0);
    const d = g.getImageData(0, 0, i.width, i.height).data;
    let n = 0;
    for (let k = 0; k < d.length; k += 4) if (Math.abs(d[k] - d[0]) + Math.abs(d[k + 1] - d[1]) + Math.abs(d[k + 2] - d[2]) > 24) n += 1;
    return n / (i.width * i.height);
  }, shot.toString("base64"));
  summary.canvasLit = Math.round(lit * 10000) / 100;
  if (lit < 0.001) summary.errors.push("web-3d: the canvas is blank (one flat color)");
  const box = await canvas.asElement().boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(SETTLE_MS);
    save("3d-closeup.png", await page.screenshot());
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForTimeout(SETTLE_MS);
  }
}

let browser;
try {
  browser = await chromium.launch();
  differ = await browser.newPage();
  for (const [i, [width, height]] of SIZES.entries()) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on("console", (m) => { if (m.type() === "error") summary.errors.push(`console error at ${width}×${height}: ${m.text()}`); });
    page.on("pageerror", (e) => summary.errors.push(`page error at ${width}×${height}: ${e.message}`));
    await page.goto(URL, { waitUntil: "load" });
    await page.waitForTimeout(SETTLE_MS);
    save(`view-${width}x${height}.png`, await page.screenshot());
    if (i === 0 && WEB_3D) await check3d(page);
    if (i === 0) {
      const handles = await page.$$(CONTROLS);
      let n = 0;
      for (const h of handles) {
        if (!(await h.isVisible()) || (await h.isDisabled().catch(() => false))) continue;
        n += 1;
        const name = ((await h.getAttribute("aria-label")) || (await h.innerText().catch(() => "")) || (await h.getAttribute("value")) || `control ${n}`).trim().slice(0, 60);
        const rest = async () => {
          // Hover and focus styles are not a change: move the mouse away and blur before each shot.
          await page.mouse.move(0, 0);
          await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
        };
        await rest();
        if (IGNORE.includes(name.toLowerCase())) {
          summary.controls.push({ name, ignored: true });
          continue;
        }
        const before = await page.screenshot();
        await h.click({ timeout: 3000 }).catch((e) => summary.errors.push(`could not click "${name}": ${e.message.split("\n")[0]}`));
        await rest();
        await page.waitForTimeout(SETTLE_MS);
        const after = await page.screenshot();
        const pixels = await changedPixels(before, after);
        const changed = pixels >= MIN_PIXELS;
        summary.controls.push({ name, changed, pixels });
        save(`control-${String(n).padStart(2, "0")}-${slug(name)}.png`, after);
        if (!changed) summary.errors.push(`the control "${name}" changed nothing on screen`);
      }
    }
    await page.close();
  }
} catch (e) {
  summary.errors.push(`smoke run failed: ${e.message.split("\n")[0]}`);
} finally {
  if (browser) await browser.close().catch(() => {});
  stop();
}
summary.pass = summary.errors.length === 0;
done(summary.pass ? 0 : 1);
