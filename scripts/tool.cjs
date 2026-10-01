#!/usr/bin/env node
"use strict";

// The pinned tool (plan file 01 §8, E4.3). This repository is a RoyaScaff project that develops the engine, so
// the engine that runs the project's work must be a pinned copy, never the working copy in engine/.
//
//   node scripts/tool.cjs <royascaff arguments>      run the pinned tool (what `npx royascaff` would run)
//   node scripts/tool.cjs --snapshot [git-ref]       make the pinned copy from a committed state (default HEAD)
//   node scripts/tool.cjs --which                    print the engine entry that would run
//
// Where the pinned copy comes from, in order:
//   1. node_modules/royascaff-tool  the npm alias:  npm i -D royascaff-tool@npm:royascaff@<version>
//      (the alias is only a local name for the royascaff package; this script never installs anything)
//   2. $ROYASCAFF_TOOL              a folder that holds bin/royascaff.cjs
//   3. .tool/<ref>/                 a snapshot made with --snapshot from git history (no registry needed)

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// The repository the pinned tool belongs to (ROYASCAFF_TOOL_ROOT overrides it, for tests).
const ROOT = process.env.ROYASCAFF_TOOL_ROOT ? path.resolve(process.env.ROYASCAFF_TOOL_ROOT) : path.join(__dirname, "..");
const SNAP = path.join(ROOT, ".tool");
const entryIn = (dir) => path.join(dir, "bin", "royascaff.cjs");

function git(args) {
  const r = spawnSync("git", ["-C", ROOT, ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${(r.stderr || "").trim()}`);
  return r.stdout.trim();
}

// Copies engine/ as committed at `ref` into .tool/<short hash>/ and points .tool/current at it.
function snapshot(ref = "HEAD") {
  const hash = git(["rev-parse", "--short", ref]);
  const dir = path.join(SNAP, hash);
  if (!fs.existsSync(entryIn(dir))) {
    fs.mkdirSync(dir, { recursive: true });
    const tar = path.join(SNAP, `${hash}.tar`);
    // core.autocrlf off: the snapshot is the committed bytes (the engine expects LF on every OS).
    git(["-c", "core.autocrlf=false", "-c", "core.eol=lf", "archive", "--format=tar", `--output=${tar}`, `${ref}:engine`]);
    const x = spawnSync("tar", ["-xf", tar, "-C", dir], { encoding: "utf8" });
    fs.rmSync(tar, { force: true });
    if (x.status !== 0) throw new Error(`could not unpack the snapshot: ${(x.stderr || "").trim()}`);
  }
  fs.writeFileSync(path.join(SNAP, "current"), `${hash}\n`);
  return { hash, dir };
}

function pinnedEntry() {
  const alias = path.join(ROOT, "node_modules", "royascaff-tool");
  if (fs.existsSync(entryIn(alias))) return { entry: entryIn(alias), from: "node_modules/royascaff-tool" };
  if (process.env.ROYASCAFF_TOOL && fs.existsSync(entryIn(process.env.ROYASCAFF_TOOL))) return { entry: entryIn(process.env.ROYASCAFF_TOOL), from: "$ROYASCAFF_TOOL" };
  const current = path.join(SNAP, "current");
  if (fs.existsSync(current)) {
    const dir = path.join(SNAP, fs.readFileSync(current, "utf8").trim());
    if (fs.existsSync(entryIn(dir))) return { entry: entryIn(dir), from: `.tool/${path.basename(dir)}` };
  }
  return null;
}

function main(argv) {
  if (argv[0] === "--snapshot") {
    const s = snapshot(argv[1]);
    process.stdout.write(`Pinned tool: ${s.dir}\n`);
    return 0;
  }
  const pin = pinnedEntry();
  if (argv[0] === "--which") {
    process.stdout.write(pin ? `${pin.entry} (${pin.from})\n` : "No pinned tool. Run: node scripts/tool.cjs --snapshot, or npm i -D royascaff-tool@npm:royascaff@<version>\n");
    return pin ? 0 : 1;
  }
  if (!pin) {
    process.stderr.write("No pinned tool, and the working copy in engine/ must not run on its own repository.\nMake one from a committed state: node scripts/tool.cjs --snapshot\nOr pin a published version: npm i -D royascaff-tool@npm:royascaff@<version>\n");
    return 1;
  }
  const r = spawnSync(process.execPath, [pin.entry, ...argv], { cwd: process.cwd(), stdio: "inherit", env: process.env });
  return r.status === null ? 1 : r.status;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { snapshot, pinnedEntry, main, ROOT };
