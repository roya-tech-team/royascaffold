const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function walkFiles(root, predicate = () => true) {
  if (!fs.existsSync(root)) return [];
  const output = [];
  const stack = [path.resolve(root)];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (entry.isFile() && predicate(absolute)) output.push(absolute);
    }
  }
  return output.sort((a, b) => a.localeCompare(b));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashFiles(files, relativeTo) {
  const input = files
    .map((file) => `${toPosix(path.relative(relativeTo, file))}\0${fs.readFileSync(file, "utf8")}`)
    .join("\0");
  return sha256(input);
}

function assertInside(parent, candidate, label = "path") {
  const resolvedParent = path.resolve(parent);
  const resolvedCandidate = path.resolve(candidate);
  const relative = path.relative(resolvedParent, resolvedCandidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes its allowed root: ${resolvedCandidate}`);
  }
  return resolvedCandidate;
}

function globToRegExp(pattern) {
  const normalized = toPosix(pattern);
  let source = "";
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") source += "[^/]*";
    else if (char === "?") source += ".";
    else source += char.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
  }
  return new RegExp(`^${source}$`);
}

function matchesAny(value, patterns = []) {
  const normalized = toPosix(value);
  return patterns.some((pattern) => globToRegExp(pattern).test(normalized));
}

module.exports = {
  assertInside,
  ensureDir,
  hashFiles,
  matchesAny,
  sha256,
  toPosix,
  walkFiles,
};
