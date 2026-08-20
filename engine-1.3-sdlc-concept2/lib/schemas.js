const fs = require("fs");
const path = require("path");
const Ajv = require("ajv/dist/2020");

const SCHEMA_ROOT = path.resolve(__dirname, "..", "schemas");

function loadSchemas() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const schemas = {};
  for (const name of fs.readdirSync(SCHEMA_ROOT).filter((file) => file.endsWith(".json"))) {
    const schema = JSON.parse(fs.readFileSync(path.join(SCHEMA_ROOT, name), "utf8"));
    ajv.addSchema(schema, schema.$id);
    schemas[schema.$id] = schema;
  }
  return { ajv, schemas };
}

function formatAjvErrors(errors = []) {
  return errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
}

module.exports = { formatAjvErrors, loadSchemas, SCHEMA_ROOT };
