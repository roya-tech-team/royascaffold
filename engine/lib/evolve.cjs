"use strict";

// Deltas (plan file 02 §2, E1/E2). Changing a requirement, a workflow or a contract is an `evolve` change
// that holds a delta block:
//
//   ## Delta REQ-READ-002 (v2 → v3)
//
//   Before: A title is required.
//   After:  A title is required and must be at most 200 characters.
//   Why:    SRC-READ-014 (support ticket quote)
//
// A record's version is derived, never typed: 1 plus the deltas of the evolve changes whose design a person
// approved (status approved or later), not counting changes a closed rollback reverted. So the version is
// rebuilt from the repository, and the old wording stays in the delta blocks (history).
//
// The change also lists everything that depended on the old wording (tests, evidence, slices, components,
// neighbours) in `## Affected by the delta`; the Understand gate refuses until each row is handled.

const fs = require("fs");
const path = require("path");
const { section, changeBody, ORDER } = require("./gates.cjs");
const { readTables, escapeCell } = require("./model/tables.cjs");

const DELTA_KINDS = ["requirement", "nfr", "use-case", "workflow", "contract"];
const DELTA_HEAD = /^##\s+Delta\s+([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)\s*\(\s*v(\d+)\s*(?:→|->|to)\s*v(\d+)\s*\)\s*$/;
const FIELD = /^[-*\s]*\**(Before|After|Why|Removes|Breaking)\**\s*:\**\s*(.*)$/i;
const AFFECTED_TITLE = "Affected by the delta";
const NONE = /^(|none|n\/a|[—–-]|_.*_)$/i;

const norm = (s) => String(s || "").replace(/[`*_]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

// The delta blocks of a change body.
function parseDeltas(body) {
  const lines = String(body || "").split("\n");
  const out = [];
  let cur = null;
  let field = null;
  let fenced = false;
  const close = () => {
    if (!cur) return;
    for (const k of Object.keys(cur.text)) cur.text[k] = cur.text[k].join(" ").replace(/\s+/g, " ").trim();
    const removes = NONE.test(cur.text.removes || "") ? [] : [...(cur.text.removes.match(/`[^`]+`|[\w.-]+/g) || [])].map((x) => x.replace(/`/g, ""));
    const lost = cur.kind === "contract" ? [...new Set((cur.text.before.match(/`[^`]+`/g) || []).map((x) => x.replace(/`/g, "")))].filter((t) => !cur.text.after.includes(t)) : [];
    cur.before = cur.text.before;
    cur.after = cur.text.after;
    cur.why = cur.text.why;
    cur.removes = removes.length ? removes : lost;
    cur.breaking = removes.length > 0 || lost.length > 0 || /^(yes|true)\b/i.test(cur.text.breaking || "");
    delete cur.text;
    delete cur.kind;
    out.push(cur);
    cur = null;
    field = null;
  };
  lines.forEach((raw, n) => {
    if (/^\s*(```|~~~)/.test(raw)) fenced = !fenced;
    if (fenced) return;
    const head = raw.trim().match(DELTA_HEAD);
    if (head) {
      close();
      cur = { id: head[1], from: Number(head[2]), to: Number(head[3]), line: n + 1, kind: /^CTR-/.test(head[1]) ? "contract" : "other", text: { before: [], after: [], why: [], removes: [], breaking: [] } };
      return;
    }
    if (/^##\s/.test(raw)) { close(); return; }
    if (!cur) return;
    const f = raw.match(FIELD);
    if (f) {
      field = f[1].toLowerCase();
      if (f[2].trim()) cur.text[field].push(f[2].trim());
    } else if (field && raw.trim()) cur.text[field].push(raw.trim());
  });
  close();
  return out;
}

// The words of a record a delta changes: its body (the heading alone when it has none).
function wording(rec) {
  const lines = String(rec.body || "").split("\n");
  const cut = lines.findIndex((l) => /^\s*\*\*Acceptance\*\*/.test(l));
  const body = (cut < 0 ? lines : lines.slice(0, cut)).filter((l) => !/^\s*_.*_\s*$/.test(l)).join(" ").replace(/\s+/g, " ").trim();
  return body || rec.title;
}

// Does the record now say what the delta says?
function sayswhat(rec, after) {
  const hay = norm([rec.title, rec.body, ...Object.values(rec.fields || {})].join(" "));
  return Boolean(norm(after)) && hay.includes(norm(after));
}

const applied = (model, change) => ORDER.indexOf(change.status) >= ORDER.indexOf("approved") && !model.reverted.has(change.id);

const CACHE = new WeakMap();
// id -> [{ change, line, from, to, ... }] over every evolve change (any status).
function allDeltas(model) {
  if (CACHE.has(model)) return CACHE.get(model);
  const map = new Map();
  for (const change of model.changes.values()) {
    if (change.kind !== "evolve") continue;
    let body = "";
    try {
      body = changeBody(model.root, change);
    } catch {
      continue;
    }
    for (const d of parseDeltas(body)) {
      if (!map.has(d.id)) map.set(d.id, []);
      map.get(d.id).push({ ...d, change: change.id, status: change.status });
    }
  }
  CACHE.set(model, map);
  return map;
}

// 1 plus the deltas a person approved. `except` leaves one change out (its own delta is being written or checked).
function versionOf(model, id, except = null) {
  const list = allDeltas(model).get(id) || [];
  return 1 + list.filter((d) => d.change !== except && applied(model, model.changes.get(d.change))).length;
}

// Records with at least one counted delta (their version is above 1).
function versionedIds(model) {
  const out = [];
  for (const [id, list] of allDeltas(model)) if (list.some((d) => applied(model, model.changes.get(d.change)))) out.push(id);
  return out;
}

// What depended on the old wording of `id`.
function affectedOf(model, id, selfChange = null) {
  const rec = model.records.get(id);
  const rows = new Map();
  const add = (item, kind, why) => {
    if (item === id || !model.records.has(item)) return;
    if (!rows.has(item)) rows.set(item, { item, kind, why: [] });
    if (!rows.get(item).why.includes(why)) rows.get(item).why.push(why);
  };
  const isReq = ["requirement", "nfr", "use-case"].includes(rec.kind);
  const kinds = isReq ? ["test", "component"] : ["test", "component", "requirement", "nfr", "workflow", "contract", "action"];
  for (const r of rec.relations) {
    const k = (model.records.get(r.to) || {}).kind;
    if (kinds.includes(k)) add(r.to, k, `${id} ${r.type.replace(/_/g, " ")} it`);
  }
  for (const x of model.incoming.get(id) || []) {
    const k = (model.records.get(x.from) || {}).kind;
    if (kinds.includes(k)) add(x.from, k, `it ${x.type.replace(/_/g, " ")} ${id}`);
  }
  for (const s of model.slices.values()) if (s.delivers.includes(id)) add(s.id, "slice", `delivers ${id}`);
  const tests = new Set([...rows.values()].filter((r) => r.kind === "test").map((r) => r.item));
  for (const e of model.evidence.values()) {
    if (e.change === selfChange) continue;
    const hit = e.proves.filter((p) => p === id || tests.has(p));
    if (hit.length) add(e.id, "evidence", `proved ${hit.join(", ")} (${e.result}${e.kind && e.kind !== "check" ? `, ${e.kind}` : ""})`);
  }
  const order = { slice: 0, test: 1, evidence: 2, component: 3 };
  return [...rows.values()].map((r) => ({ item: r.item, kind: r.kind, why: r.why.join("; ") })).sort((a, b) => (order[a.kind] ?? 9) - (order[b.kind] ?? 9) || a.item.localeCompare(b.item));
}

// The `## Affected by the delta` table of a change body: [{ item, kind, why, handling }].
function parseAffected(body) {
  const text = section(body, [AFFECTED_TITLE]);
  const table = text ? readTables(text).find((t) => (t.header[0] || "").toLowerCase() === "item") : null;
  if (!table) return null;
  const h = table.header.map((x) => x.toLowerCase());
  const col = (n) => h.indexOf(n);
  return table.rows.map((r) => ({ item: (r.cells[0] || "").replace(/`/g, "").trim(), kind: (r.cells[col("kind")] || "").trim(), why: (r.cells[col("why")] || "").trim(), handling: (r.cells[col("handling")] || "").trim() }));
}

// A handled row says `update`, or `still valid (the reason)`.
function handled(handling) {
  const t = String(handling || "").trim();
  if (/^update\b/i.test(t)) return true;
  const m = t.match(/^still valid\s*\((.+)\)\s*$/i);
  return Boolean(m && m[1].trim().length > 2 && !/^[?_…]+$/.test(m[1].trim()));
}

function renderAffected(rows) {
  const lines = [`## ${AFFECTED_TITLE}`, "", "Every item that depended on the old wording. Write the handling of each: `update` (it changes in this change) or `still valid (why it needs no change)`. Evidence of the old version turns stale on its own.", "", "| Item | Kind | Why | Handling |", "|---|---|---|---|"];
  for (const r of rows) lines.push(`| ${escapeCell(r.item)} | ${escapeCell(r.kind)} | ${escapeCell(r.why)} | ${escapeCell(r.handling || "")} |`);
  if (!rows.length) lines.push("| — | — | nothing else depended on it | still valid (nothing depends on it) |");
  return lines.join("\n");
}

function renderDelta(d) {
  return [`## Delta ${d.id} (v${d.from} → v${d.to})`, "", `Before: ${d.before || ""}`, `After:  ${d.after || ""}`, `Why:    ${d.why || ""}`, ...(d.removes && d.removes.length && d.explicitRemoves ? [`Removes: ${d.removes.join(", ")}`] : [])].join("\n");
}

// Puts a section (heading line included) in a change body: replaces the section with this heading, or appends it.
function putSection(text, heading, block) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start < 0) return `${text.replace(/\n*$/, "\n")}\n${block}\n`;
  let end = start + 1;
  while (end < lines.length && !/^##\s/.test(lines[end])) end += 1;
  return [...lines.slice(0, start), ...block.split("\n"), "", ...lines.slice(end)].join("\n").replace(/\n{3,}/g, "\n\n");
}

// The Understand-gate checks for an evolve change (see gates.cjs).
function gateChecks(model, change, body, check) {
  const out = [];
  const deltas = parseDeltas(body);
  if (!deltas.length) return [check("delta", false, `an evolve change holds a delta block per record it changes: royascaff change <REQ-…|WF-…|CTR-…> (writes "## Delta <ID> (v1 → v2)")`)];
  const problems = [];
  for (const d of deltas) {
    const rec = model.records.get(d.id);
    if (!rec) { problems.push(`${d.id} does not exist`); continue; }
    if (!DELTA_KINDS.includes(rec.kind)) { problems.push(`${d.id} is a ${rec.kind}: deltas are for requirements, workflows and contracts`); continue; }
    const now = versionOf(model, d.id, change.id);
    if (d.from !== now || d.to !== now + 1) problems.push(`${d.id}: the heading says v${d.from} → v${d.to}, but the record is at v${now} (write v${now} → v${now + 1})`);
    for (const [k, v] of [["Before", d.before], ["After", d.after], ["Why", d.why]]) if (NONE.test(v || "")) problems.push(`${d.id}: write ${k}:`);
    if (d.before && d.after && norm(d.before) === norm(d.after)) problems.push(`${d.id}: After is the same as Before`);
  }
  out.push(check("delta", problems.length === 0, problems.length ? problems.join("; ") : `${deltas.length} delta(s): ${deltas.map((d) => `${d.id} v${d.from} → v${d.to}`).join(", ")}`));

  const table = parseAffected(body);
  const expected = [];
  for (const d of deltas) if (model.records.has(d.id)) for (const a of affectedOf(model, d.id, change.id)) if (!expected.some((e) => e.item === a.item)) expected.push(a);
  if (!table) {
    out.push(check("affected", expected.length === 0, expected.length ? `list what the delta affects and mark each item: royascaff change ${deltas.map((d) => d.id).join(" ")} (refreshes "## ${AFFECTED_TITLE}")` : "nothing else depends on the changed records"));
  } else {
    const have = new Map(table.map((r) => [r.item, r]));
    const unlisted = expected.filter((e) => !have.has(e.item)).map((e) => e.item);
    const open = table.filter((r) => r.item !== "—" && !handled(r.handling)).map((r) => r.item);
    out.push(check("affected", !unlisted.length && !open.length, unlisted.length || open.length
      ? `${unlisted.length ? `not listed yet: ${unlisted.join(", ")} (run royascaff change ${deltas.map((d) => d.id).join(" ")} to refresh the list)` : ""}${unlisted.length && open.length ? "; " : ""}${open.length ? `mark each as "update" or "still valid (reason)": ${open.join(", ")}` : ""}`
      : `every affected item is handled (${table.filter((r) => r.item !== "—").length})`));
  }
  const breaking = deltas.filter((d) => d.breaking);
  if (breaking.length) {
    const ok = ["high", "critical"].includes(change.risk);
    out.push(check("breaking", ok, ok ? `breaking delta (${breaking.map((d) => `${d.id} removes ${d.removes.join(", ") || "something"}`).join("; ")}): risk ${change.risk}, a person approves the design` : `${breaking.map((d) => d.id).join(", ")} removes ${breaking.flatMap((d) => d.removes).join(", ") || "something a caller uses"}: a breaking change needs risk high or critical (and a person's approval)`));
  }
  return out;
}

// At Record: each record now says what its delta says.
function recordChecks(model, change, body, check) {
  const deltas = parseDeltas(body).filter((d) => model.records.has(d.id));
  if (!deltas.length) return [];
  const stale = deltas.filter((d) => !sayswhat(model.records.get(d.id), d.after)).map((d) => d.id);
  return [check("delta-applied", stale.length === 0, stale.length ? `${stale.join(", ")} still ${stale.length > 1 ? "do" : "does"} not say what the delta's After says: edit the record to the new wording` : "every changed record says what its delta says")];
}

module.exports = { DELTA_KINDS, parseDeltas, wording, sayswhat, versionOf, versionedIds, allDeltas, affectedOf, parseAffected, handled, renderAffected, renderDelta, putSection, gateChecks, recordChecks, applied, AFFECTED_TITLE, norm };
