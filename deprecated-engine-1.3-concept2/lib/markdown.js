const fs = require("fs");
const YAML = require("yaml");

function parseFrontMatter(content, file = "<memory>") {
  const normalized = content.replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---\n") && !normalized.startsWith("---\r\n")) {
    return { data: {}, body: normalized, raw: "" };
  }
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`Unclosed front matter in ${file}`);
  let data;
  try {
    data = YAML.parse(match[1]) || {};
  } catch (error) {
    throw new Error(`Invalid YAML front matter in ${file}: ${error.message}`);
  }
  return { data, body: normalized.slice(match[0].length), raw: match[1] };
}

function parseDocument(file) {
  const content = fs.readFileSync(file, "utf8");
  return { file, content, ...parseFrontMatter(content, file) };
}

function parseTypedBlocks(content, kind, file = "<memory>") {
  const expression = new RegExp("```yaml\\s+" + kind + "\\s*\\r?\\n([\\s\\S]*?)```", "g");
  const blocks = [];
  let match;
  while ((match = expression.exec(content))) {
    try {
      blocks.push({ data: YAML.parse(match[1]) || {}, raw: match[1], index: match.index });
    } catch (error) {
      throw new Error(`Invalid ${kind} YAML block in ${file}: ${error.message}`);
    }
  }
  return blocks;
}

function extractHeadingSection(content, artifactId) {
  const escaped = artifactId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startExpression = new RegExp(`^(#{2,6})\\s+${escaped}(?:\\s|$).*`, "m");
  const start = startExpression.exec(content);
  if (!start) return "";
  const level = start[1].length;
  const remaining = content.slice(start.index + start[0].length);
  const endExpression = new RegExp(`^#{1,${level}}\\s+`, "m");
  const end = endExpression.exec(remaining);
  return content.slice(start.index, end ? start.index + start[0].length + end.index : content.length).trim();
}

function stringifyDocument(data, body) {
  return `---\n${YAML.stringify(data).trimEnd()}\n---\n\n${body.trimStart()}`;
}

function writeDocument(file, data, body) {
  fs.writeFileSync(file, stringifyDocument(data, body), "utf8");
}

module.exports = {
  extractHeadingSection,
  parseDocument,
  parseFrontMatter,
  parseTypedBlocks,
  stringifyDocument,
  writeDocument,
};
