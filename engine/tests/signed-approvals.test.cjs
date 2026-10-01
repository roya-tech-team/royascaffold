"use strict";

// Work package E7a: signed approvals (plan file 03 §6 and the C3 cases of §8). A throwaway Ed25519
// key is made here; the project trusts it only when its public key is in approval_issuers on the
// default branch.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { call, copyFixture } = require("./contract-scenarios.cjs");
const { buildModel } = require("../lib/model/graph.cjs");
const { designHash } = require("../lib/gates.cjs");
const { roadmapHash, outcomeHash } = require("../lib/commands/approve.cjs");
const { isHuman } = require("../lib/approvals.cjs");
const { parseIssuers } = require("../lib/signed.cjs");
const contract = require("../lib/contract.cjs");

const ISSUER = "studio.example.com";
const pair = crypto.generateKeyPairSync("ed25519");
const other = crypto.generateKeyPairSync("ed25519");
const keyLine = (k) => `ed25519:${k.publicKey.export({ type: "spki", format: "der" }).toString("base64")}`;
const b64u = (b) => Buffer.from(b).toString("base64url");
const now = () => Math.floor(Date.now() / 1000);

function mint(claims, { key = pair.privateKey, header = { alg: "EdDSA", typ: "JWT" } } = {}) {
  const h = b64u(JSON.stringify(header));
  const p = b64u(JSON.stringify(claims));
  const sig = key ? crypto.sign(null, Buffer.from(`${h}.${p}`), key) : Buffer.alloc(0);
  return `${h}.${p}.${b64u(sig)}`;
}

const claimsFor = (o) => ({ iss: ISSUER, sub: "user-42", name: "Ada Lovelace", act: "approve-change", target: "CHG-CAMP-003", hash: "0000000000", note: "I read the design", iat: now(), exp: now() + 300, jti: crypto.randomUUID(), ...o });

const git = (root, ...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "Dev", GIT_AUTHOR_EMAIL: "d@e.com", GIT_COMMITTER_NAME: "Dev", GIT_COMMITTER_EMAIL: "d@e.com" } }).trim();
const profileOf = (root) => path.join(root, "project", "profile.md");
const issuersBlock = (list) => (list.length ? `approval_issuers:\n${list.map((i) => `  - id: ${i.id}\n    key: ${i.key}`).join("\n")}\n` : "");
const withIssuers = (text, list) => text.replace("project_name: Campaign Planner\n", `project_name: Campaign Planner\n${issuersBlock(list)}`);

// A project in git on `main` that trusts the test issuer, with CHG-CAMP-003 waiting for its design approval.
function project({ issuers = [{ id: ISSUER, key: keyLine(pair) }], branch = "main", adapter = false } = {}) {
  const root = copyFixture("greenfield");
  fs.writeFileSync(profileOf(root), withIssuers(fs.readFileSync(profileOf(root), "utf8"), issuers).replace("royascaff: 1.4\n", adapter ? "royascaff: 1.4\nadapters: [web-ui]\n" : "royascaff: 1.4\n"));
  const change = path.join(root, "project", "changes", "CHG-CAMP-003", "change.md");
  fs.writeFileSync(change, fs.readFileSync(change, "utf8").replace(/^status: .*$/m, "status: analyzed"));
  git(root, "init", "-q", "-b", branch);
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "initial");
  return root;
}

const model = (root) => buildModel(root);
const designOf = (root, id = "CHG-CAMP-003") => { const m = model(root); return designHash(m.root, m.changes.get(id)); };
const approve = (root, token, extraArgs = [], extraEnv = {}) => call(["approve", "CHG-CAMP-003", "--approval-token", token, ...extraArgs, root], { ROYASCAFF_NONINTERACTIVE: "1", ...extraEnv });
const approvedEvents = (root) => call(["events", root, "--change", "CHG-CAMP-003"]).envelope.data.events.filter((e) => e.event === "change.approved");

test("the new error codes are in the contract table, errors.json and the envelope schema", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "contract", "schemas", "envelope.schema.json"), "utf8"));
  for (const code of ["ISSUER_LIST_CHANGED", "TOKEN_EXPIRED", "TOKEN_REUSED", "TOKEN_INVALID", "WRONG_TARGET", "HASH_MISMATCH"]) {
    assert.equal(contract.exitFor(code), 1, code);
    assert.ok(schema.definitions.error.properties.code.enum.includes(code), `${code} in the envelope schema`);
    assert.ok(contract.ERRORS[code].description.length > 20);
  }
});

test("C3 valid: a token from a trusted issuer approves, even in non-interactive mode and from an AI's shell; the log says who and keeps the jti", () => {
  const root = project();
  const jti = crypto.randomUUID();
  const token = mint(claimsFor({ hash: designOf(root), jti }));
  const r = approve(root, token, ["--by", "ai:claude"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(r.envelope.ok, true);
  assert.equal(r.envelope.data.by, `user-42 via ${ISSUER}`);
  assert.equal(r.envelope.data.signed, true);
  assert.equal(r.envelope.data.jti, jti);
  const [event] = approvedEvents(root);
  assert.equal(event.by, `user-42 via ${ISSUER}`);
  assert.ok(event.note.includes(`design ${designOf(root)}`), "the design hash stays in the note, so the gate sees it");
  assert.ok(event.note.includes(`jti ${jti}`), "the jti is recorded");
  assert.ok(event.note.includes("Ada Lovelace") && event.note.includes("I read the design"), "the person's name and note are kept");
  assert.equal(isHuman(event.by), true, "a signed approval counts as a person's approval at the gates");
  assert.ok(r.envelope.events.length === 1 && /^EVT-CHG-CAMP-003-/.test(r.envelope.events[0]));
});

test("C3 valid: the token can come from ROYASCAFF_APPROVAL_TOKEN", () => {
  const root = project();
  const token = mint(claimsFor({ hash: designOf(root) }));
  const r = call(["approve", "CHG-CAMP-003", root], { ROYASCAFF_NONINTERACTIVE: "1", ROYASCAFF_APPROVAL_TOKEN: token });
  assert.equal(r.envelope.ok, true, r.stdout);
  assert.equal(r.envelope.data.by, `user-42 via ${ISSUER}`);
});

test("C3 valid: a signed approval of the project, of a feature and of the roadmap, a measure and a look", () => {
  const root = project({ adapter: true });
  const m = model(root);
  const env = { ROYASCAFF_NONINTERACTIVE: "1" };
  const tok = (act, target, hash, extra = {}) => mint(claimsFor({ act, target, hash, ...extra }));
  const via = `user-42 via ${ISSUER}`;

  const proj = call(["approve", "project", "--approval-token", tok("approve-project", "project", m.approvals.project.hash), root], env);
  assert.equal(proj.envelope.ok, true, proj.stdout);
  assert.equal(proj.envelope.data.by, via);

  const cap = "CAP-CAMP-002";
  const feat = call(["approve", cap, "--approval-token", tok("approve-roadmap", cap, m.approvals.features.get(cap).hash), root], env);
  assert.equal(feat.envelope.ok, true, feat.stdout);
  assert.equal(feat.envelope.data.by, via);

  const caps = [...m.features.values()].filter((f) => ["now", "next"].includes(f.horizon)).map((f) => f.id);
  const road = call(["approve", "roadmap", "--approval-token", tok("approve-roadmap", "roadmap", roadmapHash(caps.map((id) => [id, m.approvals.features.get(id).hash]))), root], env);
  assert.ok(road.envelope.ok || !["WRONG_TARGET", "HASH_MISMATCH", "TOKEN_INVALID"].includes(road.envelope.error.code), `a roadmap token is accepted for the roadmap (the only refusal allowed is that nothing is left to approve): ${road.stdout}`);

  const measured = call(["measure", "OUT-CAMP-001", "--result", "met", "--note", "from the dashboard", "--approval-token", tok("measure", "OUT-CAMP-001", outcomeHash(m, "OUT-CAMP-001")), root], env);
  assert.equal(measured.envelope.ok, true, measured.stdout);
  assert.equal(measured.envelope.data.by, via);

  const design = designOf(root, "CHG-CAMP-001");
  const look = call(["check", "CHG-CAMP-001", "--result", "pass", "--note", "looked", "--bar", "all", "--approval-token", tok("person-check", "CHG-CAMP-001", design, { bar: "all" }), root], env);
  assert.equal(look.envelope.ok, true, look.stdout);
  const log = call(["events", root]).envelope.data.events;
  const lookEvent = log.find((e) => e.event === "check.run" && e.by === via);
  assert.ok(lookEvent && /look:signed/.test(lookEvent.note) && /bar: all/.test(lookEvent.note), "the look is logged as signed");
  assert.ok(log.some((e) => e.event === "project.approved" && e.by === via));
  assert.ok(log.some((e) => e.event === "outcome.measured" && e.by === via));

  // The bar in the token must be the bar on the command line.
  const wrongBar = call(["check", "CHG-CAMP-001", "--result", "pass", "--note", "looked", "--bar", "1,2", "--approval-token", tok("person-check", "CHG-CAMP-001", design, { bar: "all" }), root], env);
  assert.equal(wrongBar.envelope.error.code, "WRONG_TARGET");
});

test("C3 expired: refused with TOKEN_EXPIRED, and nothing is recorded", () => {
  const root = project();
  const t = now();
  const r = approve(root, mint(claimsFor({ hash: designOf(root), iat: t - 700, exp: t - 100 })));
  assert.equal(r.status, 1);
  assert.equal(r.envelope.error.code, "TOKEN_EXPIRED");
  assert.deepEqual(approvedEvents(root), []);
});

test("a token that may live longer than 10 minutes is TOKEN_INVALID", () => {
  const root = project();
  const r = approve(root, mint(claimsFor({ hash: designOf(root), iat: now(), exp: now() + 601 })));
  assert.equal(r.envelope.error.code, "TOKEN_INVALID");
  assert.match(r.envelope.error.message, /10 minutes/);
});

test("C3 reused: the same token a second time is TOKEN_REUSED", () => {
  const root = project();
  const token = mint(claimsFor({ hash: designOf(root) }));
  assert.equal(approve(root, token).envelope.ok, true);
  const again = approve(root, token);
  assert.equal(again.status, 1);
  assert.equal(again.envelope.error.code, "TOKEN_REUSED");
  assert.equal(approvedEvents(root).length, 1, "recorded once");
});

test("C3 wrong issuer: a token from an issuer the project does not trust is TOKEN_INVALID", () => {
  const root = project();
  const unknownIssuer = approve(root, mint(claimsFor({ iss: "evil.example.com", hash: designOf(root) })));
  assert.equal(unknownIssuer.envelope.error.code, "TOKEN_INVALID");
  assert.match(unknownIssuer.envelope.error.message, /not trusted/);
  // The right issuer name signed with the wrong key.
  const forged = approve(root, mint(claimsFor({ hash: designOf(root) }), { key: other.privateKey }));
  assert.equal(forged.envelope.error.code, "TOKEN_INVALID");
  assert.match(forged.envelope.error.message, /signature/);
  assert.deepEqual(approvedEvents(root), []);
});

test("C3 wrong target: a token for another change or another act is WRONG_TARGET", () => {
  const root = project();
  const h = designOf(root);
  assert.equal(approve(root, mint(claimsFor({ target: "CHG-CAMP-002", hash: h }))).envelope.error.code, "WRONG_TARGET");
  assert.equal(approve(root, mint(claimsFor({ act: "approve-project", hash: h }))).envelope.error.code, "WRONG_TARGET");
  assert.deepEqual(approvedEvents(root), []);
});

test("C3 changed hash: the design changed after the person looked, so HASH_MISMATCH", () => {
  const root = project();
  const token = mint(claimsFor({ hash: designOf(root) }));
  const change = path.join(root, "project", "changes", "CHG-CAMP-003", "change.md");
  fs.writeFileSync(change, `${fs.readFileSync(change, "utf8")}\nAn extra sentence added after the person looked.\n`);
  const r = approve(root, token);
  assert.equal(r.status, 1);
  assert.equal(r.envelope.error.code, "HASH_MISMATCH");
  assert.deepEqual(approvedEvents(root), []);
});

test("C3 issuer added only in the working tree: every token is refused with ISSUER_LIST_CHANGED", () => {
  // The default branch trusts nobody; an agent adds its own key to the working tree and signs a token.
  const root = project({ issuers: [] });
  fs.writeFileSync(profileOf(root), withIssuers(fs.readFileSync(profileOf(root), "utf8"), [{ id: ISSUER, key: keyLine(pair) }]));
  const r = approve(root, mint(claimsFor({ hash: designOf(root) })));
  assert.equal(r.status, 1);
  assert.equal(r.envelope.error.code, "ISSUER_LIST_CHANGED");
  assert.deepEqual(approvedEvents(root), []);

  // A second issuer added beside a trusted one: even the trusted issuer's valid token is refused.
  const root2 = project();
  const profile = profileOf(root2);
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace(`    key: ${keyLine(pair)}\n`, `    key: ${keyLine(pair)}\n  - id: agent.example.com\n    key: ${keyLine(other)}\n`));
  const r2 = approve(root2, mint(claimsFor({ hash: designOf(root2) })));
  assert.equal(r2.envelope.error.code, "ISSUER_LIST_CHANGED");

  // Committing the new list on a side branch does not help: only the default branch counts.
  git(root2, "switch", "-q", "-c", "agent-work");
  git(root2, "add", "-A");
  git(root2, "commit", "-q", "-m", "trust my own key");
  assert.equal(approve(root2, mint(claimsFor({ hash: designOf(root2) }))).envelope.error.code, "ISSUER_LIST_CHANGED");
});

test("the issuers are read from the default branch even when another branch is checked out; ROYASCAFF_DEFAULT_BRANCH names it", () => {
  const root = project({ branch: "trunk" });
  const token = mint(claimsFor({ hash: designOf(root) }));
  const noBranch = approve(root, token);
  assert.equal(noBranch.envelope.error.code, "TOKEN_INVALID", "there is no main or master here");
  const r = approve(root, token, [], { ROYASCAFF_DEFAULT_BRANCH: "trunk" });
  assert.equal(r.envelope.ok, true, r.stdout);
});

test("a project that is not in git trusts no issuer", () => {
  const root = copyFixture("greenfield");
  fs.writeFileSync(profileOf(root), withIssuers(fs.readFileSync(profileOf(root), "utf8"), [{ id: ISSUER, key: keyLine(pair) }]));
  const change = path.join(root, "project", "changes", "CHG-CAMP-003", "change.md");
  fs.writeFileSync(change, fs.readFileSync(change, "utf8").replace(/^status: .*$/m, "status: analyzed"));
  const r = approve(root, mint(claimsFor({ hash: designOf(root) })));
  assert.equal(r.envelope.error.code, "TOKEN_INVALID");
  assert.match(r.envelope.error.message, /No trusted issuer list/);
});

test("malformed tokens: not three parts, a wrong algorithm, a changed payload, a missing claim are TOKEN_INVALID", () => {
  const root = project();
  const h = designOf(root);
  const good = mint(claimsFor({ hash: h }));
  assert.equal(approve(root, "not-a-token").envelope.error.code, "TOKEN_INVALID");
  assert.equal(approve(root, mint(claimsFor({ hash: h }), { header: { alg: "none" }, key: null })).envelope.error.code, "TOKEN_INVALID");
  assert.equal(approve(root, mint(claimsFor({ hash: h }), { header: { alg: "HS256" } })).envelope.error.code, "TOKEN_INVALID");
  const [head, , sig] = good.split(".");
  assert.equal(approve(root, `${head}.${b64u(JSON.stringify(claimsFor({ hash: h, target: "CHG-CAMP-003", note: "tampered" })))}.${sig}`).envelope.error.code, "TOKEN_INVALID", "the payload changed after signing");
  const noJti = claimsFor({ hash: h });
  delete noJti.jti;
  assert.equal(approve(root, mint(noJti)).envelope.error.code, "TOKEN_INVALID");
  assert.deepEqual(approvedEvents(root), []);
});

test("without a token the terminal path is unchanged (a named person approves as before)", () => {
  const root = project();
  const r = call(["approve", "CHG-CAMP-003", "--by", "islam", root]);
  assert.equal(r.envelope.ok, true);
  assert.equal(r.envelope.data.by, "islam");
  assert.equal(r.envelope.data.signed, undefined);
});

test("parseIssuers reads the committed list and ignores the rest of the front matter", () => {
  const text = `---\nproject_code: CAMP\napproval_issuers:\n  - id: a.example.com\n    key: ed25519:AAAA\n  - id: "b.example.com"\n    key: ed25519:BBBB\nroyascaff: 1.4\n---\n\n# Body\n- id: not.an.issuer\n`;
  assert.deepEqual(parseIssuers(text), [{ id: "a.example.com", key: "ed25519:AAAA" }, { id: "b.example.com", key: "ed25519:BBBB" }]);
  assert.deepEqual(parseIssuers("---\nproject_code: CAMP\n---\n"), []);
  assert.deepEqual(parseIssuers("no front matter"), []);
});

test("the profile with approval_issuers still round-trips byte for byte", () => {
  const root = project();
  const rt = call(["roundtrip", root]);
  assert.equal(rt.envelope.ok, true, rt.stdout);
});
