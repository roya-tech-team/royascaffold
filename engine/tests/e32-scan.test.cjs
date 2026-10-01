"use strict";

// E3.2: `scan [module] --json`: facts per module, from patterns the adapters declare, cached per file by blob hash.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { scanCommand, blobHash, factsOf, compile } = require("../lib/scan.cjs");
const adapters = require("../lib/adapters.cjs");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
const GREEN = path.join(__dirname, "fixtures", "greenfield");

function project(adapter) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e32-"));
  fs.cpSync(GREEN, root, { recursive: true });
  const profile = path.join(root, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("royascaff: 1.4\n", `royascaff: 1.4\nadapters: [${adapter}]\n`));
  const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };
  return { root, put };
}

test("blobHash is the hash git gives a file", () => {
  assert.equal(blobHash(Buffer.from("hello\n")), "ce013625030ba8dba906f756967f9e9ca394464a"); // git hash-object of "hello\n"
});

test("JS and TS facts: imports, exports, routes, schema, config and test files, the largest files", () => {
  const { root, put } = project("node");
  put("apps/web/src/api/routes.ts", `import express from "express";\nimport { db } from "./db";\nconst fs = require("fs");\nexport function listPosts() {}\nexport const router = express.Router();\nexport default class Api {}\napp.get("/posts", listPosts);\nrouter.post('/posts/:id', save);\nmodule.exports = { a, b };\nexports.helper = 1;\n`);
  put("apps/web/src/api/db.ts", "export const db = {};\n".repeat(30));
  put("apps/web/src/api/migrations/001_init.sql", "create table posts (id int);\n");
  put("apps/web/src/api/routes.test.ts", "import { listPosts } from './routes';\n");
  put("apps/web/tsconfig.json", "{}\n");
  const r = scanCommand(root, "api", {});
  assert.deepEqual(r.adapters, ["node"]);
  assert.equal(r.modules.length, 1);
  const m = r.modules[0];
  assert.deepEqual([m.module, m.app, m.files], ["apps/web/src/api", "APP-CAMP-WEB", 4]);
  assert.deepEqual(m.facts.imports, ["./db", "./routes", "express", "fs"]);
  assert.deepEqual(m.facts.exports, ["Api", "a", "b", "db", "helper", "listPosts", "router"], "export statements, exports.x, and the names inside module.exports = { … }");
  assert.deepEqual(m.facts.routes, ["/posts", "/posts/:id"]);
  assert.deepEqual(m.schema_files, ["apps/web/src/api/migrations/001_init.sql"]);
  assert.deepEqual(m.test_files, ["apps/web/src/api/routes.test.ts"]);
  assert.equal(m.largest[0].path, "apps/web/src/api/db.ts");
  assert.equal(m.largest[0].lines, 30);
  assert.equal(m.lines, 30 + 10 + 1 + 1);
  assert.deepEqual(m.details.map((d) => d.path), ["apps/web/src/api/db.ts", "apps/web/src/api/routes.test.ts", "apps/web/src/api/routes.ts"]);
  // The config file sits in the app's root files.
  const all = scanCommand(root, null, {});
  assert.deepEqual(all.modules.find((x) => /root files/.test(x.module)).config_files, ["apps/web/tsconfig.json"]);
});

test("Python facts come from the python adapter's patterns, not from the core", () => {
  const { root, put } = project("python");
  put("apps/web/api/server.py", `import os, sys\nfrom flask import Flask\nfrom .models import Post\n\nclass Api:\n    pass\n\ndef list_posts():\n    pass\n\nasync def save_post():\n    pass\n\n@app.get("/posts")\ndef route():\n    pass\n\n@router.post('/posts/<id>')\ndef route2():\n    pass\n`);
  put("apps/web/api/test_server.py", "import pytest\n");
  put("apps/web/api/migrations/0001_initial.py", "from django.db import migrations\n");
  put("apps/web/pyproject.toml", "[project]\n");
  const r = scanCommand(root, "api", {});
  const m = r.modules[0];
  assert.deepEqual(m.facts.imports, [".models", "django.db", "flask", "os", "pytest", "sys"]);
  assert.deepEqual(m.facts.exports, ["Api", "list_posts", "route", "route2", "save_post"]);
  assert.deepEqual(m.facts.routes, ["/posts", "/posts/<id>"]);
  assert.deepEqual(m.test_files, ["apps/web/api/test_server.py"]);
  assert.deepEqual(m.schema_files, ["apps/web/api/migrations/0001_initial.py"]);
  assert.deepEqual(scanCommand(root, null, {}).modules.find((x) => /root files/.test(x.module)).config_files, ["apps/web/pyproject.toml"]);
});

test("facts are cached per blob hash: a second scan reads nothing; an edit re-reads only that file; a new pattern re-reads all", () => {
  const { root, put } = project("node");
  put("apps/web/src/a/one.ts", "import x from 'one-dep';\n");
  put("apps/web/src/a/two.ts", "import y from 'two-dep';\n");
  const first = scanCommand(root, "a", {});
  assert.deepEqual(first.cache, { hits: 0, misses: 2 });
  assert.ok(fs.existsSync(path.join(root, "project/.cache/scan.json")));
  assert.deepEqual(scanCommand(root, "a", {}).cache, { hits: 2, misses: 0 });
  put("apps/web/src/a/two.ts", "import y from 'changed-dep';\n");
  const third = scanCommand(root, "a", {});
  assert.deepEqual(third.cache, { hits: 1, misses: 1 });
  assert.deepEqual(third.modules[0].facts.imports, ["changed-dep", "one-dep"]);
  // The same content in another file is a hit (same blob).
  put("apps/web/src/b/copy.ts", "import x from 'one-dep';\n");
  assert.deepEqual(scanCommand(root, "b", {}).cache, { hits: 1, misses: 0 });
  // A manifest that changes its patterns invalidates the cache.
  const dir = path.join(root, "project", "adapters");
  fs.mkdirSync(dir, { recursive: true });
  const node = JSON.parse(fs.readFileSync(path.join(adapters.DIR, "node.json"), "utf8"));
  node.adapter = "node2";
  node.scan.patterns.todos = ["TODO\\s*\\(([^)]*)\\)"];
  fs.writeFileSync(path.join(dir, "node2.json"), JSON.stringify(node));
  fs.writeFileSync(path.join(dir, "node2.md"), fs.readFileSync(path.join(adapters.DIR, "node.md"), "utf8"));
  const profile = path.join(root, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("adapters: [node]", "adapters: [node2]"));
  assert.deepEqual(scanCommand(root, "a", {}).cache, { hits: 0, misses: 2 });
});

test("a pattern can split a list, and a project can bring its own language", () => {
  assert.deepEqual(factsOf("module.exports = { alpha, beta: 2, gamma };\n", compile({ patterns: { exports: [{ pattern: "module\\.exports\\s*=\\s*\\{([^}]*)\\}", split: "," }] } })), { exports: ["alpha", "beta", "gamma"] });
  const { root, put } = project("generic");
  const dir = path.join(root, "project", "adapters");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "gd.json"), JSON.stringify({ adapter: "gd", scan: { extensions: [".gd"], patterns: { signals: ["^signal\\s+(\\w+)"] } } }));
  fs.writeFileSync(path.join(dir, "gd.md"), "# Adapter · gd\n\n## Design\n\n- x\n\n## Rules\n\n- x\n\n## Check\n\n- x\n");
  const profile = path.join(root, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("adapters: [generic]", "adapters: [gd]"));
  put("apps/web/src/game/player.gd", "signal died\nsignal jumped\n");
  const m = scanCommand(root, "game", {}).modules[0];
  assert.deepEqual(m.facts.signals, ["died", "jumped"]);
});

test("a module that does not exist is UNKNOWN_ID; no adapter patterns still gives file counts, sizes and lines", () => {
  const { root, put } = project("generic");
  put("apps/web/src/a/one.txt", "a\nb\n");
  assert.throws(() => scanCommand(root, "nope", {}), (e) => e.code === "UNKNOWN_ID" && /nope is not a module here/.test(e.message));
  const m = scanCommand(root, "a", {}).modules[0];
  assert.deepEqual([m.files, m.lines, m.facts], [1, 2, {}]);
});

test("the CLI: scan --json is a contract envelope with the facts", () => {
  const { root, put } = project("node");
  put("apps/web/src/a/one.ts", "import x from 'one-dep';\nexport const y = 1;\n");
  const r = spawnSync(process.execPath, [BIN, "scan", "a", root, "--json"], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } });
  assert.equal(r.status, 0, r.stderr);
  const env = JSON.parse(r.stdout);
  assert.deepEqual([env.ok, env.command, env.data.modules[0].facts.imports, env.data.modules[0].facts.exports], [true, "scan", ["one-dep"], ["y"]]);
  const bad = spawnSync(process.execPath, [BIN, "scan", "zzz", root, "--json"], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } });
  assert.equal(JSON.parse(bad.stdout).error.code, "UNKNOWN_ID");
});
