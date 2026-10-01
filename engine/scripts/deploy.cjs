#!/usr/bin/env node
"use strict";

// Publishes this engine to npm, safely.
//   npm run deploy                 test, check, publish
//   npm run deploy -- --otp=123456 with a two-factor code
//   npm run deploy:dry             everything except the upload
//
// Steps: you are logged in → the version is not on npm yet → all tests pass → the package holds only
// engine files → publish under the right tag (a pre-release such as 1.4.0-beta.4 goes to "beta",
// so `npm install royascaff` keeps giving the stable version) → show the tags.

const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const pkg = require(path.join(ROOT, "package.json"));
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const otp = (args.find((a) => a.startsWith("--otp=")) || "").slice(6);
const tag = (pkg.version.match(/-([a-z]+)/i) || [])[1] || "latest";

const say = (msg) => process.stdout.write(`${msg}\n`);
const fail = (msg) => { process.stderr.write(`\n✗ ${msg}\n`); process.exit(1); };
function run(cmd, cmdArgs, { quiet = false, allowFail = false } = {}) {
  const r = spawnSync(cmd, cmdArgs, { cwd: ROOT, encoding: "utf8", stdio: quiet ? "pipe" : "inherit", shell: process.platform === "win32" });
  if (r.status !== 0 && !allowFail) fail(`${cmd} ${cmdArgs.join(" ")} failed${quiet ? `:\n${r.stdout || ""}${r.stderr || ""}` : ""}`);
  return r;
}

say(`RoyaScaff deploy · ${pkg.name}@${pkg.version} → npm tag "${tag}"${dry ? " (dry run)" : ""}\n`);

// 1. Logged in.
const who = run("npm", ["whoami"], { quiet: true, allowFail: true });
if (who.status !== 0) fail("You are not logged in to npm. Run: npm login");
say(`✓ logged in as ${who.stdout.trim()}`);

// 2. The version is new.
const view = run("npm", ["view", `${pkg.name}@${pkg.version}`, "version"], { quiet: true, allowFail: true });
if (view.status === 0 && view.stdout.trim() === pkg.version) fail(`${pkg.name}@${pkg.version} is already on npm. Raise "version" in package.json (e.g. 1.4.0-beta.5).`);
say(`✓ ${pkg.version} is not published yet`);

// 3. Tests.
say("… running the tests");
run("npm", ["test", "--silent"], { quiet: true });
say("✓ all tests pass");

// 4. The package holds only engine files.
const pack = run("npm", ["pack", "--dry-run", "--json"], { quiet: true });
const files = JSON.parse(pack.stdout)[0].files.map((f) => f.path);
const bad = files.filter((f) => /^(tests|scripts)\//.test(f) || /\.tgz$/.test(f));
if (bad.length) fail(`the package would include non-engine files: ${bad.slice(0, 5).join(", ")}`);
for (const must of ["bin/royascaff.cjs", "skill/royascaff/SKILL.md", "adapters/web-ui.json", "adapters/assets/web-smoke.mjs"]) {
  if (!files.includes(must)) fail(`the package is missing ${must}`);
}
say(`✓ package: ${files.length} engine files`);

// 5. Publish.
if (dry) {
  say(`\nDry run done. To publish: npm run deploy${otp ? "" : " (add -- --otp=123456 if your account asks for a code)"}`);
  process.exit(0);
}
run("npm", ["publish", "--tag", tag, ...(otp ? [`--otp=${otp}`] : [])]);
say(`\n✓ published ${pkg.name}@${pkg.version} under "${tag}"`);
run("npm", ["view", pkg.name, "dist-tags"]);
say(`\nUse it in a project:  npm i -D ${pkg.name}@${tag}  then  npx ${pkg.name} init …`);
