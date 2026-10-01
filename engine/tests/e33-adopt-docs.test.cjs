"use strict";

// E3.3: `adopt docs <folder>`. An AI turns existing documents into demands (SRC-) and decisions (ADR-), each
// quoting its source file; the engine lists the documents, shows which are covered, and checks that every quote
// is in its file word for word. The plan folder of this repository is the test: plans/v1.5-v2.0.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { adoptDocs } = require("../lib/commands/adopt.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { initProject } = require("../lib/commands/setup.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { validateCommand } = require("../lib/commands/inspect.cjs");
const { fileQuoteFound } = require("../lib/coverage.cjs");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
const PLANS = path.join(__dirname, "..", "..", "plans", "v1.5-v2.0");
const skip = fs.existsSync(path.join(PLANS, "README.md")) ? false : "plans/v1.5-v2.0 is not in this checkout";

function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e33-"));
  initProject(root, { name: "Plans", code: "PLN" });
  fs.cpSync(PLANS, path.join(root, "docs", "plans"), { recursive: true });
  return root;
}
const FOLDER = "docs/plans";
const read = (root, rel) => fs.readFileSync(path.join(root, rel), "utf8");
const errors = (root) => validateCommand(root).issues.filter((i) => i.severity === "error");

test("fileQuoteFound: word for word, whitespace may differ, parts split by an ellipsis keep their order, case counts", () => {
  const text = "# Title\n\nThe engine's files\nin the customer's   git repo.\nThen more words follow.";
  assert.equal(fileQuoteFound(text, "The engine's files in the customer's git repo."), true);
  assert.equal(fileQuoteFound(text, "The engine's files … Then more words"), true);
  assert.equal(fileQuoteFound(text, "Then more words … The engine's files"), false, "parts must come in order");
  assert.equal(fileQuoteFound(text, "the engine's files"), false, "case counts: verbatim");
  assert.equal(fileQuoteFound(text, "A sentence that is not there."), false);
  assert.equal(fileQuoteFound(text, ""), false);
});

test("adopt docs lists the documents of a folder with headings and a hash, and none is covered yet", { skip }, () => {
  const root = project();
  const r = adoptDocs(root, FOLDER);
  assert.equal(r.folder, FOLDER);
  assert.deepEqual(r.documents.map((d) => d.path), [
    "docs/plans/01-engine-1.5-verify-and-automate.md",
    "docs/plans/02-engine-1.6-evolve.md",
    "docs/plans/03-engine-1.7-agent-interface.md",
    "docs/plans/04-royascaff-2.0-studio-saas.md",
    "docs/plans/05-build-program-for-claude-code.md",
    "docs/plans/README.md",
  ]);
  for (const d of r.documents) {
    assert.ok(d.lines > 20 && d.bytes > 500 && /^[0-9a-f]{40}$/.test(d.sha), d.path);
    assert.ok(d.headings.length > 2 && d.headings[0].line >= 1 && /\S/.test(d.headings[0].text));
    assert.deepEqual(d.records, []);
    assert.equal(d.covered, false);
  }
  assert.deepEqual([r.counts.documents, r.counts.covered, r.counts.records, r.counts.problems], [6, 0, 0, 0]);
  assert.equal(r.uncovered.length, 6);
  assert.match(r.text, /6 document\(s\), 0 covered/);
  assert.match(r.text, /royascaff new record source "<demand>" --quote "<exact words>" --source-file docs\/plans\/01-engine-1\.5-verify-and-automate\.md/);
  assert.throws(() => adoptDocs(root, "docs/nope"), (e) => e.code === "UNKNOWN_ID" && /docs\/nope is not a folder/.test(e.message));
  assert.throws(() => adoptDocs(root, "../outside"), (e) => e.code === "INVALID_INPUT");
});

test("the AI imports the plan folder: one demand per file (its title) and a decision, each quoting its file; every quote checks out", { skip }, () => {
  const root = project();
  const docs = adoptDocs(root, FOLDER).documents;
  let n = 0;
  for (const d of docs) {
    const title = d.headings.find((h) => h.level === 1).text; // the document's first line, as the AI would quote it
    const src = newRecord(root, "source", `The plan: ${title.slice(0, 60)}`, { quote: title, "source-file": d.path });
    assert.equal(src.kind, "source");
    n += 1;
  }
  // Decisions are quoted too; the README's ten decisions are one line each.
  const readme = read(root, "docs/plans/README.md");
  const line = readme.split("\n").find((l) => l.startsWith("| D2 |"));
  const quote = "The engine's files in the customer's git repo.";
  assert.ok(line.includes(quote));
  const dec = newRecord(root, "decision", "Source of truth is the repository's files", { quote, "source-file": "docs/plans/README.md" });
  assert.equal(dec.kind, "decision");
  const quoteTwo = newRecord(root, "decision", "Two repositories", { quote: "Two repos: … royascaff-studio", "source-file": "docs/plans/README.md" });
  assert.ok(quoteTwo.id);

  const m = buildModel(root);
  assert.deepEqual(errors(root), []);
  assert.equal(m.issues.filter((i) => /^source-/.test(i.code) && i.code !== "source-uncovered").length, 0);
  assert.equal(m.issues.filter((i) => i.code === "source-uncovered").length, 0, "adopted demands are history, not work to deliver");
  const r = adoptDocs(root, FOLDER);
  assert.deepEqual([r.counts.documents, r.counts.covered, r.counts.records, r.counts.problems], [6, 6, n + 2, 0]);
  assert.deepEqual(r.uncovered, []);
  const readmeDoc = r.documents.find((d) => d.path.endsWith("README.md"));
  assert.equal(readmeDoc.records.length, 3);
  assert.ok(r.records.every((x) => x.quote_ok === true));
  assert.match(r.text, /6 document\(s\), 6 covered/);
  // The records read like any other: the record's fields name the file and the quote.
  const rec = m.records.get(dec.id);
  assert.equal(rec.fields["Source file"], "docs/plans/README.md");
  assert.equal(rec.fields.Quote, quote);
  assert.ok(require("../lib/io/exchange.cjs").roundTrip(root).ok);
  // Demands from files do not block the brief: they are not demands of the request.
  assert.deepEqual(m.approvals.coverage.uncovered, []);
});

test("a quote that is not in its file is refused when written, and an error when the file changes later", { skip }, () => {
  const root = project();
  assert.throws(() => newRecord(root, "source", "Invented", { quote: "Studio is written in Rust.", "source-file": "docs/plans/README.md" }), (e) => e.code === "INVALID_INPUT" && /not in docs\/plans\/README\.md/.test(e.message));
  assert.throws(() => newRecord(root, "source", "No file", { quote: "x", "source-file": "docs/plans/nothing.md" }), (e) => e.code === "UNKNOWN_ID" && /docs\/plans\/nothing\.md/.test(e.message));
  assert.throws(() => newRecord(root, "source", "Outside", { quote: "x", "source-file": "../secret.md" }), (e) => e.code === "INVALID_INPUT");
  const quote = "RoyaScaff 1.5 → 2.0 — Plan index";
  newRecord(root, "source", "The index", { quote, "source-file": "docs/plans/README.md" });
  assert.deepEqual(errors(root), []);
  // The document is edited: the quote is gone, so the engine says so.
  const f = path.join(root, "docs/plans/README.md");
  fs.writeFileSync(f, read(root, "docs/plans/README.md").replace("Plan index", "Plan overview"));
  const bad = errors(root);
  assert.equal(bad.length, 1);
  assert.equal(bad[0].code, "source-quote-not-found-in-file");
  assert.match(bad[0].message, /SRC-PLN-001 quotes words that are not in docs\/plans\/README\.md: quote the file exactly, or update the record/);
  const r = adoptDocs(root, FOLDER);
  assert.equal(r.counts.problems, 1);
  assert.equal(r.records[0].quote_ok, false);
  assert.match(r.text, /✗ SRC-PLN-001/);
  // A deleted file is an error too.
  fs.rmSync(f);
  assert.equal(errors(root)[0].code, "source-file-missing");
});

test("the CLI: adopt docs <folder> --json is a contract envelope; adopt with no folder is unchanged", { skip }, () => {
  const root = project();
  const run = (args) => { const r = spawnSync(process.execPath, [BIN, ...args, "--json"], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } }); return { status: r.status, env: JSON.parse(r.stdout) }; };
  const docs = run(["adopt", "docs", FOLDER, root]);
  assert.equal(docs.status, 0, JSON.stringify(docs.env).slice(0, 300));
  assert.deepEqual([docs.env.command, docs.env.data.counts.documents, docs.env.data.folder], ["adopt", 6, FOLDER]);
  const plain = run(["adopt", root]);
  assert.equal(plain.status, 0);
  assert.ok(Array.isArray(plain.env.data.modules), "the module view is still there");
  assert.equal(run(["adopt", "docs", "docs/zzz", root]).env.error.code, "UNKNOWN_ID");
});
