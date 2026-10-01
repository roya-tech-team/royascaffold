"use strict";

// Step 12c · WP-C5 (P6, P7): the app in a real browser (smoke check with screenshots) and the
// person's visual bar.

const fs = require("fs");
const path = require("path");

const IMAGE = /\.(png|jpe?g|webp)$/i;

// The smoke definition of the project's adapters (template, script, command, env), or null.
function smokePolicy(model) {
  return require("./adapters.cjs").policy(model).smoke;
}

// The project's adapters ask for a visual bar and a person's look (browser UIs do).
function visualBarRequired(model) {
  return require("./adapters.cjs").policy(model).visualBar;
}

// Sets `- **Smoke:** <command>` on the APP- record in profile.md.
function setAppField(text, appId, key, value) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => new RegExp(`^###\\s+${appId}\\b`).test(l));
  if (start < 0) throw new Error(`${appId} is not in profile.md`);
  let end = start + 1;
  while (end < lines.length && !/^#{1,3}\s/.test(lines[end])) end += 1;
  const field = new RegExp(`^- \\*\\*${key}:\\*\\*`);
  const at = lines.slice(start, end).findIndex((l) => field.test(l));
  if (at >= 0) lines[start + at] = `- **${key}:** ${value}`;
  else {
    let last = start;
    for (let i = start + 1; i < end; i += 1) if (/^- \*\*[^*]+:\*\*/.test(lines[i])) last = i;
    lines.splice(last + 1, 0, `- **${key}:** ${value}`);
  }
  return lines.join("\n");
}

// royascaff smoke init [--app APP-…]: copy the template into the app and set its Smoke command.
function smokeInit(start, flags = {}) {
  const { buildModel } = require("./model/graph.cjs");
  const runner = require("./runner.cjs");
  const model = buildModel(start);
  const apps = runner.appsOf(model);
  if (!apps.length) throw new Error("No APP- record in project/profile.md: add the app first");
  const app = flags.app ? apps.find((a) => a.id === flags.app) : apps.length === 1 ? apps[0] : apps.find((a) => /WEB/.test(a.id));
  if (!app) throw new Error(flags.app ? `${flags.app} is not an app in profile.md` : `Several apps: name one with --app ${apps.map((a) => a.id).join("|")}`);
  const sp = smokePolicy(model);
  if (!sp) throw new Error("No adapter in profile.md declares a smoke check (see the adapters' manifests)");
  const dir = path.join(model.repo, app.path || ".");
  const file = path.join(dir, sp.script);
  const existed = fs.existsSync(file);
  if (!existed || flags.force) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.copyFileSync(sp.template, file);
  }
  const profile = path.join(model.root, "profile.md");
  fs.writeFileSync(profile, setAppField(fs.readFileSync(profile, "utf8"), app.id, "Smoke", sp.command));
  let installed = !sp.installCheck;
  try {
    if (sp.installCheck) {
      require.resolve(sp.installCheck, { paths: [dir] });
      installed = true;
    }
  } catch {}
  return { app: app.id, file: path.relative(model.repo, file), kept: existed && !flags.force, command: sp.command, installed, install: installed ? null : sp.install || null };
}

// Screenshots written for an evidence record (paths relative to the evidence folder).
function shotsIn(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => IMAGE.test(f)).sort();
  } catch {
    return [];
  }
}

// The latest screenshots of a change: from its newest evidence record that has them.
function latestShots(model, change) {
  const ev = [...model.evidence.values()].filter((e) => e.change === change.id).sort((a, b) => b.id.localeCompare(a.id));
  for (const e of ev) {
    const dir = path.join(model.root, change.dir, "evidence", "shots", e.id);
    const shots = shotsIn(dir);
    if (shots.length) return shots.map((s) => path.posix.join("project", change.dir, "evidence", "shots", e.id, s));
  }
  return [];
}

// --bar all | 1,2,4 → { note, gaps } against a bar of n lines.
function parseBar(value, n) {
  const v = String(value === true ? "" : value || "").trim().toLowerCase();
  if (!v) return null;
  if (v === "all") return { passed: [...Array(n).keys()].map((i) => i + 1), gaps: [] };
  if (v === "none") return { passed: [], gaps: [...Array(n).keys()].map((i) => i + 1) };
  const nums = v.split(/[\s,]+/).filter(Boolean).map(Number);
  const bad = nums.filter((x) => !Number.isInteger(x) || x < 1 || x > n);
  if (bad.length) throw new Error(`--bar takes "all", "none" or line numbers 1–${n} of the visual bar (got ${value})`);
  const passed = [...new Set(nums)].sort((a, b) => a - b);
  return { passed, gaps: [...Array(n).keys()].map((i) => i + 1).filter((i) => !passed.includes(i)) };
}

// Visual-bar gaps a person recorded on changes: Map changeId → [numbers] (the last look counts).
function barGaps(change) {
  const { isHuman } = require("./approvals.cjs");
  const looks = (change.events || []).filter((e) => e.event === "check.run" && isHuman(e.by) && /^pass\b/i.test(e.note || "") && /· bar:/.test(e.note || ""));
  const last = looks[looks.length - 1];
  if (!last) return null;
  const m = (last.note || "").match(/^pass with gaps ([\d, ]+):/);
  return m ? m[1].split(/[\s,]+/).filter(Boolean).map(Number) : [];
}

module.exports = { smokeInit, setAppField, shotsIn, latestShots, parseBar, barGaps, smokePolicy, visualBarRequired };
