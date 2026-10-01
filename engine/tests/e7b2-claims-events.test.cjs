"use strict";

// E7b.2: claims (plan 03 §4, M4) and the event stream (§5, M5). Acceptance C2: two agents claiming overlapping
// paths: the second gets CLAIM_CONFLICT; a lease expires correctly.

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { spawn } = require("child_process");
const { BIN, env, call, copyFixture } = require("./contract-scenarios.cjs");
const claims = require("../lib/claims.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { appendEvent } = require("../lib/events.cjs");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("globsOverlap: folders before the first wildcard decide; a miss is never allowed", () => {
  const o = claims.globsOverlap;
  assert.equal(o("apps/web/**", "apps/web/src/a.ts"), true);
  assert.equal(o("apps/web/src/a.ts", "apps/web/**"), true);
  assert.equal(o("apps/web/**", "apps/api/**"), false);
  assert.equal(o("apps/web", "apps/web/x/**"), true);
  assert.equal(o("apps/web2/**", "apps/web/**"), false, "a sibling whose name starts the same");
  assert.equal(o("**", "apps/api/**"), true, "everything overlaps everything");
  assert.equal(o("./apps/web/", "apps/web/src/**"), true, "a leading ./ and a trailing / do not matter");
  assert.deepEqual(claims.pathsOverlap(["a/**", "b/**"], ["c/x", "b/y"]), [["b/**", "b/y"]]);
});

test("C2: the second agent claiming overlapping paths gets CLAIM_CONFLICT with the holder and paths; a release frees them", () => {
  const root = copyFixture("greenfield");
  const a = call(["claim", "TASK-CAMP-004", "--agent", "ai:alpha", "--lease", "30", root]);
  assert.equal(a.envelope.ok, true, a.stdout);
  assert.equal(a.envelope.data.agent, "ai:alpha");
  assert.deepEqual(a.envelope.data.paths, ["apps/web/src/calendar/**"], "the task's allowed paths are the default");
  assert.equal(a.envelope.events.length, 1, "a claim is an event in the change log");

  // Another task whose paths overlap (given by hand: it lists campaigns, we claim a calendar file).
  const b = call(["claim", "TASK-CAMP-005", "--agent", "ai:beta", "--paths", "apps/web/src/calendar/x.ts", root]);
  assert.equal(b.status, 1);
  assert.equal(b.envelope.error.code, "CLAIM_CONFLICT");
  assert.equal(b.envelope.error.details.holder, "ai:alpha");
  assert.deepEqual(b.envelope.error.details.holder_paths, ["apps/web/src/calendar/**"]);
  assert.match(b.envelope.error.message, /ai:alpha/);

  // Non-overlapping paths are fine, for a different agent.
  const c = call(["claim", "TASK-CAMP-005", "--agent", "ai:beta", root]);
  assert.equal(c.envelope.ok, true, c.stdout);

  // The same task by another agent conflicts too.
  assert.equal(call(["claim", "TASK-CAMP-004", "--agent", "ai:beta", root]).envelope.error.code, "CLAIM_CONFLICT");
  // The holder renews.
  const again = call(["claim", "TASK-CAMP-004", "--agent", "ai:alpha", root]);
  assert.equal(again.envelope.data.renewed, true);

  // Only the holder releases; then the paths are free.
  const bad = call(["claim", "TASK-CAMP-004", "--release", "--agent", "ai:beta", root]);
  assert.equal(bad.envelope.error.code, "NOT_CLAIM_HOLDER");
  assert.equal(call(["claim", "TASK-CAMP-004", "--release", "--agent", "ai:alpha", root]).envelope.data.released, true);
  assert.equal(call(["claim", "TASK-CAMP-004", "--agent", "ai:beta", root]).envelope.ok, true);
  const list = call(["claim", "--list", root]).envelope.data.claims;
  assert.deepEqual(list.map((x) => [x.task, x.agent]), [["TASK-CAMP-004", "ai:beta"], ["TASK-CAMP-005", "ai:beta"]]);
});

test("C2: a lease expires: after it ends the paths are free for another agent", async () => {
  const root = copyFixture("greenfield");
  assert.equal(call(["claim", "TASK-CAMP-004", "--agent", "ai:alpha", "--lease", "0.04", root]).envelope.ok, true);
  assert.equal(call(["claim", "TASK-CAMP-004", "--agent", "ai:beta", root]).envelope.error.code, "CLAIM_CONFLICT", "live for 2.4 seconds");
  await sleep(3000);
  assert.deepEqual(call(["claim", "--list", root]).envelope.data.claims, [], "an expired lease is not live");
  const b = call(["claim", "TASK-CAMP-004", "--agent", "ai:beta", root]);
  assert.equal(b.envelope.ok, true, b.stdout);
  assert.equal(call(["claim", "TASK-CAMP-004", "--lease", "0", root]).envelope.error.code, "INVALID_INPUT");
});

test("the holder is checked on task start and done (NOT_CLAIM_HOLDER); a task nobody claimed is open to everyone", () => {
  const root = copyFixture("greenfield");
  call(["claim", "TASK-CAMP-004", "--agent", "ai:alpha", root]);
  const done = call(["task", "TASK-CAMP-004", "done", "--note", "finished", "--by", "ai:beta", root]);
  assert.equal(done.status, 1);
  assert.equal(done.envelope.error.code, "NOT_CLAIM_HOLDER");
  assert.match(done.envelope.error.message, /ai:alpha/);
  // Nobody holds TASK-CAMP-005: the same call is not refused for claims (it may be refused for other reasons).
  const open = call(["task", "TASK-CAMP-005", "block", "--note", "waiting", "--by", "ai:beta", root]);
  assert.equal(open.envelope.ok, true, open.stdout);
});

test("task done releases the claim (the task is done, so its claim is no longer live)", () => {
  const root = copyFixture("greenfield");
  call(["claim", "TASK-CAMP-004", "--agent", "ai:alpha", root]);
  let model = buildModel(root);
  assert.equal(claims.liveClaims(model).length, 1);
  const change = model.changes.get("CHG-CAMP-002");
  appendEvent(path.join(model.root, change.dir), change.id, { event: "task.done", target: "TASK-CAMP-004", by: "ai:alpha", note: "done" });
  model = buildModel(root);
  assert.equal(claims.liveClaims(model).length, 0);
  assert.equal(call(["claim", "TASK-CAMP-004", root]).envelope.error.code, "GATE_REFUSED", "a done task cannot be claimed");
});

test("request-approval only writes a request: nothing is approved", () => {
  const root = copyFixture("greenfield");
  const approvedBefore = call(["events", root, "--change", "CHG-CAMP-002"]).envelope.data.events.filter((e) => e.event === "change.approved").length;
  const r = call(["request-approval", "CHG-CAMP-002", "--act", "approve-change", "--note", "Please look.", "--by", "ai:claude", root]);
  assert.equal(r.envelope.ok, true, r.stdout);
  assert.equal(r.envelope.data.approved, false);
  assert.equal(r.envelope.data.requested_by, "ai:claude");
  const events = call(["events", root, "--change", "CHG-CAMP-002"]).envelope.data.events;
  assert.ok(events.some((e) => e.event === "approval.requested" && /approve-change/.test(e.note)));
  assert.equal(events.filter((e) => e.event === "change.approved").length, approvedBefore, "no approval was added");
  assert.equal(call(["request-approval", "CHG-CAMP-002", "--act", "approve-everything", root]).envelope.error.code, "INVALID_INPUT");
});

test("events --follow --json streams each new event as one JSON line", async () => {
  const root = copyFixture("greenfield");
  const child = spawn(process.execPath, [BIN, "events", "--follow", "--json", "--timeout", "30", "--path", root], { env });
  let out = "";
  child.stdout.on("data", (d) => { out += d; });
  try {
    await sleep(900);
    assert.equal(out, "", "events that were already in the log are not repeated");
    call(["claim", "TASK-CAMP-004", "--agent", "ai:alpha", root]);
    call(["request-approval", "CHG-CAMP-002", "--act", "approve-change", "--by", "ai:claude", root]);
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline && out.split("\n").filter(Boolean).length < 2) await sleep(100);
  } finally {
    child.kill();
  }
  const lines = out.split("\n").filter(Boolean).map((l) => JSON.parse(l));
  assert.deepEqual(lines.map((e) => e.event).sort(), ["approval.requested", "claim.acquired"]);
  for (const e of lines) {
    assert.match(e.id, /^EVT-CHG-CAMP-00\d-\d{4}$/);
    assert.deepEqual(Object.keys(e), ["id", "change", "when", "event", "target", "by", "git", "note"], "the same shape `events` returns");
  }
  const claim = lines.find((e) => e.event === "claim.acquired");
  const note = JSON.parse(claim.note);
  assert.deepEqual([note.agent, note.paths], ["ai:alpha", ["apps/web/src/calendar/**"]]);
  assert.ok(Date.parse(note.lease_until) > Date.now() - 1000, "the claim event carries task, agent, paths and lease_until");
  assert.equal(claim.target, "TASK-CAMP-004");
});
