"use strict";

// Content and dependency checks, run with the full `check` (step 12c WP-C7; beta.4 WP-D4 moved every
// technology detail into the adapters' manifests).
//   unused dependencies  the adapter's `deps` manifest names the package file, its dependency fields,
//                        the import patterns and how a specifier names a package → unused ones fail
//   placeholder content  "lorem ipsum", "TODO", "coming soon", … in any text file → a warning

const fs = require("fs");
const path = require("path");

// Folders never scanned: dependencies, builds and caches of any stack.
const SKIP = new Set([".git", "node_modules", "vendor", "dist", "build", "out", "target", "coverage", ".next", ".cache", "__pycache__", ".venv", "venv", "bin", "obj"]);
const TEXT = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|html?|css|scss|sass|less|py|rb|go|rs|java|kt|kts|swift|dart|cs|php|ex|exs|json|ya?ml|toml|md|csv|txt)$/i;
const GENERIC_TEST = /(^|\/)(tests?|__tests__|spec)\/|[._-](test|spec)\.[a-z]+$/i;
const LOCK = /(^|\/)[^/]*lock[^/]*\.(json|ya?ml|toml)$|\.lock$/i;

function walk(dir, rel, out, skip = SKIP) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (skip.has(e.name) || (e.name.startsWith(".") && e.isDirectory())) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), r, out, skip);
    else if (e.isFile()) out.push(r);
  }
}

const read = (file) => {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
};

// The package a specifier names, by the manifest's rule (skip pattern, separator, scope prefix).
function packageOf(spec, deps) {
  const s = deps.specifier || {};
  if (!spec || (s.skip && new RegExp(s.skip, "i").test(spec))) return null;
  const parts = spec.split(s.separator || "/");
  return s.scopePrefix && spec.startsWith(s.scopePrefix) ? parts.slice(0, 2).join(s.separator || "/") : parts[0];
}

function importsIn(text, deps) {
  const out = new Set();
  for (const src of deps.imports || []) for (const m of text.matchAll(new RegExp(src, "g"))) {
    const p = packageOf(m[1], deps);
    if (p) out.add(p);
  }
  for (const imp of deps.implicit || []) if (new RegExp(imp.pattern).test(text)) out.add(imp.package);
  return out;
}

const listField = (value) => String(value || "").split(/[,\s]+/).map((x) => x.replace(/`/g, "").trim()).filter(Boolean);
const escape = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Dependencies of an app that nothing under the app imports. `- **Unused ok:** a, b` on the APP-
// record accepts some on purpose; a package named in a script counts as used.
function unusedDependencies(model, app, deps = require("./adapters.cjs").policy(model).deps) {
  if (!deps) return null;
  const base = path.join(model.repo, app.path || ".");
  let pkg = null;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(base, deps.manifest), "utf8"));
  } catch {
    return null;
  }
  const declared = Object.assign({}, ...(deps.fields || []).map((f) => pkg[f] || {}));
  if (!Object.keys(declared).length) return null;
  const files = [];
  walk(base, "", files, new Set([...SKIP, ...(deps.skipFolders || [])]));
  const source = new RegExp(deps.sourceFiles || "$^", "i");
  const used = new Set();
  for (const f of files) if (source.test(f)) for (const p of importsIn(read(path.join(base, f)), deps)) used.add(p);
  const scripts = deps.scriptsField ? Object.values(pkg[deps.scriptsField] || {}).join(" ") : "";
  const rec = model.records.get(app.id);
  const ok = new Set(listField(rec && rec.fields["Unused ok"]));
  const ignore = (deps.ignore || []).map((x) => new RegExp(x));
  const unused = Object.keys(declared).filter((d) => !used.has(d) && !ok.has(d) && !ignore.some((re) => re.test(d)) && !new RegExp(`(^|[\\s/])${escape(d)}(\\s|$)`).test(scripts));
  return { unused, accepted: [...ok].filter((d) => d in declared) };
}

const PLACEHOLDERS = [
  ["lorem ipsum", /lorem ipsum/gi],
  ["TODO", /\bTODO\b/g],
  ["coming soon", /coming soon/gi],
  ["no description yet", /no description (yet|available)/gi],
  ["placeholder", /(?<![-:.\w])placeholder(?!\s*[=:(]|-|\w)/gi],
];

// Placeholder strings in the app's text files (tests, lockfiles and the package file excluded).
function placeholders(model, app) {
  const pol = require("./adapters.cjs").policy(model);
  const testRes = pol.tests ? pol.tests.files.map((x) => new RegExp(x)) : [GENERIC_TEST];
  const base = path.join(model.repo, app.path || ".");
  const files = [];
  walk(base, "", files, new Set([...SKIP, ...((pol.deps && pol.deps.skipFolders) || [])]));
  const counts = new Map();
  for (const f of files) {
    if (!TEXT.test(f) || LOCK.test(f) || testRes.some((re) => re.test(f)) || (pol.deps && f === pol.deps.manifest)) continue;
    const text = read(path.join(base, f));
    for (const [label, re] of PLACEHOLDERS) {
      const n = (text.match(re) || []).length;
      if (!n) continue;
      const c = counts.get(label) || { label, count: 0, files: [] };
      c.count += n;
      c.files.push(path.posix.join(app.path || ".", f));
      counts.set(label, c);
    }
  }
  return [...counts.values()];
}

// The full check's content results for the apps it ran: a failing "Deps" result per app with unused
// dependencies, and the placeholder counts (a warning).
function contentChecks(model, apps) {
  const results = [];
  const found = [];
  const deps = require("./adapters.cjs").policy(model).deps;
  for (const app of apps) {
    const u = unusedDependencies(model, app, deps);
    if (u) {
      const pass = u.unused.length === 0;
      results.push({ app: app.id, kind: "Deps", command: "royascaff: dependencies imported", cwd: app.path || ".", exit: pass ? 0 : 1, ms: 0, pass, timedOut: false, tail: pass ? "" : `${u.unused.join(", ")} ${u.unused.length === 1 ? "is" : "are"} installed and never imported. Remove ${u.unused.length === 1 ? "it" : "them"}, or accept on purpose with - **Unused ok:** in ${app.id}` });
    }
    for (const p of placeholders(model, app)) {
      const same = found.find((x) => x.label === p.label);
      if (same) { same.count += p.count; same.files.push(...p.files); } else found.push(p);
    }
  }
  const order = PLACEHOLDERS.map(([label]) => label);
  found.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  for (const p of found) p.files = [...new Set(p.files)].sort();
  return { results, placeholders: found };
}

const placeholderLine = (list) => list.map((p) => `${p.label} ×${p.count} (${p.files.slice(0, 3).join(", ")}${p.files.length > 3 ? ", …" : ""})`).join(" · ");

module.exports = { packageOf, importsIn, unusedDependencies, placeholders, contentChecks, placeholderLine, walk, SKIP };
