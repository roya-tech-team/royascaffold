"use strict";

// Stable RoyaScaff IDs: uppercase prefix plus at least two more segments, e.g. REQ-CAMP-001.
const ID_SOURCE = "[A-Z][A-Z0-9]*(?:-[A-Z0-9]+){2,}";

function findIds(text) {
  if (!text) return [];
  const re = new RegExp(`\\b${ID_SOURCE}\\b`, "g");
  return [...new Set(text.match(re) || [])];
}

module.exports = { ID_SOURCE, findIds };
