"use strict";

// Path globs used by code maps (`Code:`) and tasks (`Allowed paths:`), relative to the repo root.
//   **  any characters including "/"   ·   *  any characters except "/"   ·   ?  one character
// A pattern without wildcards matches the path itself and everything below it.

function globToRegExp(pattern) {
  const p = pattern.trim().replace(/^\.\//, "").replace(/\/+$/, "");
  if (!/[*?]/.test(p)) return new RegExp(`^${p.replace(/[.+^${}()|[\]\\]/g, "\\$&")}(?:/.*)?$`);
  let re = "";
  for (let i = 0; i < p.length; i += 1) {
    const ch = p[i];
    if (ch === "*" && p[i + 1] === "*") {
      re += p[i + 2] === "/" ? "(?:.*/)?" : ".*";
      i += p[i + 2] === "/" ? 2 : 1;
    } else if (ch === "*") re += "[^/]*";
    else if (ch === "?") re += "[^/]";
    else re += ch.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}$`);
}

// "a/**, b/*.ts" or "`a/**`" -> ["a/**", "b/*.ts"]
function patternList(value) {
  if (!value) return [];
  return String(value).replace(/`/g, "").split(",").map((x) => x.trim()).filter(Boolean);
}

function matchesAny(file, patterns) {
  return patterns.some((p) => globToRegExp(p).test(file));
}

module.exports = { globToRegExp, patternList, matchesAny };
