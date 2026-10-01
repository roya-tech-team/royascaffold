"use strict";

// A small JSON Schema checker with no dependencies, for the files the engine reads from a person
// (adapter manifests). It supports the subset the contract schemas use: type, enum, const, pattern,
// required, properties, additionalProperties (false or a schema), items, minItems, minimum,
// oneOf, anyOf, $ref to "#/definitions/…". Real validators accept the same schemas.

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

// Returns a list of plain-text problems; empty means the value is valid.
function validate(schema, value, root = schema, at = "$") {
  const errors = [];
  const fail = (msg) => errors.push(`${at}: ${msg}`);
  if (schema.$ref) {
    const target = (root.definitions || {})[schema.$ref.replace(/^#\/definitions\//, "")];
    return target ? validate(target, value, root, at) : [`${at}: unresolved $ref ${schema.$ref}`];
  }
  if (schema.oneOf) {
    const hits = schema.oneOf.filter((s) => validate(s, value, root, at).length === 0).length;
    if (hits !== 1) fail(`matches ${hits} of the allowed shapes (needs exactly 1)`);
  }
  if (schema.anyOf && !schema.anyOf.some((s) => validate(s, value, root, at).length === 0)) fail("matches none of the allowed shapes");
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeOk(t, value))) return [...errors, `${at}: expected ${types.join(" or ")}, got ${typeOf(value)}`];
  }
  if (schema.const !== undefined && value !== schema.const) fail(`expected ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  if (schema.enum && !schema.enum.includes(value)) fail(`${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
  if (schema.pattern && typeof value === "string" && !new RegExp(schema.pattern).test(value)) fail(`"${value}" does not match ${schema.pattern}`);
  if (typeof value === "string" && schema.minLength !== undefined && value.length < schema.minLength) fail(`needs at least ${schema.minLength} characters`);
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) fail(`must be at least ${schema.minimum}`);
  if (typeOf(value) === "object") {
    for (const key of schema.required || []) if (!(key in value)) fail(`missing required "${key}"`);
    const props = schema.properties || {};
    for (const [key, sub] of Object.entries(props)) if (key in value) errors.push(...validate(sub, value[key], root, `${at}.${key}`));
    for (const key of Object.keys(value)) {
      if (key in props) continue;
      if (schema.additionalProperties === false) fail(`unexpected property "${key}"`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === "object") errors.push(...validate(schema.additionalProperties, value[key], root, `${at}.${key}`));
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(`needs at least ${schema.minItems} items`);
    if (schema.items) value.forEach((item, i) => errors.push(...validate(schema.items, item, root, `${at}[${i}]`)));
  }
  return errors;
}

module.exports = { validate };
