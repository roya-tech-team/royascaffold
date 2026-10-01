"use strict";

// Kinds come from the ID prefix (authoritative in 1.4). Relation types come from field keys.

const KIND_BY_PREFIX = {
  OUT: "outcome",
  CAP: "feature",
  SLC: "slice",
  MS: "milestone",
  REQ: "requirement",
  UC: "use-case",
  NFR: "nfr",
  CON: "concept",
  INV: "invariant",
  WF: "workflow",
  CTR: "contract",
  CMP: "component",
  ACT: "action",
  SVC: "action",
  EP: "action",
  PG: "action",
  VW: "action",
  RULE: "rule",
  ADR: "decision",
  TEST: "test",
  CHG: "change",
  TASK: "task",
  EVD: "evidence",
  REL: "release",
  INC: "incident",
  APP: "app",
  DOC: "document",
  QST: "question",
  ASM: "assumption",
  SRC: "source",
};

function kindOf(id) {
  const prefix = id.split("-")[0];
  return KIND_BY_PREFIX[prefix] || "unknown";
}

// Field key (case-insensitive) -> relation type. Keys not listed here are plain fields:
// IDs written inside them count as mentions, never as relations.
const RELATION_KEYS = {
  // 1.4 hierarchy
  outcome: "outcome",
  feature: "feature",
  delivers: "delivers",
  milestone: "milestone",
  inputs: "inputs",
  "input ids": "inputs",
  proves: "proves",
  realizes: "realizes",
  verifies: "verifies",
  covers: "verifies",
  affects: "affects",
  handoff: "handoff",
  includes: "includes",
  "applies to": "applies_to",
  "covered by": "covered_by",
  "deferred to": "deferred_to",
  // 1.3 typed relation labels
  satisfies: "satisfies",
  "constrained by": "constrained_by",
  "described by": "described_by",
  "realized by": "realized_by",
  exposes: "exposes",
  accepts: "accepts",
  returns: "returns",
  implements: "implements",
  "depends on": "depends_on",
  "maps to": "maps_to",
  "verified by": "verified_by",
  supersedes: "supersedes",
  supports: "supports",
  configures: "configures",
  migrates: "migrates",
  "owned by": "owned_by",
  "called components": "calls",
};

function relationType(fieldKey) {
  return RELATION_KEYS[fieldKey.trim().toLowerCase()] || null;
}

const HORIZONS = ["now", "next", "later", "backlog"];

const CHANGE_KINDS = ["feature", "bug", "polish", "refactor", "chore", "knowledge", "migration"];

// 1.3 `intent` values -> 1.4 change kind.
const INTENT_TO_KIND = {
  feature: "feature",
  change: "feature",
  "initial-build": "feature",
  greenfield: "feature",
  bug: "bug",
  "bug-fix": "bug",
  polish: "polish",
  refactor: "refactor",
  knowledge: "knowledge",
  "knowledge-only": "knowledge",
  migration: "migration",
  "reverse-engineer": "knowledge",
  reconcile: "knowledge",
  release: "chore",
};

const CHANGE_STATUSES = ["draft", "analyzed", "approved", "ready", "in-progress", "verified", "reconciled", "closed", "blocked", "failed", "cancelled"];

module.exports = { KIND_BY_PREFIX, kindOf, relationType, RELATION_KEYS, HORIZONS, CHANGE_KINDS, INTENT_TO_KIND, CHANGE_STATUSES };
