"use strict";

// Signed approvals (plan file 03 §6). A person's approval, look or measure can arrive as a short
// signed token from an issuer the project trusts, so it can be given in a browser, with no terminal.
//
// The token is a compact JWS: header { alg: "EdDSA" } (Ed25519), claims
//   iss  the issuer's ID         sub  the person's stable ID        name  the display name
//   act  approve-project | approve-roadmap | approve-change | person-check | measure
//   target  the ID approved      hash  the fingerprint of what the person saw
//   bar  for a look: the bar lines that pass (all, 1,2,4, none)     note  the person's note
//   iat, exp  seconds; exp - iat is at most 10 minutes              jti  single use
//
// Anti-self-approval: the issuers and their public keys come ONLY from the profile as committed on
// the default branch (`git show <default>:project/profile.md`), never from the working tree, which an
// agent can write to. If the working tree's list differs from the committed one, every token is
// refused (ISSUER_LIST_CHANGED). Changing the list is a human-only change that a person merges.
//
// Only node:crypto is used: no dependencies.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { git } = require("./git.cjs");

const ACTS = ["approve-project", "approve-roadmap", "approve-change", "person-check", "measure"];
const MAX_LIFETIME_S = 600;
const FUTURE_SKEW_S = 60;
const SAFE_ID = /^[A-Za-z0-9._@:+-]{1,128}$/;
const SAFE_JTI = /^[A-Za-z0-9._-]{8,128}$/;
const SPKI_ED25519_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function refuse(code, message, missing = []) {
  return Object.assign(new Error(message), { code, missing });
}

// ---- the trusted issuers --------------------------------------------------------------------

// Reads the `approval_issuers` list from the front matter of profile.md text:
//   approval_issuers:
//     - id: studio.example.com
//       key: ed25519:<base64 of the public key>
// The shared front matter reader handles flat keys only, so this list has its own small reader.
function parseIssuers(profileText) {
  const fm = String(profileText || "").replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!fm) return [];
  const lines = fm[1].split("\n");
  const start = lines.findIndex((l) => /^approval_issuers:\s*$/.test(l));
  if (start < 0) return [];
  const issuers = [];
  let current = null;
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) break; // the next top-level key
    const item = line.match(/^\s*-\s+(\w+):\s*(.*?)\s*$/);
    const more = line.match(/^\s+(\w+):\s*(.*?)\s*$/);
    if (item) {
      current = { [item[1]]: unquote(item[2]) };
      issuers.push(current);
    } else if (more && current) current[more[1]] = unquote(more[2]);
  }
  return issuers.filter((i) => i.id && i.key).map((i) => ({ id: i.id, key: i.key }));
}

const unquote = (v) => (/^(["']).*\1$/.test(v) ? v.slice(1, -1) : v);

// The default branch: ROYASCAFF_DEFAULT_BRANCH, else the remote's HEAD, else main or master.
function defaultBranch(repo) {
  if (process.env.ROYASCAFF_DEFAULT_BRANCH) return process.env.ROYASCAFF_DEFAULT_BRANCH;
  const remote = git(repo, ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"]);
  if (remote) return remote;
  for (const name of ["main", "master"]) if (git(repo, ["rev-parse", "--verify", "--quiet", `refs/heads/${name}`])) return name;
  return null;
}

const sameList = (a, b) => JSON.stringify([...a].map((i) => [i.id, i.key]).sort()) === JSON.stringify([...b].map((i) => [i.id, i.key]).sort());

// { committed, branch } or throws: the list as committed on the default branch, checked against the working tree.
function trustedIssuers(model) {
  const profileRel = path.relative(model.repo, path.join(model.root, "profile.md")).split(path.sep).join("/");
  const branch = defaultBranch(model.repo);
  if (!branch) throw refuse("TOKEN_INVALID", "No trusted issuer list: this is not a git repository with a default branch, so no issuer is trusted.", ["commit approval_issuers in project/profile.md on the default branch (a person merges it)"]);
  const committedText = git(model.repo, ["show", `${branch}:./${profileRel}`]);
  if (committedText === null) throw refuse("TOKEN_INVALID", `No trusted issuer list: ${profileRel} is not committed on ${branch}.`, [`commit ${profileRel} with approval_issuers on ${branch} (a person merges it)`]);
  const committed = parseIssuers(committedText);
  const file = path.join(model.root, "profile.md");
  const working = fs.existsSync(file) ? parseIssuers(fs.readFileSync(file, "utf8")) : [];
  if (!sameList(committed, working)) {
    throw refuse("ISSUER_LIST_CHANGED", `approval_issuers in the working tree differs from ${branch}: no token is accepted until a person merges the change.`, ["restore approval_issuers to what is committed on the default branch, or have a person approve and merge the new list"]);
  }
  return { committed, branch };
}

function publicKeyOf(issuer) {
  const m = String(issuer.key).match(/^ed25519:([A-Za-z0-9+/_=-]+)$/);
  if (!m) throw refuse("TOKEN_INVALID", `The key of issuer ${issuer.id} is not an ed25519 public key.`);
  let der = Buffer.from(m[1], "base64");
  if (der.length === 32) der = Buffer.concat([SPKI_ED25519_PREFIX, der]); // a bare 32-byte key
  try {
    return crypto.createPublicKey({ key: der, format: "der", type: "spki" });
  } catch {
    throw refuse("TOKEN_INVALID", `The key of issuer ${issuer.id} cannot be read.`);
  }
}

// ---- the token -------------------------------------------------------------------------------

function decodeJson(part, what) {
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    throw refuse("TOKEN_INVALID", `The approval token is not valid: its ${what} cannot be read.`);
  }
}

// Reads the claims without trusting them (for the checks that come before the signature).
function parseToken(token) {
  const parts = String(token).trim().split(".");
  if (parts.length !== 3 || parts.some((p) => !/^[A-Za-z0-9_-]+$/.test(p))) throw refuse("TOKEN_INVALID", "The approval token is not valid: it must be a compact JWS (three parts).");
  const header = decodeJson(parts[0], "header");
  const claims = decodeJson(parts[1], "claims");
  if (!header || header.alg !== "EdDSA") throw refuse("TOKEN_INVALID", 'The approval token is not valid: the algorithm must be "EdDSA" (Ed25519).');
  if (!claims || typeof claims !== "object" || Array.isArray(claims)) throw refuse("TOKEN_INVALID", "The approval token is not valid: the claims are not an object.");
  return { signingInput: `${parts[0]}.${parts[1]}`, signature: Buffer.from(parts[2], "base64url"), claims };
}

// Every approval keeps its token's jti in the logs ("jti <id>" in the event note). A jti found
// there was used before.
function jtiUsed(model, jti) {
  const re = new RegExp(`(^|[^A-Za-z0-9._-])jti ${jti.replace(/[.]/g, "\\.")}($|[^A-Za-z0-9._-])`);
  const events = [...(model.approvals ? model.approvals.events : []), ...[...model.changes.values()].flatMap((c) => c.events || [])];
  return events.some((e) => re.test(e.note || ""));
}

// Checks a token for one step. `expect` = { act, target, hash, bar? } is what the engine is about to
// record: the token must be for exactly that. Returns what to record, or throws with a contract code.
function verifyApprovalToken(model, token, expect, now = Math.floor(Date.now() / 1000)) {
  const { committed } = trustedIssuers(model); // ISSUER_LIST_CHANGED comes before anything else
  const { signingInput, signature, claims } = parseToken(token);
  const str = (k) => (typeof claims[k] === "string" && claims[k] ? claims[k] : null);
  for (const k of ["iss", "sub", "name", "act", "target", "hash", "jti"]) if (!str(k)) throw refuse("TOKEN_INVALID", `The approval token is not valid: claim "${k}" is missing.`);
  if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp)) throw refuse("TOKEN_INVALID", 'The approval token is not valid: "iat" and "exp" must be whole seconds.');

  const issuer = committed.find((i) => i.id === claims.iss);
  if (!issuer) throw refuse("TOKEN_INVALID", `The issuer "${String(claims.iss).slice(0, 80)}" is not trusted by this project (it is not in approval_issuers on the default branch).`, ["an issuer listed in approval_issuers on the default branch"]);
  if (!crypto.verify(null, Buffer.from(signingInput), publicKeyOf(issuer), signature)) throw refuse("TOKEN_INVALID", `The signature does not match the key of issuer ${issuer.id}.`);

  // Signed and trusted: now what it says.
  if (claims.exp - claims.iat > MAX_LIFETIME_S || claims.exp <= claims.iat) throw refuse("TOKEN_INVALID", "The approval token is not valid: it may live at most 10 minutes (exp - iat).");
  if (claims.iat > now + FUTURE_SKEW_S) throw refuse("TOKEN_INVALID", "The approval token is not valid: it was issued in the future.");
  if (claims.exp <= now) throw refuse("TOKEN_EXPIRED", "The approval token has expired. Ask the issuer for a new one.", ["a fresh token (they last 10 minutes)"]);
  if (!SAFE_ID.test(claims.sub) || !SAFE_ID.test(claims.iss)) throw refuse("TOKEN_INVALID", 'The approval token is not valid: "sub" and "iss" may hold only letters, digits and . _ @ : + -.');
  if (!SAFE_JTI.test(claims.jti)) throw refuse("TOKEN_INVALID", 'The approval token is not valid: "jti" must be 8 to 128 letters, digits, . _ or -.');
  if (!ACTS.includes(claims.act)) throw refuse("TOKEN_INVALID", `The approval token is not valid: unknown act "${String(claims.act).slice(0, 40)}".`);

  if (claims.act !== expect.act || claims.target !== expect.target) {
    throw refuse("WRONG_TARGET", `The token is for ${claims.act} of ${String(claims.target).slice(0, 60)}, but this call is ${expect.act} of ${expect.target}.`, [`a token with act ${expect.act} and target ${expect.target}`]);
  }
  if (claims.hash !== expect.hash) {
    throw refuse("HASH_MISMATCH", `${expect.target} has changed since the person saw it (the token has ${String(claims.hash).slice(0, 20)}, the repository has ${expect.hash}). Ask for a new approval.`, [`a token for ${expect.target} with hash ${expect.hash}`]);
  }
  if (expect.bar !== undefined && expect.bar !== null && String(expect.bar) !== String(claims.bar === undefined ? "" : claims.bar)) {
    throw refuse("WRONG_TARGET", "The bar in the token is not the bar given with --bar.", ["the same --bar as in the token, or leave --bar out"]);
  }
  if (jtiUsed(model, claims.jti)) throw refuse("TOKEN_REUSED", `This token was already used (jti ${claims.jti}). A token works once.`, ["a fresh token"]);

  const clean = (s) => String(s || "").replace(/[\r\n|]+/g, " ").slice(0, 120);
  return { by: `${claims.sub} via ${claims.iss}`, sub: claims.sub, iss: claims.iss, name: clean(claims.name), jti: claims.jti, personNote: clean(claims.note), bar: claims.bar === undefined ? null : String(claims.bar), signed: true };
}

// What an approval event's note carries so the step can be traced and the jti cannot be reused.
const signedNote = (v) => ` · signed by ${v.name} · jti ${v.jti}`;

module.exports = { ACTS, MAX_LIFETIME_S, parseIssuers, defaultBranch, trustedIssuers, parseToken, verifyApprovalToken, jtiUsed, signedNote };
