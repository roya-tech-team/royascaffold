"use strict";

// The dogfooding guard (plan file 01 §8, E4.3). When the engine is developed with itself, the engine that runs
// the work must not be the engine being changed: a change to the gates would be judged by the gates it changes.
// The work uses a pinned copy (the `royascaff-tool` alias in node_modules, or a snapshot). This guard warns
// when the running engine's own folder lies inside the repository it is working on, outside node_modules.

const path = require("path");

// True when `engineDir` is the repository root or a folder inside it, and not inside a node_modules folder
// (where a pinned copy lives).
function runsOnItself(engineDir, repoRoot) {
  if (!engineDir || !repoRoot) return false;
  const rel = path.relative(path.resolve(repoRoot), path.resolve(engineDir));
  if (path.isAbsolute(rel) || rel.split(path.sep)[0] === "..") return false;
  // A pinned copy: the package manager's node_modules, or the `.tool/` snapshot made by scripts/tool.cjs.
  return !rel.split(path.sep).some((part) => part === "node_modules" || part === ".tool");
}

const MESSAGE = (engineDir, repoRoot) => `You are running the engine you are changing (${engineDir} is part of ${repoRoot}). Run the pinned copy instead: npx royascaff (the royascaff-tool alias in node_modules) or node scripts/tool.cjs. The engine that judges a change must not change under it.`;

// The warning for this call, or null. `ROYASCAFF_NO_GUARD=1` switches it off (for tests of the guard itself).
function guardWarning(engineDir, repoRoot) {
  if (process.env.ROYASCAFF_NO_GUARD === "1") return null;
  return runsOnItself(engineDir, repoRoot) ? MESSAGE(engineDir, repoRoot) : null;
}

module.exports = { runsOnItself, guardWarning, MESSAGE };
