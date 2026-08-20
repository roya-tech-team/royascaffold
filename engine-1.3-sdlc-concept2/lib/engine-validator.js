const fs = require("fs");
const path = require("path");
const { parseDocument } = require("./markdown");
const { formatAjvErrors, loadSchemas } = require("./schemas");
const { walkFiles } = require("./fs-utils");

function validateEngine(engineRoot) {
  const root = path.resolve(engineRoot);
  const packageRoot = fs.existsSync(path.join(root, "package.json")) ? root : path.resolve(__dirname, "..");
  const { ajv } = loadSchemas();
  const workflowValidator = ajv.getSchema("royascaff/workflow-definition/v1");
  const skillValidator = ajv.getSchema("royascaff/skill/v1");
  const diagnostics = [];
  const workflows = walkFiles(path.join(packageRoot, "engine", "workflows"), (file) => file.endsWith(".md"));
  const skills = walkFiles(path.join(packageRoot, "skills"), (file) => path.basename(file) === "SKILL.md");
  for (const file of workflows) {
    const data = parseDocument(file).data;
    if (!workflowValidator(data)) diagnostics.push({ level: "error", code: "WORKFLOW_SCHEMA", file: path.relative(packageRoot, file), message: formatAjvErrors(workflowValidator.errors) });
  }
  for (const file of skills) {
    const data = parseDocument(file).data;
    if (!skillValidator(data)) diagnostics.push({ level: "error", code: "SKILL_SCHEMA", file: path.relative(packageRoot, file), message: formatAjvErrors(skillValidator.errors) });
  }
  if (!workflows.length) diagnostics.push({ level: "error", code: "NO_WORKFLOWS", file: "engine/workflows", message: "No workflow definitions found" });
  if (!skills.length) diagnostics.push({ level: "error", code: "NO_SKILLS", file: "skills", message: "No skill definitions found" });
  return { root: packageRoot, workflows: workflows.length, skills: skills.length, diagnostics };
}

module.exports = { validateEngine };
