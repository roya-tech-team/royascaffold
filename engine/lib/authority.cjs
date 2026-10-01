"use strict";

// Who may do the steps only a person can do (an approval, a look, a measure), and how the engine
// knows it was a person. Two proofs exist: a person at a terminal, or a signed approval token
// from an issuer the project trusts. In non-interactive mode (ROYASCAFF_NONINTERACTIVE=1) nothing
// is ever asked, so only the token can prove it; without one the call returns HUMAN_REQUIRED
// and says what is needed.

const { who } = require("./identity.cjs");
const { isHuman } = require("./approvals.cjs");
const signed = require("./signed.cjs");

const nonInteractive = () => process.env.ROYASCAFF_NONINTERACTIVE === "1";

const NEED_TOKEN = "a signed approval token from an issuer the project trusts (--approval-token or ROYASCAFF_APPROVAL_TOKEN), or a person running this in a terminal";

function refuse(code, message, missing = []) {
  return Object.assign(new Error(message), { code, missing });
}

// The name to record for a person's step, or an error saying what is needed.
function humanOnly(model, flags, what = "An approval") {
  const by = who(flags, model.repo);
  if (!isHuman(by)) throw refuse("HUMAN_REQUIRED", `${what} must come from a person, not "${by}". Run it yourself, or pass --by <your name>.`, ["a person: run it yourself in a terminal", NEED_TOKEN]);
  if (nonInteractive()) throw refuse("HUMAN_REQUIRED", `${what} must come from a person, and nothing is asked in non-interactive mode (ROYASCAFF_NONINTERACTIVE=1).`, [NEED_TOKEN]);
  return by;
}

const tokenOf = (flags) => {
  const given = flags["approval-token"] !== undefined ? flags["approval-token"] : process.env.ROYASCAFF_APPROVAL_TOKEN;
  if (given === true) throw refuse("INVALID_INPUT", "--approval-token needs the token: --approval-token <jws> (or set ROYASCAFF_APPROVAL_TOKEN).");
  return given ? String(given) : null;
};

// A step only a person can do, in two parts so the readiness checks of a command can sit between them.
//   begin  - without a token, the person must be a person right away (as before); with a token nothing is decided yet.
//   finish - with a token, verify it for exactly this step: expect = { act, target, hash, bar? }.
// Returns { by, signed, jti?, name?, bar?, note } where `by` is what goes in the log: a name, or
// "<sub> via <issuer>" for a signed approval, and `note` is the text to add to the event note.
function begin(model, flags, what = "An approval") {
  const token = tokenOf(flags);
  return token ? { token } : { by: humanOnly(model, flags, what) };
}

function finish(model, started, expect) {
  if (!started.token) return { by: started.by, signed: false, note: "" };
  const v = signed.verifyApprovalToken(model, started.token, expect);
  return { ...v, note: signed.signedNote(v) }; // `note` is the text to add to the event note; `personNote` is what the person wrote
}

module.exports = { nonInteractive, humanOnly, refuse, begin, finish, tokenOf, NEED_TOKEN };
