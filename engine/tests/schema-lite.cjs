"use strict";

// A tiny JSON Schema checker for the contract tests (no dependencies). It supports the subset the
// contract schemas use: type, enum, const, pattern, required, properties, additionalProperties,
// items, minItems, oneOf, anyOf, $ref to "#/definitions/…". Studio uses a full validator; the
// schemas stay standard so both agree.

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (Number.isInteger(v)) return "integer";
  return typeof v;
}

const typeOk = (want, v) => {
  const got = typeOf(v);
  return want === got || (want === "number" && got === "integer");
};

function validate(schema, value, root = schema, at = "$") {
  const errors = [];
  const fail = (msg) => errors.push(`${at}: ${msg}`);
  if (schema.$ref) {
    const name = schema.$ref.replace(/^#\/definitions\//, "");
    const target = (root.definitions || {})[name];
    if (!target) return [`${at}: unresolved $ref ${schema.$ref}`];
    return validate(target, value, root, at);
  }
  if (schema.oneOf) {
    const hits = schema.oneOf.filter((s) => validate(s, value, root, at).length === 0).length;
    if (hits !== 1) fail(`matches ${hits} of oneOf (needs exactly 1)`);
  }
  if (schema.anyOf && !schema.anyOf.some((s) => validate(s, value, root, at).length === 0)) fail("matches none of anyOf");
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeOk(t, value))) return [...errors, `${at}: expected ${types.join("|")}, got ${typeOf(value)}`];
  }
  if (schema.const !== undefined && value !== schema.const) fail(`expected ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  if (schema.enum && !schema.enum.includes(value)) fail(`${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
  if (schema.pattern && typeof value === "string" && !new RegExp(schema.pattern).test(value)) fail(`"${value}" does not match ${schema.pattern}`);
  if (typeOf(value) === "object") {
    for (const key of schema.required || []) if (!(key in value)) fail(`missing required "${key}"`);
    const props = schema.properties || {};
    for (const [key, sub] of Object.entries(props)) if (key in value) errors.push(...validate(sub, value[key], root, `${at}.${key}`));
    if (schema.additionalProperties === false) for (const key of Object.keys(value)) if (!(key in props)) fail(`unexpected property "${key}"`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(`needs at least ${schema.minItems} items`);
    if (schema.items) value.forEach((item, i) => errors.push(...validate(schema.items, item, root, `${at}[${i}]`)));
  }
  return errors;
}

module.exports = { validate };
