"use strict";

// `royascaff scan [module]` (plan file 01 §6, E3.2): facts about each module of the code, for the AI to
// start from when it adopts existing code. The core reads files and applies patterns; which patterns
// (imports, exports, routes, …) and which files count as schema, config or tests comes from the
// adapters' `scan` declarations, so the core knows no language. Facts are cached per file by the
// content hash git uses for a blob, so a second scan reads only what changed.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { buildModel } = require("./model/graph.cjs");
const { listFiles } = require("./files.cjs");
const { moduleOf } = require("./commands/adopt.cjs");
const { toPosix } = require("./project.cjs");
const adapters = require("./adapters.cjs");

const CACHE_VERSION = 1;
const MAX_FACTS_PER_FILE = 100;
const MAX_FACTS_PER_MODULE = 200;
const MAX_FILES_DETAIL = 100;
const MAX_BYTES = 1024 * 1024; // larger files are counted but not read

const fail = (code, message) => Object.assign(new Error(message), { code });

// The same hash `git hash-object` gives a file, so it can be compared with a git blob.
function blobHash(buf) {
  return crypto.createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");
}

function compile(spec) {
  const items = (spec.patterns || {});
  const out = {};
  for (const [name, list] of Object.entries(items)) {
    out[name] = list.map((p) => {
      const one = typeof p === "string" ? { pattern: p } : p;
      return { re: new RegExp(one.pattern, "gm"), split: one.split || null };
    });
  }
  return out;
}

// The facts of one file's text: { name: [values] }.
function factsOf(text, compiled) {
  const facts = {};
  for (const [name, rules] of Object.entries(compiled)) {
    const seen = new Set();
    for (const { re, split } of rules) {
      re.lastIndex = 0;
      for (const m of text.matchAll(re)) {
        const raw = m[1] !== undefined ? m[1] : m[0];
        const values = split ? String(raw).split(split).map((v) => (v.trim().match(/^[\w$.-]+/) || [""])[0]).filter(Boolean) : [String(raw).trim()];
        for (const v of values) if (v) seen.add(v);
        if (seen.size >= MAX_FACTS_PER_FILE) break;
      }
    }
    if (seen.size) facts[name] = [...seen].slice(0, MAX_FACTS_PER_FILE);
  }
  return facts;
}

const regexes = (list) => (list || []).map((x) => new RegExp(x));

function loadCache(file) {
  try {
    const c = JSON.parse(fs.readFileSync(file, "utf8"));
    return c && c.version === CACHE_VERSION && c.entries ? c : { version: CACHE_VERSION, entries: {} };
  } catch {
    return { version: CACHE_VERSION, entries: {} };
  }
}

// scan [module]: every module of every app, or the one named (its folder, its last folder name or a part of it).
function scanCommand(start, moduleName, flags = {}) {
  const model = buildModel(start);
  const policy = adapters.policy(model);
  const spec = policy.scan || { extensions: [], patterns: {} };
  const compiled = compile(spec);
  const extensions = new Set((spec.extensions || []).map((e) => e.toLowerCase()));
  const schemaRes = regexes(spec.schemaFiles);
  const configRes = regexes(spec.configFiles);
  const testRes = regexes(spec.testFiles && spec.testFiles.length ? spec.testFiles : (policy.tests && policy.tests.files) || []);
  const signature = crypto.createHash("sha1").update(JSON.stringify({ e: [...extensions], p: spec.patterns || {} })).digest("hex").slice(0, 12);
  const projectRel = toPosix(path.relative(model.repo, model.root));
  const cacheFile = path.join(model.root, ".cache", "scan.json");
  const cache = loadCache(cacheFile);
  const used = new Set();
  const stats = { hits: 0, misses: 0 };

  const apps = [...model.records.values()].filter((r) => r.kind === "app" && r.fields.Path);
  if (!apps.length) throw fail("INVALID_INPUT", "No APP- record with a Path in project/profile.md: there is no code to scan");
  const modules = new Map();
  for (const app of apps) {
    const base = String(app.fields.Path).replace(/`/g, "").trim().replace(/\/+$/, "") || ".";
    for (const f of listFiles(model.repo, base === "." ? "" : base)) {
      if (projectRel && (f === projectRel || f.startsWith(`${projectRel}/`))) continue;
      const m = moduleOf(base, f);
      if (!modules.has(m)) modules.set(m, { module: m, app: app.id, files: [] });
      modules.get(m).files.push(f);
    }
  }
  let picked = [...modules.values()].sort((a, b) => a.module.localeCompare(b.module));
  if (moduleName) {
    const want = String(moduleName).replace(/\/+$/, "");
    picked = picked.filter((m) => m.module === want || m.module.endsWith(`/${want}`) || m.module.startsWith(`${want}/`));
    if (!picked.length) throw fail("UNKNOWN_ID", `${moduleName} is not a module here (modules: ${[...modules.keys()].sort().join(", ") || "none"})`);
  }

  const out = picked.map((m) => {
    const detail = [];
    const agg = {};
    const schemaFiles = [];
    const configFiles = [];
    const testFiles = [];
    const sizes = [];
    let lines = 0;
    for (const f of m.files) {
      const abs = path.join(model.repo, f);
      let buf;
      try {
        buf = fs.readFileSync(abs);
      } catch {
        continue;
      }
      const readable = buf.length <= MAX_BYTES && !buf.includes(0);
      let n = 0;
      let facts = {};
      if (readable) {
        const reads = extensions.has(path.extname(f).toLowerCase());
        const key = `${signature}:${reads ? "s" : "n"}:${blobHash(buf)}`;
        used.add(key);
        if (cache.entries[key]) {
          stats.hits += 1;
          n = cache.entries[key].lines;
          facts = cache.entries[key].facts;
        } else {
          stats.misses += 1;
          const text = buf.toString("utf8");
          n = text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
          facts = reads ? factsOf(text, compiled) : {};
          cache.entries[key] = { lines: n, facts };
        }
      }
      lines += n;
      sizes.push({ path: f, lines: n });
      for (const [name, values] of Object.entries(facts)) {
        agg[name] = agg[name] || new Set();
        for (const v of values) agg[name].add(v);
      }
      if (Object.keys(facts).length) detail.push({ path: f, lines: n, facts });
      if (schemaRes.some((re) => re.test(f))) schemaFiles.push(f);
      if (configRes.some((re) => re.test(f))) configFiles.push(f);
      if (testRes.some((re) => re.test(f))) testFiles.push(f);
    }
    return {
      module: m.module,
      app: m.app,
      files: m.files.length,
      lines,
      facts: Object.fromEntries(Object.entries(agg).map(([k, v]) => [k, [...v].sort().slice(0, MAX_FACTS_PER_MODULE)])),
      schema_files: schemaFiles,
      config_files: configFiles,
      test_files: testFiles,
      largest: sizes.sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path)).slice(0, 5),
      details: detail.slice(0, MAX_FILES_DETAIL),
    };
  });

  // Keep the cache to what this scan used plus what other scans left, and write it only when something new was read.
  if (stats.misses) {
    const keys = Object.keys(cache.entries);
    if (keys.length > 20000) for (const k of keys.filter((x) => !used.has(x)).slice(0, keys.length - 20000)) delete cache.entries[k];
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(cache));
  }
  const text = out.length
    ? out.map((m) => `${m.module}: ${m.files} file(s), ${m.lines} line(s); ${Object.entries(m.facts).map(([k, v]) => `${v.length} ${k}`).join(", ") || "no pattern facts"}${m.schema_files.length ? `; schema ${m.schema_files.length}` : ""}${m.config_files.length ? `; config ${m.config_files.length}` : ""}${m.test_files.length ? `; tests ${m.test_files.length}` : ""}`).join("\n")
    : "No modules.";
  return { adapters: policy.adapters, patterns: Object.keys(spec.patterns || {}), cache: stats, modules: out, text };
}

module.exports = { scanCommand, factsOf, blobHash, compile };
