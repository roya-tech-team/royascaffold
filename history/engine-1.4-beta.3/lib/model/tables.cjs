"use strict";

// Minimal GitHub-style Markdown table reader, used for roadmap slice tables.

// Splits a table row on unescaped pipes; `\|` inside a cell is kept as a literal pipe.
function splitRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells = [];
  let current = "";
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === "\\" && s[i + 1] === "|") {
      current += "|";
      i += 1;
    } else if (s[i] === "|") {
      cells.push(current.trim());
      current = "";
    } else current += s[i];
  }
  cells.push(current.trim());
  return cells;
}

function escapeCell(text) {
  return String(text ?? "").replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

const SEPARATOR_RE = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

// Returns tables found in `text`: { header: [...], rows: [{cells, lineOffset}], startLine, endLine }.
function readTables(text) {
  const lines = text.split("\n");
  const tables = [];
  let i = 0;
  while (i < lines.length - 1) {
    if (lines[i].trim().startsWith("|") && SEPARATOR_RE.test(lines[i + 1].trim())) {
      const header = splitRow(lines[i]);
      const rows = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        rows.push({ cells: splitRow(lines[j]), lineOffset: j });
        j += 1;
      }
      tables.push({ header, rows, startLine: i, endLine: j - 1 });
      i = j;
    } else i += 1;
  }
  return tables;
}

function cellIds(cell, findIds) {
  return findIds(cell.replace(/`/g, " "));
}

module.exports = { readTables, splitRow, cellIds, escapeCell };
