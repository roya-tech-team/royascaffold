"use strict";

// Inferred records (plan file 01 §6, E3.1). When the AI writes knowledge for code that already exists, it
// is guessing from the code: it marks the record `- **Basis:** inferred …` (and `- **Inferred on:** date`).
// Such a record is ⏳ unconfirmed until a person confirms it (`royascaff confirm <ID…>`) or corrects it.
// An unconfirmed requirement never counts as done; `validate` warns when one stays unconfirmed for 14 days.
// Assumptions (ASM-) and questions have their own confirmation (the project approval, an answer).

const DAY = 86400000;
const WARN_AFTER_DAYS = 14;

const isInferred = (rec) => rec.origin === "record" && !["assumption", "question"].includes(rec.kind) && /^inferred\b/i.test(String((rec.fields || {}).Basis || "").trim());
const isConfirmed = (rec) => Boolean(String((rec.fields || {})["Confirmed by"] || "").trim());
const isUnconfirmed = (rec) => isInferred(rec) && !isConfirmed(rec);

function ageDays(rec, now = Date.now()) {
  const t = Date.parse(String((rec.fields || {})["Inferred on"] || "").trim());
  return Number.isNaN(t) ? null : Math.floor((now - t) / DAY);
}

// Every inferred record still waiting for a person: [{ id, kind, title, file, line, inferred_on, age_days }].
function unconfirmed(model, now = Date.now()) {
  return [...model.records.values()].filter(isUnconfirmed).map((r) => ({ id: r.id, kind: r.kind, title: r.title, file: r.file, line: r.line, inferred_on: String(r.fields["Inferred on"] || "").trim() || null, age_days: ageDays(r, now) }));
}

// Warnings for validate: still unconfirmed after 14 days, or no date to count from.
function issues(model, issue, now = Date.now()) {
  for (const u of unconfirmed(model, now)) {
    const at = `${u.file}:${u.line}`;
    if (u.age_days === null) issue("warning", "inferred-undated", `${u.id} is inferred but has no date: add - **Inferred on:** YYYY-MM-DD so the ${WARN_AFTER_DAYS}-day check can run (a person confirms it with royascaff confirm ${u.id})`, at);
    else if (u.age_days > WARN_AFTER_DAYS) issue("warning", "inferred-unconfirmed", `${u.id} was inferred ${u.age_days} days ago and is still unconfirmed (over ${WARN_AFTER_DAYS} days): a person confirms it with royascaff confirm ${u.id}`, at);
  }
}

module.exports = { isInferred, isConfirmed, isUnconfirmed, unconfirmed, issues, ageDays, WARN_AFTER_DAYS };
