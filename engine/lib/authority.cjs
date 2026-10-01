"use strict";

// Who may do the steps only a person can do (an approval, a look, a measure), and how the engine
// knows it was a person. Two proofs exist: a person at a terminal, or a signed approval token
// from an issuer the project trusts. In non-interactive mode (ROYASCAFF_NONINTERACTIVE=1) nothing
// is ever asked, so only the token can prove it; without one the call returns HUMAN_REQUIRED
// and says what is needed.

const { who } = require("./identity.cjs");
const { isHuman } = require("./approvals.cjs");

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

module.exports = { nonInteractive, humanOnly, refuse, NEED_TOKEN };
