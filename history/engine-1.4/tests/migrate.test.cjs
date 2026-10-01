"use strict";

// Step 12: `royascaff migrate` on the five real projects (plan 09 §5 step 12).
// Each case: dry run changes nothing · apply gives a 1.4 project that validates with 0 errors ·
// no record ID is lost (only 1.3 saved context packs are archived) · nothing is deleted ·
// Markdown round trip still byte-identical · rollback restores the tree byte for byte.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");
const { migrateCommand, detect } = require("../lib/commands/migrate.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { roundTrip } = require("../lib/io/exchange.cjs");
const { nextCommand } = require("../lib/commands/navigate.cjs");

const FIX = path.join(__dirname, "fixtures");
const BIN = path.join(__dirname, "..", "bin", "royascaff.cjs");

function copy(name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `rs-migrate-${name}-`));
  fs.cpSync(path.join(FIX, name), dir, { recursive: true });
  return dir;
}

function snapshot(dir) {
  const out = {};
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { out[`${r}/`] = "dir"; walk(r); }
      else out[r] = crypto.createHash("sha256").update(fs.readFileSync(path.join(dir, r))).digest("hex");
    }
  };
  walk("");
  return out;
}

const CASES = [
  { name: "kuni-1.3", from: "1.3", features: 7, slices: 7, changes: 2, archived: 4 },
  { name: "kuni-1.3.1", from: "1.3", features: 4, slices: 4, changes: 1, archived: 7 },
  { name: "pollpulse-1.3", from: "1.3", features: 4, slices: 0, changes: 1, archived: 1 },
  { name: "kuni-1.2", from: "1.2", features: 5, slices: 5, changes: 5, archived: 0, code: "KUNI" },
  { name: "demo-1.2", from: "1.2", features: 3, slices: 3, changes: 3, archived: 0 },
];

for (const c of CASES) {
  test(`migrate ${c.name}: dry run, apply, validate, no lost IDs, rollback byte-identical`, () => {
    const dir = copy(c.name);
    const original = snapshot(dir);
    assert.equal(detect(dir), c.from);
    const before = new Set(buildModel(dir).records.keys());

    const dry = migrateCommand(dir, { code: c.code });
    assert.equal(dry.action, "dry-run");
    assert.deepEqual(snapshot(dir), original, "dry run must not touch the project");
    assert.equal(dry.validation.errors, 0, dry.errors.join("\n"));

    const r = migrateCommand(dir, { apply: true, code: c.code });
    assert.equal(r.action, "apply");
    assert.equal(r.lost.length, 0);
    assert.equal(r.archived.length, c.archived);
    assert.equal(r.validation.errors, 0, r.errors.join("\n"));

    const m = buildModel(dir);
    assert.equal(m.layout, "project-folder");
    assert.ok(m.is14, "profile says royascaff: 1.4");
    assert.equal(m.features.size, c.features);
    assert.equal(m.slices.size, c.slices);
    assert.equal(m.changes.size, c.changes);
    for (const id of before) assert.ok(m.records.has(id) || r.archived.includes(id), `${id} lost`);
    for (const ch of m.changes.values()) assert.ok(ch.kind, `${ch.id} has a kind`);
    for (const f of m.features.values()) assert.ok(f.horizonSet, `${f.id} has a horizon`);
    assert.ok(fs.existsSync(path.join(dir, "project", "STATUS.md")));
    assert.ok(fs.existsSync(path.join(dir, "project", "_legacy", c.from, "MIGRATION.md")));

    // Nothing deleted: every original file is still in the tree or in the snapshot copy.
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, r.manifest, "manifest.json"), "utf8"));
    for (const f of Object.keys(original).filter((k) => !k.endsWith("/"))) {
      const moved = manifest.moves.find((x) => x.from === f);
      assert.ok(fs.existsSync(path.join(dir, moved ? moved.to : f)), `${f} missing after apply`);
      if (moved || manifest.edited.includes(f)) assert.ok(fs.existsSync(path.join(dir, r.manifest, "original", f)), `${f} not snapshotted`);
    }
    assert.ok(roundTrip(dir).ok, "Markdown round trip stays lossless");
    assert.ok(nextCommand(dir).text, "next answers after migration");

    assert.throws(() => migrateCommand(dir, {}), /already on RoyaScaff 1.4/);
    const back = migrateCommand(dir, { rollback: true });
    assert.equal(back.action, "rollback");
    assert.deepEqual(snapshot(dir), original, "rollback restores the tree byte for byte");
  });
}

test("1.3 migration: slices list what the change delivered, ranges expanded, tasks keep their state", () => {
  const dir = copy("kuni-1.3");
  migrateCommand(dir, { apply: true });
  const m = buildModel(dir);
  const chg = m.changes.get("CHG-KUNI-002");
  assert.deepEqual(chg.slices, ["SLC-KUNI-005-A", "SLC-KUNI-006-A", "SLC-KUNI-007-A"]);
  const delivered = chg.slices.flatMap((s) => m.slices.get(s).delivers).sort();
  // change.md says "REQ-KUNI-019 through REQ-KUNI-024"
  for (const n of ["019", "020", "021", "022", "023", "024"]) assert.ok(delivered.includes(`REQ-KUNI-${n}`), `REQ-KUNI-${n}`);
  assert.equal(chg.dir, "changes/CHG-KUNI-002");
  assert.equal(chg.events.filter((e) => e.event === "task.done").length, 2);
  const brd = fs.readFileSync(path.join(dir, "project/knowledge/01-business/brd.md"), "utf8");
  assert.doesNotMatch(brd, /Implementation status|Knowledge status/);
  assert.match(brd, /> \*\*Read when:\*\*/);
  const report = fs.readFileSync(path.join(dir, "project/_legacy/1.3/MIGRATION.md"), "utf8");
  assert.match(report, /\| CAP-KUNI-001 \| verified \| approved \|/);
});

test("1.3 legacy-root layout moves into project/ and keeps README and code in place", () => {
  const dir = copy("pollpulse-1.3");
  migrateCommand(dir, { apply: true });
  for (const f of ["README.md", "migration-report.md"]) assert.ok(fs.existsSync(path.join(dir, f)), `${f} stays at the root`);
  for (const z of ["knowledge", "changes", "evidence", "releases", "generated", "contexts"]) assert.ok(!fs.existsSync(path.join(dir, z)), `${z}/ moved`);
  assert.ok(fs.existsSync(path.join(dir, "project/changes/CHG-MIGRATION-001/change.md")));
  assert.ok(fs.existsSync(path.join(dir, "project/_legacy/1.3/generated/status.md")));
  const profile = fs.readFileSync(path.join(dir, "project/profile.md"), "utf8");
  assert.match(profile, /^royascaff: 1\.4$/m);
  assert.match(profile, /### APP-POLLPULSE-API · api app/);
});

test("1.2 migration: packs become feature → slice → change, PASS verification becomes evidence", () => {
  const dir = copy("demo-1.2");
  migrateCommand(dir, { apply: true });
  const m = buildModel(dir);
  const slice = m.slices.get("SLC-POLLPULSE-003-A");
  assert.deepEqual(slice.depends_on, ["SLC-POLLPULSE-002-A"]);
  assert.equal(slice.delivers.length, 5);
  assert.equal(m.changes.get("CHG-POLLPULSE-003").status, "closed");
  const evd = m.evidence.get("EVD-POLLPULSE-003");
  assert.equal(evd.result, "pass");
  assert.deepEqual(evd.proves, slice.delivers);
  for (const f of ["status.md", "build-program.md", "change-log.md", "verify/verification-report.md", "packs/change-20260805-120003-init-polls/verify-code.md"]) {
    assert.ok(fs.existsSync(path.join(dir, "project/_legacy/1.2", f)), `${f} kept in _legacy`);
  }
  assert.ok(fs.existsSync(path.join(dir, "project/knowledge/05-implementation/actions/api/services/auth.md")));
  assert.ok(m.records.has("SVC-AUTH-01"));
  assert.ok(m.records.has("APP-POLLPULSE-WEB"));
});

test("migrate refuses a dirty git tree (unless --force) and runs through the CLI", () => {
  const dir = copy("kuni-1.3.1");
  const git = (...a) => spawnSync("git", ["-C", dir, ...a], { encoding: "utf8" });
  if (git("init", "-q").status !== 0) return; // git not available
  git("-c", "user.email=t@t", "-c", "user.name=t", "add", "-A");
  git("-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "init");
  fs.writeFileSync(path.join(dir, "scratch.ts"), "// work in progress\n");
  const cli = (...a) => spawnSync(process.execPath, [BIN, ...a], { encoding: "utf8", env: { ...process.env, ROYASCAFF_USAGE: "off" } });
  const refused = cli("migrate", dir, "--apply");
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /uncommitted change/);
  assert.ok(fs.existsSync(path.join(dir, "changes/active/CHG-KUNI-001")), "nothing moved");
  const dry = cli("migrate", dir);
  assert.equal(dry.status, 0, dry.stderr);
  assert.match(dry.stdout, /Dry run \(nothing changed\)/);
  const forced = cli("migrate", dir, "--apply", "--force");
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(forced.stdout, /0 deleted/);
  assert.equal(fs.readFileSync(path.join(dir, "scratch.ts"), "utf8"), "// work in progress\n", "developer work untouched");
  const log = fs.readFileSync(path.join(dir, "project/changes/CHG-KUNI-001/log.md"), "utf8");
  assert.match(log, new RegExp(`\\| change.opened \\| CHG-KUNI-001 \\| royascaff-migrate \\| ${git("rev-parse", "--short", "HEAD").stdout.trim()} \\|`));
});
