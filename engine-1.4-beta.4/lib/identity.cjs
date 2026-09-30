"use strict";

const { git } = require("./git.cjs");

// Who is acting: --by, then ROYASCAFF_USER, then git user.name. AI agents pass --by ai:<tool>.
function who(flags = {}, repo = ".") {
  return flags.by || process.env.ROYASCAFF_USER || git(repo, ["config", "user.name"]) || "unknown";
}

module.exports = { who };
