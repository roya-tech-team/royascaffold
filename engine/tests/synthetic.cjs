"use strict";

// A large synthetic project for the scale tests (E6.4, E6.5): hundreds of records and, when asked, a code base of
// hundreds of thousands of lines. It starts from the greenfield fixture (a real, approved project) and adds generated
// features, slices, requirements, tests and components, and source files for the modules. Nothing here is a mock of the
// engine: the project is plain files, read by the real commands.

const fs = require("fs");
const os = require("os");
const path = require("path");

const GREEN = path.join(__dirname, "fixtures", "greenfield");
const pad = (n, w = 3) => String(n).padStart(w, "0");

function put(root, rel, text) {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
}

// features × (requirements, tests, components, 2 slices) records are added to the fixture's own.
function makeProject({ features = 25, reqs = 8, tests = 8, comps = 3, code = null } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "rs-big-"));
  fs.cpSync(GREEN, root, { recursive: true });
  const profile = path.join(root, "project/profile.md");
  fs.writeFileSync(profile, fs.readFileSync(profile, "utf8").replace("royascaff: 1.4\n", "royascaff: 1.4\nadapters: [node]\n"));
  const roadmap = [];
  const requirements = [];
  const testsOut = [];
  const components = [];
  let r = 100;
  let t = 100;
  let c = 100;
  for (let f = 1; f <= features; f += 1) {
    const cap = `CAP-CAMP-${100 + f}`;
    roadmap.push(`## ${cap} · Generated feature ${f}`, "", "- **Owner:** product-owner", "- **Priority:** should", "- **Horizon:** later", "", `Generated feature number ${f}.`, "", "| Slice | Title | Order | Depends on | Delivers | Planned at |", "|---|---|---|---|---|---|");
    const mine = [];
    for (let i = 0; i < reqs; i += 1) {
      r += 1;
      mine.push(`REQ-CAMP-${r}`);
      requirements.push(`### REQ-CAMP-${r} · Requirement ${r} of feature ${f}`, "", "- **Priority:** should", "- **Owner:** product-owner", `- **Feature:** ${cap}`, "", `The user can do thing ${r} in feature ${f}.`, "", "**Acceptance**", `- [unit] Thing ${r} works.`, `- [manual] Thing ${r} reads well.`, "");
    }
    roadmap.push(`| SLC-CAMP-${100 + f}-A | First slice of ${f} | 1 | — | ${mine.slice(0, reqs >> 1).join(", ")} | a1b2c3d |`, `| SLC-CAMP-${100 + f}-B | Second slice of ${f} | 2 | SLC-CAMP-${100 + f}-A | ${mine.slice(reqs >> 1).join(", ")} | a1b2c3d |`, "");
    for (let i = 0; i < tests; i += 1) {
      t += 1;
      testsOut.push(`### TEST-CAMP-${t} · Test ${t}`, "", "- **Owner:** roya-team", "- **Check:** manual", `- **Verifies:** ${mine[i % mine.length]}`, "");
    }
    for (let i = 0; i < comps; i += 1) {
      c += 1;
      components.push(`### CMP-CAMP-${c} · Component ${c}`, "", "- **Owner:** roya-team", `- **Code:** apps/gen/f${pad(f)}/c${i}/**`, `- **Realizes:** ${mine.slice(i * 2, i * 2 + 2).join(", ")}`, "");
    }
  }
  const append = (rel, lines) => fs.appendFileSync(path.join(root, "project", rel), `\n${lines.join("\n")}\n`);
  // The example blocks at the end of some templates stay last; the fixture's files have none.
  append("knowledge/00-roadmap/roadmap.md", roadmap);
  append("knowledge/02-requirements/requirements.md", requirements);
  append("knowledge/05-implementation/tests.md", testsOut);
  append("knowledge/05-implementation/components/components.md", components);
  if (code) makeCode(root, code);
  return root;
}

// modules × subs × files × lines lines of JavaScript under apps/web/src/<module>/<sub>/, about 40 characters a line.
function makeCode(root, { modules = 8, subs = 5, files = 20, lines = 250, old = true } = {}) {
  const line = (i) => `exports.f${i} = (a, b) => a + b + ${i};`;
  const body = Array.from({ length: lines }, (_, i) => line(i)).join("\n");
  for (let m = 1; m <= modules; m += 1) for (let s = 1; s <= subs; s += 1) for (let f = 1; f <= files; f += 1) {
    const rel = `apps/web/src/m${pad(m, 2)}/s${s}/file${pad(f)}.js`;
    put(root, rel, `${body}\n`);
    if (old) fs.utimesSync(path.join(root, rel), new Date(Date.now() - 3600 * 1000), new Date(Date.now() - 3600 * 1000)); // not "racy" for the scan cache
  }
  return modules * subs * files * lines;
}

module.exports = { makeProject, makeCode, put };
