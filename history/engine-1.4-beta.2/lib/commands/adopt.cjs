"use strict";

// `adopt` (plan file 10 C5, file 11 WP7): the modules of each app and how much of each is owned by
// a component (`Code:` globs). It drives adoption of an existing code base one module at a time,
// and `next` proposes the first module that is not fully owned.

const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { listFiles, SOURCE_EXTENSIONS } = require("../files.cjs");
const { patternList, matchesAny } = require("../glob.cjs");

const WRAPPERS = new Set(["src", "app", "lib", "source", "packages"]);

// A module is the first folder below the app (or below src/, app/, lib/ when the app wraps its code).
function moduleOf(appPath, file) {
  const rel = appPath && appPath !== "." ? file.slice(appPath.length + 1) : file;
  const parts = rel.split("/");
  if (parts.length === 1) return appPath && appPath !== "." ? `${appPath} (root files)` : "(root files)";
  const head = WRAPPERS.has(parts[0]) && parts.length > 2 ? `${parts[0]}/${parts[1]}` : parts[0];
  return appPath && appPath !== "." ? `${appPath}/${head}` : head;
}

function adoption(model) {
  const globs = [...model.records.values()].filter((r) => r.kind === "component").flatMap((r) => patternList(r.fields.Code));
  const exclude = patternList(model.profile.code_exclude);
  const apps = [...model.records.values()].filter((r) => r.kind === "app" && r.fields.Path);
  const modules = new Map();
  for (const app of apps) {
    const base = String(app.fields.Path).replace(/`/g, "").trim().replace(/\/+$/, "") || ".";
    const projectRel = path.relative(model.repo, model.root).split(path.sep).join("/");
    const files = listFiles(model.repo, base === "." ? "" : base).filter((f) => SOURCE_EXTENSIONS.includes(path.extname(f)) && !matchesAny(f, exclude) && !(projectRel && f.startsWith(`${projectRel}/`)));
    for (const f of files) {
      const m = moduleOf(base, f);
      if (!modules.has(m)) modules.set(m, { module: m, app: app.id, files: 0, owned: 0, unowned: [] });
      const e = modules.get(m);
      e.files += 1;
      if (matchesAny(f, globs)) e.owned += 1;
      else e.unowned.push(f);
    }
  }
  const list = [...modules.values()].sort((a, b) => a.module.localeCompare(b.module));
  const files = list.reduce((n, m) => n + m.files, 0);
  const owned = list.reduce((n, m) => n + m.owned, 0);
  return { modules: list.map((m) => ({ ...m, percent: m.files ? Math.round((m.owned / m.files) * 100) : 100 })), files, owned, percent: files ? Math.round((owned / files) * 100) : 100 };
}

function adoptCommand(start) {
  const model = buildModel(start);
  const a = adoption(model);
  const lines = [`Code owned by components: ${a.owned}/${a.files} source file(s) (${a.percent}%)`];
  for (const m of a.modules) lines.push(`  ${m.percent === 100 ? "✓" : "·"} ${m.module.padEnd(40)} ${String(m.owned).padStart(4)}/${String(m.files).padEnd(4)} ${String(m.percent).padStart(3)}%`);
  const next = a.modules.find((m) => m.percent < 100);
  lines.push(next ? `Next: adopt ${next.module} (${next.files - next.owned} file(s) without a component) — see cards/adopt.md` : "Every module is owned by a component.");
  return { ...a, next: next ? next.module : null, text: lines.join("\n") };
}

module.exports = { adoption, adoptCommand, moduleOf };
