"use strict";

// Step 12c · WP-C7 (P9): content and dependency checks, run with the full `check`.
//   unused dependencies  package.json `dependencies` never imported under the app → the check fails
//   placeholder content  "lorem ipsum", "TODO", "coming soon", … counted → a warning with the evidence

const fs = require("fs");
const path = require("path");

const SKIP = new Set(["node_modules", ".git", "dist", "build", "coverage", ".next", ".cache", "out", "vendor", "scripts"]);
const CODE = /\.(?:[cm]?[jt]sx?|vue|svelte|astro|html|css|scss|sass|less)$/i;
const DATA = /\.(?:json|ya?ml|md|csv)$/i;
const TEST = /(\.test\.|\.spec\.)|(^|\/)__tests__\//;

function walk(dir, rel, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP.has(e.name) || (e.name.startsWith(".") && e.isDirectory())) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), r, out);
    else if (e.isFile() && (CODE.test(e.name) || DATA.test(e.name)) && !/^package(-lock)?\.json$/.test(r) && !/lock\.(json|ya?ml)$/.test(e.name)) out.push(r);
  }
}

// The package a module specifier names ("@a/b/c" → "@a/b", "three/examples/x" → "three").
function packageOf(spec) {
  if (!spec || /^[./]|^node:|^[a-z]+:\/\//i.test(spec) || spec.startsWith("~/") || spec.startsWith("#")) return null;
  const parts = spec.replace(/^~/, "").split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function importsIn(text) {
  const out = new Set();
  const res = [
    /\bfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /@(?:import|use|forward)\s+(?:url\()?['"]([^'"]+)['"]/g,
  ];
  for (const re of res) for (const m of text.matchAll(re)) {
    const p = packageOf(m[1]);
    if (p) out.add(p);
  }
  if (/@tailwind\s+(base|components|utilities)/.test(text)) out.add("tailwindcss");
  return out;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

const listField = (value) => String(value || "").split(/[,\s]+/).map((x) => x.replace(/`/g, "").trim()).filter(Boolean);

// Dependencies of an app that nothing under the app imports. `- **Unused ok:** a, b` on the APP-
// record accepts some on purpose; a package named in an npm script counts as used.
function unusedDependencies(model, app) {
  const base = path.join(model.repo, app.path || ".");
  const pkg = readJson(path.join(base, "package.json"));
  if (!pkg || !pkg.dependencies) return null;
  const files = [];
  walk(base, "", files);
  const used = new Set();
  for (const f of files) {
    if (!CODE.test(f) && !/config\.[cm]?[jt]s$/.test(f)) continue;
    let text = "";
    try {
      text = fs.readFileSync(path.join(base, f), "utf8");
    } catch {
      continue;
    }
    for (const p of importsIn(text)) used.add(p);
  }
  const scripts = Object.values(pkg.scripts || {}).join(" ");
  const rec = model.records.get(app.id);
  const ok = new Set(listField(rec && rec.fields["Unused ok"]));
  const unused = Object.keys(pkg.dependencies).filter((d) => !used.has(d) && !ok.has(d) && !d.startsWith("@types/") && !new RegExp(`(^|[\\s/])${d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(scripts));
  return { unused, accepted: [...ok].filter((d) => d in pkg.dependencies) };
}

const PLACEHOLDERS = [
  ["lorem ipsum", /lorem ipsum/gi],
  ["TODO", /\bTODO\b/g],
  ["coming soon", /coming soon/gi],
  ["no description yet", /no description (yet|available)/gi],
  ["placeholder", /(?<![-:.\w])placeholder(?!\s*[=:(]|-|\w)/gi],
];

// Placeholder strings in the app's source and data files (tests excluded).
function placeholders(model, app) {
  const base = path.join(model.repo, app.path || ".");
  const files = [];
  walk(base, "", files);
  const counts = new Map();
  for (const f of files) {
    if (TEST.test(f)) continue;
    let text = "";
    try {
      text = fs.readFileSync(path.join(base, f), "utf8");
    } catch {
      continue;
    }
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
  for (const app of apps) {
    const deps = unusedDependencies(model, app);
    if (deps) {
      const pass = deps.unused.length === 0;
      results.push({ app: app.id, kind: "Deps", command: "royascaff: dependencies imported", cwd: app.path || ".", exit: pass ? 0 : 1, ms: 0, pass, timedOut: false, tail: pass ? "" : `${deps.unused.join(", ")} ${deps.unused.length === 1 ? "is" : "are"} installed and never imported. Remove ${deps.unused.length === 1 ? "it" : "them"}, or accept on purpose with - **Unused ok:** in ${app.id}` });
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

module.exports = { packageOf, importsIn, unusedDependencies, placeholders, contentChecks, placeholderLine };
