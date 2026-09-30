"use strict";

// Brief coverage (plan file 14, WP-C1 / file 13 P1): the original request is kept verbatim in
// knowledge/00-discovery/request.md; each concrete demand is a SRC- record whose Quote must be
// found in the request, and which is Covered by a requirement/NFR/feature or marked Out of scope.

const REQUEST_FILE = "knowledge/00-discovery/request.md";
const COVERAGE_FILE = "knowledge/00-discovery/coverage.md";

const norm = (t) => String(t || "").replace(/[`*_]/g, "").replace(/["“”‘’']/g, "'").replace(/\s+/g, " ").trim().toLowerCase();

// The request text: everything under "## Request" (and later dated sections), without hint lines.
function requestText(text) {
  if (text === null || text === undefined) return "";
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const at = body.search(/^## Request\b/m);
  if (at < 0) return "";
  return body.slice(at).split("\n").slice(1).filter((l) => !/^\s*_.*_\s*$/.test(l)).join("\n").trim();
}

// A quote matches when every part (split by … or ...) appears in the request, in order.
function quoteFound(request, quote) {
  const r = norm(request);
  const parts = String(quote || "").split(/…|\.\.\./).map(norm).filter(Boolean);
  if (!parts.length) return false;
  let from = 0;
  for (const p of parts) {
    const i = r.indexOf(p, from);
    if (i < 0) return false;
    from = i + p.length;
  }
  return true;
}

// List items of the request (bullets and numbered lines), for the "possibly not covered" list.
function listItems(request) {
  return request.split("\n").map((l) => l.match(/^\s*(?:[-*+•]|\d+[.)])\s+(.{3,})$/)).filter(Boolean).map((m) => m[1].trim());
}

function coverageOf(model, files) {
  const { renderMarkdown } = require("./parse/markdown.cjs");
  const f = files.find((x) => x.path === REQUEST_FILE);
  const request = f ? requestText(renderMarkdown(f)) : "";
  const sources = [...model.records.values()].filter((r) => r.kind === "source").map((r) => {
    const quote = String(r.fields.Quote || "").trim();
    const covered = r.relations.filter((x) => x.type === "covered_by").map((x) => x.to);
    const outOfScope = String(r.fields["Out of scope"] || "").trim();
    return { id: r.id, title: r.title, file: r.file, line: r.line, quote, found: request ? quoteFound(request, quote) : false, covered, outOfScope };
  });
  const quoteParts = sources.flatMap((s) => s.quote.split(/…|\.\.\./).map(norm).filter((p) => p.length >= 3));
  const items = listItems(request);
  const unquoted = items.filter((it) => {
    const n = norm(it);
    return !quoteParts.some((q) => n.includes(q) || q.includes(n));
  });
  return {
    exists: Boolean(f),
    filled: request.length > 0,
    request,
    sources,
    covered: sources.filter((s) => s.covered.length).length,
    outOfScope: sources.filter((s) => !s.covered.length && s.outOfScope).length,
    uncovered: sources.filter((s) => !s.covered.length && !s.outOfScope),
    items: items.length,
    unquoted,
  };
}

module.exports = { coverageOf, quoteFound, requestText, listItems, REQUEST_FILE, COVERAGE_FILE };
