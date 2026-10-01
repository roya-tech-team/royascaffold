"use strict";

// The machine contract (plan file 01 §3): one envelope for every --json result, stable error codes.
// Other programs rely on this, so it stays boring: adding fields is a minor change, removing or
// renaming anything is a major one (docs/CONTRACT.md).

const fs = require("fs");
const path = require("path");

const CONTRACT_VERSION = "1.0";

// The stable error codes. This table is the source: the CLI must run from a copied bin/lib with no
// package folders beside it (tests/boundary), so it cannot read a file at load time. The published
// copy for other programs is contract/errors.json; a test keeps the two identical
// (`node -e "require('./lib/contract.cjs').writeErrorsFile()"` rewrites it).
// `exit` is the process status in --json mode: 1 = refused or failed, 2 = the call itself was wrong.
const ERRORS = {
  NOT_A_PROJECT: { exit: 1, description: "The path does not exist or holds no RoyaScaff project." },
  UNKNOWN_ID: { exit: 1, description: "A record, task, change, slice, feature or backup the call names does not exist." },
  GATE_REFUSED: { exit: 1, description: "A gate refused the step; `missing` lists what must be done first." },
  HUMAN_REQUIRED: { exit: 1, description: "Only a person can do this step (an approval, a look, a confirmation); an AI or a script cannot." },
  STALE_APPROVAL: { exit: 1, description: "The approval no longer holds because what was approved has changed since." },
  OUTSIDE_PATHS: { exit: 1, description: "Files changed outside the paths the task allows." },
  CHECK_FAILED: { exit: 1, description: "A check the step depends on ran and failed." },
  VERSION_MISMATCH: { exit: 1, description: "The project, the engine or the requested version do not fit each other." },
  ALREADY_EXISTS: { exit: 1, description: "What the call would create, or the state it would set, is already there." },
  INVALID_INPUT: { exit: 2, description: "The call is malformed: a missing argument, a bad option value or wrong usage." },
  UNKNOWN_COMMAND: { exit: 2, description: "The command does not exist in this engine version." },
  INTERNAL: { exit: 1, description: "An error the engine has no stable code for yet; the message says what happened." },
};

const ERRORS_FILE_NOTE = "Stable error codes of the machine contract. Adding a code is a minor change; removing or renaming one is a major change (docs/CONTRACT.md). `exit` is the process exit status in --json mode: 1 = the work was refused or failed, 2 = the call itself was wrong. Generated from lib/contract.cjs.";

function errorsFileText() {
  return `${JSON.stringify({ contract: "1.0", note: ERRORS_FILE_NOTE, codes: ERRORS }, null, 2)}\n`;
}

function writeErrorsFile() {
  fs.writeFileSync(path.join(__dirname, "..", "contract", "errors.json"), errorsFileText());
}

let ENGINE_VERSION = "unknown";
try {
  ENGINE_VERSION = require("../package.json").version;
} catch {
  // Running from a copied lib without the package manifest.
}

// Every command the CLI dispatches (a test keeps this in step with bin/royascaff.cjs).
const COMMANDS = [
  "adopt", "advance", "approve", "backups", "block", "brief", "cache", "check", "context", "continue", "contract",
  "events", "export", "feedback", "index", "init", "install", "log", "measure", "migrate", "new", "next", "open", "record",
  "refine", "render", "roundtrip", "show", "smoke", "status", "task", "tasks", "trace", "unblock", "usage", "validate", "where",
];

// The engine's messages are plain sentences. Until each throw site carries its own `code`, this
// table gives them a stable one. First match wins, so the specific patterns come first. An error
// with a valid `code` of its own always wins over the table.
const RULES = [
  ["NOT_A_PROJECT", /No RoyaScaff project found|Path does not exist/],
  ["VERSION_MISMATCH", /already on RoyaScaff 1\.4|Unknown source version|does not match the project|Plan approvals are for RoyaScaff 1\.4|Could not tell whether this is a 1\.3/],
  ["OUTSIDE_PATHS", /outside its allowed paths/],
  ["CHECK_FAILED", /quick checks failed/],
  ["HUMAN_REQUIRED", /must come from a person|[Oo]nly a person|confirmed in a terminal|Look not recorded/],
  ["STALE_APPROVAL", /changed since it was approved|changed since its plan was approved|needs refinement/],
  ["UNKNOWN_ID", /\bis not an? (task|change|slice|feature|outcome|commit|app)\b|\bnot found$|^No backup |^Not features:|is not in profile\.md/],
  ["GATE_REFUSED", /not ready for approval|Approve the project first|^Not approved:|not approved yet|has no approved plan|waits for|is blocked:|tasks run only when|tests come first|is not marked done|approvals are given at|changes the approved plan|Tests already pass|^Not created:/],
  ["ALREADY_EXISTS", /already exists|already has|\bis already\b|already set up/],
  ["INVALID_INPUT", /Usage:|Use: |must be one of|\bmust be\b|\btakes "|Say (what|why)|needs --|needs a reason|Unknown (target status|adapter)|is not valid|Not a RoyaScaff exchange file|^Unknown:/],
];

const isCode = (c) => typeof c === "string" && Object.prototype.hasOwnProperty.call(ERRORS, c);

// Lines that start with "- " inside a message are the list of what is missing.
function missingOf(message) {
  return String(message)
    .split("\n")
    .map((l) => l.match(/^\s+-\s+(.*\S)\s*$/))
    .filter(Boolean)
    .map((m) => m[1]);
}

function classify(err) {
  const message = err && err.message ? String(err.message) : String(err);
  let code = isCode(err && err.code) ? err.code : null;
  if (!code) {
    const hit = RULES.find(([, re]) => re.test(message));
    code = hit ? hit[0] : "INTERNAL";
  }
  const out = { code, message };
  const missing = Array.isArray(err && err.missing) ? err.missing : missingOf(message);
  if (missing.length) out.missing = missing;
  return out;
}

const exitFor = (code) => (isCode(code) ? ERRORS[code].exit : 1);

function ok(command, data, extra = {}) {
  return { contract: CONTRACT_VERSION, engine: ENGINE_VERSION, ok: true, command, data, warnings: extra.warnings || [], events: extra.events || [] };
}

function failure(command, err, extra = {}) {
  const error = classify(err);
  if (extra.details !== undefined) error.details = extra.details; // the full result of a call that failed or was refused
  return { contract: CONTRACT_VERSION, engine: ENGINE_VERSION, ok: false, command, error, warnings: extra.warnings || [], events: extra.events || [] };
}

module.exports = { CONTRACT_VERSION, ENGINE_VERSION, ERRORS, COMMANDS, classify, exitFor, ok, failure, errorsFileText, writeErrorsFile };
