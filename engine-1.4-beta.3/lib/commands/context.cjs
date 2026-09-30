"use strict";

const fs = require("fs");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { deriveStatus } = require("../derive/status.cjs");
const { buildPack } = require("../context.cjs");

function cacheDir(model, sub) {
  const dir = path.join(model.root, ".cache");
  fs.mkdirSync(path.join(dir, sub), { recursive: true });
  const ignore = path.join(dir, ".gitignore");
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, "# RoyaScaff cache: rebuilt on demand, never committed.\n*\n");
  return path.join(dir, sub);
}

// context <TASK-…> [--save] [--out FILE]
//   default: writes project/.cache/contexts/<TASK>.md (git-ignored) and returns the pack
//   --save:  also keeps it in changes/<CHG>/contexts/<TASK>.md (committed, linkable)
function contextCommand(start, taskId, flags = {}) {
  if (!taskId) throw new Error("Usage: royascaff context <TASK-…> [path] [--save] [--out FILE]");
  const model = buildModel(start);
  const pack = buildPack(model, deriveStatus(model), taskId);
  if (!pack.within) {
    const biggest = [...pack.sections].sort((a, b) => b.tokens - a.tokens).slice(0, 3).map((s) => `${s.name} ~${s.tokens}`).join(", ");
    const err = new Error(`Context for ${taskId} is ~${pack.tokens} tokens, over the budget of ${pack.budget}. Split the task (largest parts: ${biggest}); nothing is ever cut silently.`);
    err.pack = pack;
    throw err;
  }
  const written = [];
  const cached = path.join(cacheDir(model, "contexts"), `${taskId}.md`);
  fs.writeFileSync(cached, pack.text);
  written.push(path.relative(model.repo, cached));
  if (flags.save) {
    // R4: a saved pack is a committed copy of knowledge. Only a person keeps one, with a reason.
    const by = require("../identity.cjs").who(flags, model.repo);
    if (/^ai(:|$)/i.test(by)) throw new Error("Context packs are rebuilt on demand (project/.cache/); an AI never saves them into the change. Read the pack from the output instead.");
    if (!flags.reason) throw new Error('Saving a pack into the change needs a reason: royascaff context <TASK-…> --save --reason "<why keep this copy>"');
    if (!pack.change) throw new Error(`${taskId} is not inside a change; nothing to save it with`);
    const dir = path.join(model.root, model.changes.get(pack.change).dir, "contexts");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${taskId}.md`), pack.text);
    written.push(path.relative(model.repo, path.join(dir, `${taskId}.md`)));
  }
  if (flags.out) {
    fs.writeFileSync(path.resolve(flags.out), pack.text);
    written.push(flags.out);
  }
  return { ...pack, written };
}

module.exports = { contextCommand };
