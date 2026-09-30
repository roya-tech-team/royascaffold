"use strict";

// Adapters (plan file 02 §10, file 11 WP6): technology guidance as short cards in
// `engine/adapters/<name>.md`, chosen in profile.md (`adapters: [web-ui]`).
// The engine uses them in three places:
//   next      names the adapter card to read at the Design and Check stages
//   context   adds the adapter's "Rules" section to every Context Pack
//   validate  adds the adapter's "Words" to the business-language check
// Manifests, inventory kinds and runners come with 1.5.

const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "adapters");
const KNOWN = () => fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort();

function adaptersOf(model) {
  const raw = model.profile.adapters;
  const list = (Array.isArray(raw) ? raw : raw ? String(raw).split(",") : []).map((x) => String(x).trim()).filter(Boolean);
  const known = KNOWN();
  const names = list.filter((n) => known.includes(n));
  return names.length ? names : model.is14 ? ["generic"] : [];
}

function readAdapter(name) {
  const file = path.join(DIR, `${name}.md`);
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, "utf8");
  const part = (title) => {
    const m = text.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
    return m ? m[1].trim() : "";
  };
  return { name, card: `adapters/${name}.md`, design: part("Design"), rules: part("Rules"), check: part("Check"), words: part("Words").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean) };
}

function adapterCards(model) {
  return adaptersOf(model).map((n) => `adapters/${n}.md`);
}

module.exports = { DIR, KNOWN, adaptersOf, readAdapter, adapterCards };
