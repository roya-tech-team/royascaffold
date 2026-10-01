"use strict";

// Beta.4 · WP-D6: the code is checked against the knowledge. Dependency rules written in path form,
//   `apps/web/src/chrome/**` must not import `apps/web/src/graph/generate*`
// in the architecture page's "Dependency rules" section or in a RULE- record, fail the full check
// when a file matching the first glob imports something matching the second (a path glob, or a
// package name). Imports are found with the adapters' import patterns; without them the rules stay
// advisory. Rules in plain words stay advisory too — they still reach every Context Pack (D3).

const fs = require("fs");
const path = require("path");
const { matchesAny } = require("./glob.cjs");

const RULE = /`([^`]+)`\s+(?:must not|may not|cannot|can not|should not|never)\s+(?:import|imports|depend on|use)\s+`([^`]+)`/gi;

function pathRules(model) {
  const out = [];
  const K = require("./knowledge.cjs");
  const arch = K.docsOf(model).find((d) => d.kind === "architecture");
  const abs = arch && path.join(model.root, arch.file);
  if (abs && fs.existsSync(abs)) {
    const { sections } = require("./approvals.cjs");
    const s = sections(fs.readFileSync(abs, "utf8")).find((x) => /^dependency rules/i.test(x.title));
    for (const m of (s ? s.lines.join("\n") : "").matchAll(RULE)) out.push({ from: m[1].trim(), to: m[2].trim(), source: `${arch.file} · Dependency rules`, text: m[0] });
  }
  for (const r of model.records.values()) {
    if (r.kind !== "rule") continue;
    for (const m of `${r.title}\n${r.body || ""}`.matchAll(RULE)) out.push({ from: m[1].trim(), to: m[2].trim(), source: r.id, text: m[0] });
  }
  // The same rule written twice (page and record) is one rule.
  return out.filter((r, i) => out.findIndex((x) => x.from === r.from && x.to === r.to) === i);
}

const globBase = (g) => {
  const parts = g.split("/");
  const i = parts.findIndex((p) => /[*?]/.test(p));
  return (i < 0 ? parts : parts.slice(0, i)).join("/");
};

// Violations of the path rules in the repository: [{ rule, file, spec }].
function violations(model) {
  const deps = require("./adapters.cjs").policy(model).deps;
  const rules = pathRules(model);
  if (!rules.length || !deps || !deps.imports) return { rules, checked: false, violations: [] };
  const { walk, SKIP, packageOf } = require("./content.cjs");
  const out = [];
  for (const rule of rules) {
    const baseDir = globBase(rule.from);
    const files = [];
    walk(path.join(model.repo, baseDir), baseDir, files, new Set([...SKIP, ...(deps.skipFolders || [])]));
    for (const f of files.filter((x) => matchesAny(x, [rule.from]))) {
      let text = "";
      try {
        text = fs.readFileSync(path.join(model.repo, f), "utf8");
      } catch {
        continue;
      }
      for (const src of deps.imports) {
        for (const m of text.matchAll(new RegExp(src, "g"))) {
          const spec = m[1];
          const target = spec.startsWith(".") ? path.posix.normalize(path.posix.join(path.posix.dirname(f), spec)) : spec;
          const hit = matchesAny(target, [rule.to]) || (!spec.startsWith(".") && (spec === rule.to || packageOf(spec, deps) === rule.to));
          if (hit && !out.some((v) => v.file === f && v.spec === spec && v.rule === rule)) out.push({ rule, file: f, spec });
        }
      }
    }
  }
  return { rules, checked: true, violations: out };
}

// A "Rules" result for the full check (only when there are path rules and import patterns).
function ruleResult(model) {
  const v = violations(model);
  if (!v.checked) return null;
  const pass = v.violations.length === 0;
  return { app: "project", kind: "Rules", command: "royascaff: dependency rules", cwd: ".", exit: pass ? 0 : 1, ms: 0, pass, timedOut: false, tail: pass ? "" : v.violations.map((x) => `${x.file} imports "${x.spec}" — breaks ${x.rule.text} (${x.rule.source})`).join("\n") };
}

module.exports = { pathRules, violations, ruleResult, RULE };
