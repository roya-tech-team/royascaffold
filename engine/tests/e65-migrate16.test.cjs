"use strict";

// E6.5: `royascaff migrate --from 1.5` moves a project to 1.6: dry run, apply and rollback byte for byte, like the older
// migrations. Also the engine's own project (the dogfood `project/` of this repository) and a generated big project.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { migrateCommand, detect } = require("../lib/commands/migrate.cjs");
const { newRecord } = require("../lib/commands/plan.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { roundTrip } = require("../lib/io/exchange.cjs");
const { validate } = require("./schema-lite.cjs");
const { makeProject } = require("./synthetic.cjs");
const baseline = require("../lib/baseline.cjs");

const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");
const GREEN = path.join(__dirname, "fixtures", "greenfield");
const REPO = path.join(__dirname, "..", "..");
const ENV = { ...process.env, ROYASCAFF_USAGE: "off", ROYASCAFF_NO_TTY: "1", ROYASCAFF_USER: "islam" };

const snapshot = (dir) => {
  const out = {};
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { out[`${r}/`] = "dir"; walk(r); } else out[r] = crypto.createHash("sha256").update(fs.readFileSync(path.join(dir, r))).digest("hex");
    }
  };
  walk("");
  return out;
};

function withReleases(root) {
  newRecord(root, "release", "1.0.0", { by: "islam" }); // no baseline yet
  newRecord(root, "release", "1.1.0", { by: "islam" });
  return root;
}
const copy = () => { const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e65-")); fs.cpSync(GREEN, root, { recursive: true }); return withReleases(root); };

test("a 1.4 or 1.5 project is not moved unless asked; a 1.6 project says so", () => {
  const dir = copy();
  assert.equal(detect(dir), "1.4");
  assert.throws(() => migrateCommand(dir, {}), /already on RoyaScaff 1\.4 .*royascaff migrate --from 1\.5/);
  assert.throws(() => migrateCommand(dir, { from: "1.3" }), /already on RoyaScaff 1\.4/);
  migrateCommand(dir, { apply: true, from: "1.5" });
  assert.equal(detect(dir), "1.6");
  assert.throws(() => migrateCommand(dir, { from: "1.5" }), /already on RoyaScaff 1\.6/);
});

test("migrate 1.5 → 1.6: a dry run changes nothing; apply marks the profile, writes a baseline per release and logs it; rollback is byte for byte", () => {
  const dir = copy();
  const original = snapshot(dir);
  const before = new Set(buildModel(dir).records.keys());

  const dry = migrateCommand(dir, { from: "1.5" });
  assert.deepEqual([dry.action, dry.from, dry.to], ["dry-run", "1.5", "1.6"]);
  assert.deepEqual([dry.moves, dry.edits, dry.creates], [0, 2, 2], "the profile and the log are edited; two baselines are created");
  assert.equal(dry.validation.errors, 0, dry.errors.join("\n"));
  assert.deepEqual(snapshot(dir), original, "a dry run must not touch the project");

  const r = migrateCommand(dir, { apply: true, from: "1.5" });
  assert.deepEqual([r.action, r.lost.length, r.validation.errors], ["apply", 0, 0]);
  assert.equal(r.manifest, "project/_legacy/1.5/migration");
  const m = buildModel(dir);
  assert.ok(m.is14);
  assert.match(fs.readFileSync(path.join(dir, "project/profile.md"), "utf8"), /^royascaff: 1\.6$/m);
  assert.deepEqual(baseline.listBaselines(m), ["REL-CAMP-001", "REL-CAMP-002"]);
  const b = baseline.readBaseline(m, "REL-CAMP-001");
  assert.equal(b.records.some((x) => x.id === "REQ-CAMP-001"), true);
  assert.match(fs.readFileSync(path.join(dir, "project/log.md"), "utf8"), /\| migration\.applied \| project \| [^|]+ \| [^|]+ \| 1\.5 → 1\.6: profile marked 1\.6, 2 baseline\(s\) \|\n$/);
  for (const id of before) assert.ok(m.records.has(id), `${id} lost`);
  assert.ok(roundTrip(dir).ok, "Markdown round trip stays lossless");

  // The project works as before, and the new commands use the baselines at once.
  const run = (...args) => JSON.parse(spawnSync(process.execPath, [BIN, ...args, dir, "--json"], { encoding: "utf8", env: ENV }).stdout);
  assert.equal(run("status").ok, true);
  assert.equal(run("validate").ok, true);
  assert.deepEqual(run("diff", "REL-CAMP-001", "REL-CAMP-002").data.counts, { added: 0, changed: 0, removed: 0, evidence_added: 0 });

  // Undo: the tree is as it was, byte for byte.
  const back = migrateCommand(dir, { rollback: true });
  assert.equal(back.action, "rollback");
  assert.deepEqual(snapshot(dir), original, "rollback restores the tree byte for byte");
  assert.equal(detect(dir), "1.4");
});

test("migrate --from 1.5 --json: the envelope validates; a project with no release only gets its profile marked", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e65-"));
  fs.cpSync(GREEN, root, { recursive: true });
  const original = snapshot(root);
  const call = (...args) => spawnSync(process.execPath, [BIN, "migrate", root, ...args, "--json"], { encoding: "utf8", env: ENV });
  const dry = JSON.parse(call("--from", "1.5").stdout);
  assert.equal(dry.ok, true, JSON.stringify(dry));
  assert.deepEqual(validate(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "contract", "schemas", "migrate.schema.json"), "utf8")), dry.data), []);
  assert.deepEqual([dry.data.to, dry.data.creates, dry.data.edits], ["1.6", 0, 2]);
  assert.ok(dry.data.notes.some((n) => /No release records/.test(n)));
  const bare = JSON.parse(call("--from", "1.5", "--apply").stdout);
  assert.equal(bare.ok, true);
  const refused = JSON.parse(call("--from", "1.5").stdout);
  assert.equal(refused.ok, false);
  assert.equal(refused.error.code, "VERSION_MISMATCH");
  const undone = JSON.parse(call("--rollback").stdout);
  assert.equal(undone.ok, true);
  assert.deepEqual(snapshot(root), original);
});

test("migrate on the engine's own project (this repository's dogfood project/) and on a generated project of 600 records", () => {
  const own = path.join(REPO, "project");
  const cases = [];
  if (fs.existsSync(path.join(own, "profile.md"))) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rs-e65-own-"));
    // The project folder with the files it describes: the engine's source is what its components own.
    fs.cpSync(own, path.join(dir, "project"), { recursive: true, filter: (src) => !/[\\/]\.(backups|cache|usage)([\\/]|$)/.test(src) });
    fs.cpSync(path.join(REPO, "engine", "lib"), path.join(dir, "engine", "lib"), { recursive: true });
    fs.cpSync(path.join(REPO, "engine", "bin"), path.join(dir, "engine", "bin"), { recursive: true });
    // Once the repository has migrated its own project, test the migration from the state before it: a 1.5 project.
    const profile = path.join(dir, "project", "profile.md");
    fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace(/^royascaff: 1\.[46]$/m, "royascaff: 1.4"));
    fs.rmSync(path.join(dir, "project", "_legacy", "1.5"), { recursive: true, force: true });
    fs.rmSync(path.join(dir, "project", "baselines"), { recursive: true, force: true });
    cases.push(["the engine's own project", dir]);
  }
  cases.push(["a generated project", withReleases(makeProject({ features: 25 }))]);
  for (const [name, dir] of cases) {
    const original = snapshot(dir);
    const errorsBefore = buildModel(dir).issues.filter((i) => i.severity === "error").length;
    const dry = migrateCommand(dir, { from: "1.5" });
    assert.equal(dry.validation.errors, errorsBefore, `${name}: the dry run adds no error (${dry.errors.join("; ")})`);
    assert.deepEqual(snapshot(dir), original, `${name}: a dry run changes nothing`);
    const r = migrateCommand(dir, { apply: true, from: "1.5" });
    assert.deepEqual([r.lost.length, r.validation.errors], [0, errorsBefore], name);
    assert.equal(detect(dir), "1.6", name);
    assert.ok(roundTrip(dir).ok, `${name}: round trip`);
    migrateCommand(dir, { rollback: true });
    assert.deepEqual(snapshot(dir), original, `${name}: rollback is byte for byte`);
  }
});
