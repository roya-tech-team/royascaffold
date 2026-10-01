"use strict";

// The adapter kit (plan file 01 §5, E2.1): `adapter new <name>` starts an adapter from a template,
// `adapter test <name>` checks it. An adapter is a card (`<name>.md`, what the AI reads) and a manifest
// (`<name>.json`, what the core runs and asks for). A team keeps its own adapters in project/adapters/.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const adapters = require("./adapters.cjs");
const { findProject, toPosix } = require("./project.cjs");
const { validate } = require("./schema.cjs");

const NAME = /^[a-z][a-z0-9-]*$/;
const CARD_BUDGET_TOKENS = 600; // the same budget as the engine's own cards
const SCHEMA_FILE = path.join(__dirname, "..", "contract", "schemas", "adapter.schema.json");

const fail = (code, message, missing) => Object.assign(new Error(message), { code, ...(missing ? { missing } : {}) });
const tokensOf = (text) => Math.ceil(text.length / 4);

function projectDirOf(start) {
  try {
    return findProject(start || ".");
  } catch {
    return null;
  }
}

const cardTemplate = (name, includes) => `# Adapter · ${name}

> **What:** guidance for ${name} projects${includes.length ? ` (builds on ${includes.join(", ")})` : ""}
> **Read when:** the stage card or \`royascaff next\` names this adapter

## Design

- Name the parts of the system and what each one owns.
- Say how this kind of product is built, in a few short lines.

## Rules

- One rule per line, each one checkable by reading the code.

## Check

- What must pass before a change is verified, and how it is run.

## Words

(none yet)
`;

// royascaff adapter new <name> [--includes a,b]: project/adapters/<name>.json and <name>.md from a template.
function newAdapter(start, name, flags = {}) {
  if (!name || name === true || !NAME.test(String(name))) throw fail("INVALID_INPUT", "Usage: royascaff adapter new <name> [--includes web-ui] — a name uses lowercase letters, digits and dashes");
  const project = findProject(start || ".");
  const dir = path.join(project.projectDir, "adapters");
  const jsonFile = path.join(dir, `${name}.json`);
  const cardFile = path.join(dir, `${name}.md`);
  if (fs.existsSync(jsonFile) || fs.existsSync(cardFile)) throw fail("ALREADY_EXISTS", `${toPosix(path.relative(project.repo, fs.existsSync(jsonFile) ? jsonFile : cardFile))} already exists: edit it`);
  const includes = flags.includes && flags.includes !== true ? String(flags.includes).split(",").map((x) => x.trim()).filter(Boolean) : [];
  const known = adapters.KNOWN(project.projectDir);
  const unknown = includes.filter((i) => !known.includes(i));
  if (unknown.length) throw fail("UNKNOWN_ID", `Unknown adapter to include: ${unknown.join(", ")} (known: ${known.join(", ")})`);
  const manifest = {
    adapter: name,
    description: `Guidance and checks for ${name} projects`,
    ...(includes.length ? { includes } : {}),
    checks: {},
    layers: { requires: [] },
    words: [],
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(jsonFile, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(cardFile, cardTemplate(name, includes));
  return { name, includes, files: [jsonFile, cardFile].map((f) => toPosix(path.relative(project.repo, f))) };
}

const SHELL_WORDS = new Set(["echo", "exit", "true", "false", "cd", "test", "set", "printf", "type"]);

function programOf(command) {
  const m = String(command).match(/^\s*(?:[A-Za-z_]\w*=\S*\s+)*("[^"]+"|'[^']+'|\S+)/);
  return m ? m[1].replace(/^["']|["']$/g, "") : "";
}

function onPath(program) {
  const exts = process.platform === "win32" ? ["", ...(process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";")] : [""];
  for (const dir of (process.env.PATH || "").split(path.delimiter).filter(Boolean)) {
    for (const ext of exts) {
      const f = path.join(dir, program + ext);
      try {
        if (fs.statSync(f).isFile()) return true;
      } catch {
        // not here
      }
    }
  }
  return false;
}

// Does a declared command have a program to run? A dry mode that never starts the real check.
function resolves(command, cwd) {
  const program = programOf(command);
  if (!program) return false;
  if (/[\\/]/.test(program) || program.startsWith(".")) return fs.existsSync(path.resolve(cwd, program));
  return SHELL_WORDS.has(program) || onPath(program);
}

// royascaff adapter test <name>: the schema, the includes, the card, the budget and a dry run of every declared check.
function testAdapter(start, name) {
  if (!name || name === true) throw fail("INVALID_INPUT", "Usage: royascaff adapter test <name>");
  const project = projectDirOf(start);
  const dir = project ? project.projectDir : null;
  const cwd = project ? project.repo : process.cwd();
  const checks = [];
  const add = (id, ok, message, extra = {}) => checks.push({ id, ok, message, ...extra });
  const known = adapters.KNOWN(dir);
  if (!known.includes(name)) throw fail("UNKNOWN_ID", `${name} is not an adapter here (known: ${known.join(", ")})`);

  // 1. The manifest, against its schema.
  const manifestFile = [path.join(dir || "", "adapters", `${name}.json`), path.join(adapters.DIR, `${name}.json`)].find((f) => f && fs.existsSync(f));
  let manifest = null;
  if (!manifestFile) add("manifest", false, `adapters/${name}.json is missing: the card needs a manifest beside it (it can be {"adapter": "${name}"})`);
  else {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    } catch (error) {
      add("manifest", false, `${path.basename(manifestFile)} is not valid JSON: ${error.message}`);
    }
  }
  if (manifest) {
    let schema = null;
    try {
      schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, "utf8"));
    } catch {
      add("schema", true, "the manifest schema (contract/schemas/adapter.schema.json) is not here, so the manifest was not validated", { skipped: true });
    }
    if (schema) {
      const problems = validate(schema, manifest);
      add("schema", problems.length === 0, problems.length ? `the manifest does not match adapter.schema.json: ${problems.join("; ")}` : "the manifest matches adapter.schema.json");
    }
    const declared = manifest.adapter || manifest.name;
    add("name", declared === name, declared === name ? `the manifest names itself ${name}` : `the manifest says its name is "${declared}" but the file is ${name}.json`);
  }

  // 2. The includes resolve, and do not loop.
  const includes = (manifest && manifest.includes) || [];
  const seen = [];
  const loops = [];
  const walk = (n, stack) => {
    if (stack.includes(n)) { loops.push([...stack, n].join(" → ")); return; }
    if (seen.includes(n)) return;
    seen.push(n);
    for (const inc of adapters.manifest(n, dir).includes || []) walk(inc, [...stack, n]);
  };
  const missingIncludes = includes.filter((i) => !known.includes(i));
  add("includes", !missingIncludes.length && !loops.length, missingIncludes.length ? `includes that do not resolve: ${missingIncludes.join(", ")}` : loops.length ? `the includes loop: ${loops[0]}` : includes.length ? `includes resolve: ${includes.join(", ")}` : "no includes");
  if (!missingIncludes.length) walk(name, []);

  // 3. The card: its four sections and its token budget.
  const cardFile = [path.join(dir || "", "adapters", `${name}.md`), path.join(adapters.DIR, `${name}.md`)].find((f) => f && fs.existsSync(f));
  const card = adapters.readAdapter(name, dir);
  if (!card) add("card", false, `adapters/${name}.md is missing`);
  else {
    const words = card.words.filter((w) => !/^[(_]/.test(w)).length + ((manifest && manifest.words) || []).length;
    const empty = [["Design", card.design], ["Rules", card.rules], ["Check", card.check]].filter(([, v]) => !v || /^\(.*\)$/.test(v.trim())).map(([k]) => k);
    add("card", empty.length === 0, empty.length ? `the card needs real content in: ${empty.join(", ")}` : "the card has Design, Rules and Check");
    if (!words) add("words", true, "the card lists no technical words (business documents are not checked for them), which is allowed", { warning: true });
    const t = tokensOf(fs.readFileSync(cardFile, "utf8"));
    add("budget", t <= CARD_BUDGET_TOKENS, `the card is about ${t} of ${CARD_BUDGET_TOKENS} tokens${t > CARD_BUDGET_TOKENS ? ": shorten it, or split what is long into a layer document" : ""}`);
  }

  // 4. A dry run of each declared check: its program exists (or its own `dry` command exits 0). Nothing real runs.
  const declared = [];
  for (const [type, value] of Object.entries((manifest && manifest.checks) || {})) declared.push({ id: `check:${type}`, run: typeof value === "string" ? value : value.run, dry: typeof value === "object" ? value.dry : null });
  if (manifest && manifest.smoke && manifest.smoke.command) declared.push({ id: "check:smoke", run: manifest.smoke.command, dry: null });
  for (const c of declared) {
    if (c.dry) {
      const r = spawnSync(c.dry, { cwd, shell: true, encoding: "utf8", timeout: 30000 });
      add(c.id, r.status === 0, r.status === 0 ? `dry run passed: ${c.dry}` : `dry run failed (exit ${r.status}): ${c.dry}`);
    } else {
      const ok = resolves(c.run, cwd);
      add(c.id, ok, ok ? `its program resolves: ${c.run}` : `its program was not found: ${c.run}`);
    }
  }
  if (manifest && manifest.smoke && manifest.smoke.template) {
    const t = path.join(path.dirname(manifestFile), manifest.smoke.template);
    add("smoke-template", fs.existsSync(t), fs.existsSync(t) ? `the smoke template exists: ${manifest.smoke.template}` : `the smoke template is missing: ${manifest.smoke.template}`);
  }
  if (manifest && !declared.length) add("declares-checks", true, "no checks are declared (the apps' own commands run), which is allowed", { warning: true });

  return { name, ok: checks.every((c) => c.ok), checks, card: cardFile ? toPosix(path.relative(project ? project.repo : cwd, cardFile)) : null };
}

module.exports = { newAdapter, testAdapter, resolves, CARD_BUDGET_TOKENS, NAME };
