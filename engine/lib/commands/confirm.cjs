"use strict";

// `confirm <ID…>` (plan file 01 §6, E3.1): a person confirms inferred records. The record gets
// `- **Confirmed by:** <name> (<date>)`, the project log gets a `record.confirmed` event, and the record counts
// again (a requirement can be done). Only a person can do it; nothing is changed when one id is wrong.

const fs = require("fs");
const path = require("path");
const { buildModel } = require("../model/graph.cjs");
const { parseMarkdown, renderMarkdown } = require("../parse/markdown.cjs");
const { appendEvent } = require("../events.cjs");
const { headShort } = require("../git.cjs");
const { humanOnly } = require("../authority.cjs");
const { isInferred, isConfirmed } = require("../inferred.cjs");
const { transactional } = require("./plan.cjs");

const fail = (code, message) => Object.assign(new Error(message), { code });

function confirmCommand(start, ids, flags = {}) {
  const wanted = [...new Set((ids || []).filter(Boolean))];
  if (!wanted.length) throw fail("INVALID_INPUT", "Usage: royascaff confirm <ID…> [path]: the IDs of inferred records (royascaff inventory lists them)");
  const model = buildModel(start);
  const by = humanOnly(model, flags, "A confirmation");
  const unknown = wanted.filter((id) => !model.records.has(id));
  if (unknown.length) throw fail("UNKNOWN_ID", `${unknown.join(", ")} ${unknown.length > 1 ? "are not records" : "is not a record"} in this project`);
  const notInferred = wanted.filter((id) => !isInferred(model.records.get(id)) || isConfirmed(model.records.get(id)));
  if (notInferred.length) throw fail("ALREADY_EXISTS", `${notInferred.join(", ")} ${notInferred.length > 1 ? "are" : "is"} not waiting for confirmation: the record is not inferred, or it is already confirmed`);

  const date = new Date().toISOString().slice(0, 10);
  const byFile = new Map();
  for (const id of wanted) {
    const rec = model.records.get(id);
    if (!byFile.has(rec.file)) byFile.set(rec.file, []);
    byFile.get(rec.file).push(id);
  }
  for (const [rel, list] of byFile) {
    const file = path.join(model.root, rel);
    const parsed = parseMarkdown(fs.readFileSync(file, "utf8"));
    for (const id of list) {
      const seg = parsed.segments.find((s) => s.type === "record" && s.id === id);
      if (!seg) throw fail("INVALID_INPUT", `${id} cannot be confirmed in place: it is not a record with fields in ${rel}`);
      seg.fields = seg.fields || [];
      seg.fields.push({ key: "Confirmed by", value: `${by} (${date})` });
    }
    transactional(start, file, renderMarkdown(parsed));
  }
  const after = buildModel(start);
  for (const id of wanted) appendEvent(after.root, "project", { event: "record.confirmed", target: id, by, git: headShort(after.repo) || "—", note: `${after.records.get(id).kind}: ${after.records.get(id).title}` });
  require("./views.cjs").indexCommand(start);
  return { confirmed: wanted, by, date };
}

module.exports = { confirmCommand };
