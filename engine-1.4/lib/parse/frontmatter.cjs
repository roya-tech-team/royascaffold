"use strict";

// Front matter: `---\n<yaml>\n---\n` at the very start of a file.
// Data is parsed with a deliberately small YAML subset (flat keys, scalars, inline arrays).
// If re-emitting the data reproduces the original text exactly, only `data` is stored;
// otherwise the original YAML text is kept in `raw` so nothing is ever lost.

const FM_RE = /^---\n([\s\S]*?)\n---(\n|$)/;

function parseScalar(raw) {
  const value = raw.trim();
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseScalar(item));
  }
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

function parseYamlSubset(text) {
  const data = {};
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):[ \t]*(.*)$/);
    if (m) data[m[1]] = parseScalar(m[2]);
  }
  return data;
}

function emitScalar(value) {
  if (Array.isArray(value)) return `[${value.map(emitScalar).join(", ")}]`;
  return String(value);
}

function emitYamlSubset(data) {
  return Object.entries(data)
    .map(([key, value]) => (value === "" ? `${key}:` : `${key}: ${emitScalar(value)}`))
    .join("\n");
}

function splitFrontmatter(text) {
  const m = text.match(FM_RE);
  if (!m) return { frontmatter: null, rest: text };
  const yaml = m[1];
  const data = parseYamlSubset(yaml);
  const frontmatter = { data, newline: m[2] === "\n" };
  if (emitYamlSubset(data) !== yaml) frontmatter.raw = yaml;
  return { frontmatter, rest: text.slice(m[0].length) };
}

function renderFrontmatter(fm) {
  if (!fm) return "";
  const yaml = fm.raw !== undefined ? fm.raw : emitYamlSubset(fm.data);
  return `---\n${yaml}\n---${fm.newline ? "\n" : ""}`;
}

module.exports = { splitFrontmatter, renderFrontmatter, parseScalar, parseYamlSubset, emitYamlSubset };
