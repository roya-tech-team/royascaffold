"use strict";

// `change <ID…>` (plan file 02 §2, E1/E2): changing a requirement, a workflow or a contract opens (or joins) a change
// of kind `evolve`. The change holds one delta block per record and lists everything that depended on the old
// wording. The Understand gate refuses until each affected item is handled (see lib/evolve.cjs).

const fs = require("fs");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { changeBody } = require("../gates.cjs");
const evolve = require("../evolve.cjs");
const work = require("./work.cjs");
const { transactional } = require("./plan.cjs");

const fail = (code, message, missing) => Object.assign(new Error(message), { code, ...(missing ? { missing } : {}) });

// Sets (or adds) one `key: value` line in the front matter.
function setFront(text, key, value) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return text;
  const re = new RegExp(`^${key}:.*$`, "m");
  const inner = re.test(m[1]) ? m[1].replace(re, `${key}: ${value}`) : `${m[1]}\n${key}: ${value}`;
  return text.replace(m[0], `---\n${inner}\n---`);
}

function frontList(text, key) {
  const m = text.match(new RegExp(`^${key}:\\s*\\[?([^\\]\\n]*)\\]?\\s*$`, "m"));
  return m ? m[1].split(",").map((x) => x.trim()).filter(Boolean) : [];
}

// Replaces the delta block of `id` (heading to the next `## ` heading) with `block`.
function replaceDelta(text, id, block) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => new RegExp(`^##\\s+Delta\\s+${id}\\s*\\(`).test(l.trim()));
  if (start < 0) return `${text.replace(/\n*$/, "\n")}\n${block}\n`;
  let end = start + 1;
  while (end < lines.length && !/^##\s/.test(lines[end])) end += 1;
  return [...lines.slice(0, start), ...block.split("\n"), "", ...lines.slice(end)].join("\n");
}

function changeCommand(start, ids, flags = {}) {
  const wanted = [...new Set((ids || []).filter(Boolean))];
  if (!wanted.length) throw fail("INVALID_INPUT", 'Usage: royascaff change <REQ-…|NFR-…|WF-…|CTR-…> [more IDs] [--before "…"] [--after "…"] [--why "…"] [--change CHG-…] [--risk …] [path]');
  if (wanted.length > 1 && (flags.before || flags.after || flags.why)) throw fail("INVALID_INPUT", "--before, --after and --why go with one ID: change them one at a time, or edit the delta blocks in change.md");
  let model = buildModel(start);
  for (const id of wanted) {
    const rec = model.records.get(id);
    if (!rec) throw fail("UNKNOWN_ID", `${id} is not a record in this project`);
    if (!evolve.DELTA_KINDS.includes(rec.kind)) throw fail("INVALID_INPUT", `${id} is a ${rec.kind}: only requirements (REQ-, NFR-, UC-), workflows (WF-) and contracts (CTR-) change through a delta`);
  }
  const bodyOf = (c) => { try { return changeBody(model.root, c); } catch { return ""; } };

  // Join the change that already holds a delta for one of these records, or the one named, or open a new one.
  let change = null;
  if (flags.change && flags.change !== true) {
    change = model.changes.get(flags.change);
    if (!change) throw fail("UNKNOWN_ID", `${flags.change} is not a change in this project`);
    if (change.kind !== "evolve") throw fail("INVALID_INPUT", `${change.id} is a ${change.kind} change: only an evolve change holds deltas`);
  } else {
    change = [...model.changes.values()].find((c) => c.kind === "evolve" && ["draft", "analyzed", "approved"].includes(c.status) && evolve.parseDeltas(bodyOf(c)).some((d) => wanted.includes(d.id))) || null;
  }
  if (change && !["draft", "analyzed", "approved"].includes(change.status)) throw fail("GATE_REFUSED", `${change.id} is ${change.status}: adding a delta changes the approved design. Move it back first: royascaff advance ${change.id} --to approved --reason "…"`, [`royascaff advance ${change.id} --to approved --reason "…"`]);
  let created = null;
  if (!change) {
    created = work.createChange(start, model, { kind: "evolve", affects: wanted, title: flags.title && flags.title !== true ? flags.title : `Change ${wanted.join(", ")}` }, { ...flags, risk: flags.risk || "medium" });
    model = buildModel(start);
    change = model.changes.get(created.id);
  }

  const file = path.join(model.root, change.file);
  let text = fs.readFileSync(file, "utf8");
  const existing = evolve.parseDeltas(text.replace(/^---\n[\s\S]*?\n---\n?/, ""));
  const given = { before: flags.before, after: flags.after, why: flags.why };
  const text1 = (v) => (v && v !== true ? String(v) : "");
  for (const id of wanted) {
    const rec = model.records.get(id);
    const have = existing.find((d) => d.id === id);
    const from = have ? have.from : evolve.versionOf(model, id, change.id);
    const d = {
      id,
      from,
      to: have ? have.to : from + 1,
      before: text1(given.before) || (have ? have.before : evolve.wording(rec)),
      after: text1(given.after) || (have ? have.after : ""),
      why: text1(given.why) || (have ? have.why : ""),
    };
    if (!have || text1(given.before) || text1(given.after) || text1(given.why)) text = replaceDelta(text, id, evolve.renderDelta(d));
  }
  const affects = [...new Set([...frontList(text, "affects"), ...wanted])];
  text = setFront(text, "affects", `[${affects.join(", ")}]`);

  // The affected list: every item that depended on the old wording, keeping what was already written in Handling.
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const deltas = evolve.parseDeltas(body);
  const old = new Map((evolve.parseAffected(body) || []).map((r) => [r.item, r]));
  const rows = [];
  for (const d of deltas) {
    if (!model.records.has(d.id)) continue;
    for (const a of evolve.affectedOf(model, d.id, change.id)) if (!rows.some((r) => r.item === a.item)) rows.push({ ...a, handling: (old.get(a.item) || {}).handling || "" });
  }
  text = evolve.putSection(text, `## ${evolve.AFFECTED_TITLE}`, evolve.renderAffected(rows));
  const breaking = deltas.filter((d) => d.breaking);
  if (breaking.length && !flags.risk && !["high", "critical"].includes(change.risk)) text = setFront(text, "risk", "high");
  transactional(start, file, text);
  work.refreshBoard(start);

  const after = buildModel(start);
  const now = after.changes.get(change.id);
  const written = evolve.parseDeltas(changeBody(after.root, now));
  const table = evolve.parseAffected(changeBody(after.root, now)) || [];
  return {
    id: now.id,
    kind: "evolve",
    opened: Boolean(created),
    joined: !created,
    risk: now.risk,
    status: now.status,
    file: now.file,
    deltas: written.map((d) => ({ id: d.id, from: d.from, to: d.to, breaking: d.breaking, removes: d.removes })),
    affected: table.filter((r) => r.item !== "—").map((r) => ({ item: r.item, kind: r.kind, why: r.why, handling: r.handling })),
    next: `Write Before/After/Why of each delta in ${now.file}, mark every affected item "update" or "still valid (reason)", then: royascaff advance ${now.id} --to analyzed`,
  };
}

module.exports = { changeCommand, setFront, frontList, replaceDelta };
