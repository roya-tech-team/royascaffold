"use strict";

const fs = require("fs");
const path = require("path");

const SKIP = new Set(["node_modules", "dist", "build", "coverage", "vendor"]);

// Files below root/rel (repo-relative paths), skipping dot-folders and dependency/build folders.
function listFiles(root, rel) {
  const out = [];
  const walk = (dirRel) => {
    const abs = path.join(root, dirRel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith(".") || SKIP.has(e.name)) continue;
      const r = dirRel ? `${dirRel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(r);
      else out.push(r);
    }
  };
  walk(rel);
  return out;
}

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".vue", ".svelte", ".py", ".go", ".java", ".kt", ".cs", ".php", ".rb", ".rs", ".swift", ".dart", ".sql"];

module.exports = { listFiles, SOURCE_EXTENSIONS };
