const path = require("path");
const { buildContext, validateTaskContext } = require("./context");
const { createChange, transitionChange } = require("./change");
const { validateEngine } = require("./engine-validator");
const { generateIndexes } = require("./indexer");
const { validateProject } = require("./project");
const { reconcile } = require("./reconcile");
const { initializeProject, scaffoldEngine } = require("./scaffold");

function parseArgs(args) {
  const positional = [];
  const flags = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      index += 1;
    } else flags[key] = true;
  }
  return { positional, flags };
}

function help() {
  return `RoyaScaff v1.3 Concept 2 — SDLC knowledge compiler

Usage:
  royascaff13 validate project [projectRoot]
  royascaff13 validate engine [engineRoot]
  royascaff13 validate change <CHG-ID> [--project <projectRoot>]
  royascaff13 validate task <TASK-ID> [--project <projectRoot>] [--changed-files <path,path>]
  royascaff13 validate reconcile <CHG-ID> [--project <projectRoot>]
  royascaff13 index [projectRoot]
  royascaff13 context build --task <TASK-ID> [--project <projectRoot>]
  royascaff13 change create --title <title> [--type change] [--risk medium] [--owner owner] [--affects ID,ID] [--exclusive-artifacts ID,ID] [--exclusive-paths path,path] [--project root]
  royascaff13 change transition <CHG-ID> <state> [--project root]
  royascaff13 reconcile <CHG-ID> [--project root] [--apply]
  royascaff13 init-project [projectRoot] [--name project] [--owner owner]
  royascaff13 scaffold [targetDir] [--cursor] [--claude] [--force]

Mutating lifecycle operations are scoped. Reconcile previews unless --apply is provided.`;
}

function printDiagnostics(diagnostics) {
  for (const item of diagnostics) {
    const prefix = item.level === "error" ? "ERROR" : "WARN ";
    console.log(`${prefix} ${item.code}${item.file ? ` [${item.file}]` : ""}: ${item.message}`);
  }
}

async function run(argv) {
  const { positional, flags } = parseArgs(argv.slice(2));
  const [command, subcommand, third] = positional;
  if (!command || command === "help" || flags.help) {
    console.log(help());
    return;
  }

  if (command === "validate") {
    if (subcommand === "engine") {
      const result = validateEngine(third || process.cwd());
      printDiagnostics(result.diagnostics);
      if (result.diagnostics.some((item) => item.level === "error")) throw new Error("Engine validation failed");
      console.log(`Engine valid: ${result.workflows} workflows, ${result.skills} skills.`);
      return;
    }
    if (subcommand === "project") {
      const root = path.resolve(third || flags.project || process.cwd());
      const result = validateProject(root);
      printDiagnostics(result.diagnostics);
      const errors = result.diagnostics.filter((item) => item.level === "error");
      if (errors.length) throw new Error(`Project validation failed with ${errors.length} error(s)`);
      console.log(`Project valid: ${result.artifacts.size} artifacts, ${result.codeMapEntries.length} code-map entries, ${result.changes.length} active changes, ${result.tasks.length} active tasks.`);
      return;
    }
    if (subcommand === "change") {
      if (!third) throw new Error("validate change requires <CHG-ID>");
      const result = validateProject(path.resolve(flags.project || process.cwd()));
      printDiagnostics(result.diagnostics);
      const errors = result.diagnostics.filter((item) => item.level === "error");
      const change = result.changes.find((item) => item.id === third);
      if (!change) throw new Error(`Active change not found: ${third}`);
      if (errors.length) throw new Error(`Change validation failed with ${errors.length} project/change error(s)`);
      console.log(`Change valid: ${change.id} is ${change.state} at baseline ${change.base_revision}.`);
      return;
    }
    if (subcommand === "task") {
      if (!third) throw new Error("validate task requires <TASK-ID>");
      const result = validateTaskContext(path.resolve(flags.project || process.cwd()), third, { changedFiles: flags["changed-files"] ? flags["changed-files"].split(",").filter(Boolean) : [] });
      printDiagnostics(result.diagnostics);
      const errors = result.diagnostics.filter((item) => item.level === "error");
      if (errors.length) throw new Error(`Task validation failed with ${errors.length} error(s)`);
      console.log(`Task valid: ${result.task.id}; Context Manifest and Pack are current.`);
      return;
    }
    if (subcommand === "reconcile") {
      if (!third) throw new Error("validate reconcile requires <CHG-ID>");
      const result = reconcile(path.resolve(flags.project || process.cwd()), third);
      console.log(`Reconciliation valid: ${result.operations.length} scoped operation(s) are ready for preview.`);
      return;
    }
    throw new Error("validate requires 'project', 'engine', 'change', 'task', or 'reconcile'");
  }

  if (command === "index") {
    try {
      const result = generateIndexes(path.resolve(subcommand || flags.project || process.cwd()));
      console.log(`Generated ${result.generated.length} indexes from ${result.artifacts.size} artifacts.`);
    } catch (error) {
      if (error.diagnostics) printDiagnostics(error.diagnostics);
      throw error;
    }
    return;
  }

  if (command === "context" && subcommand === "build") {
    if (!flags.task) throw new Error("context build requires --task <TASK-ID>");
    try {
      const result = buildContext(path.resolve(flags.project || process.cwd()), flags.task);
      console.log(`Context built: ${result.manifest.required.length} required artifacts, ${result.manifest.budget.estimated_tokens} estimated tokens.`);
      console.log(result.packFile);
    } catch (error) {
      if (error.diagnostics) printDiagnostics(error.diagnostics);
      throw error;
    }
    return;
  }

  if (command === "change" && subcommand === "create") {
    if (!flags.title) throw new Error("change create requires --title");
    const result = createChange(path.resolve(flags.project || process.cwd()), {
      title: flags.title,
      type: flags.type,
      risk: flags.risk,
      owner: flags.owner,
      baseRevision: flags["base-revision"],
      affects: flags.affects ? flags.affects.split(",").filter(Boolean) : [],
      newArtifacts: flags["new-artifacts"] ? flags["new-artifacts"].split(",").filter(Boolean) : [],
      dependsOn: flags["depends-on"] ? flags["depends-on"].split(",").filter(Boolean) : [],
      exclusiveArtifacts: flags["exclusive-artifacts"] ? flags["exclusive-artifacts"].split(",").filter(Boolean) : [],
      exclusivePaths: flags["exclusive-paths"] ? flags["exclusive-paths"].split(",").filter(Boolean) : [],
    });
    console.log(`Created ${result.id} at ${result.path}`);
    return;
  }

  if (command === "change" && subcommand === "transition") {
    const changeId = third;
    const nextState = positional[3];
    if (!changeId || !nextState) throw new Error("change transition requires <CHG-ID> <state>");
    const result = transitionChange(path.resolve(flags.project || process.cwd()), changeId, nextState);
    console.log(`${result.id}: ${result.previous} → ${result.state}`);
    return;
  }

  if (command === "reconcile") {
    if (!subcommand) throw new Error("reconcile requires <CHG-ID>");
    const result = reconcile(path.resolve(flags.project || process.cwd()), subcommand, { apply: Boolean(flags.apply) });
    if (!result.apply) {
      console.log(`Reconciliation preview for ${result.change}:`);
      for (const operation of result.operations) console.log(`  ${operation.operation}: ${operation.relative}`);
      console.log("Run again with --apply after review.");
    } else console.log(`Reconciled ${result.change}; archived at ${result.archive}`);
    return;
  }

  if (command === "init-project") {
    const result = initializeProject(path.resolve(subcommand || flags.project || process.cwd()), { project: flags.name, owner: flags.owner });
    console.log(`Initialized v1.3 project knowledge at ${result.root}`);
    return;
  }

  if (command === "scaffold") {
    const targets = [];
    if (flags.cursor) targets.push("cursor");
    if (flags.claude) targets.push("claude");
    const result = scaffoldEngine(path.resolve(subcommand || process.cwd()), { force: Boolean(flags.force), targets: targets.length ? targets : ["cursor"] });
    console.log(`Installed RoyaScaff v1.3 engine at ${result.installedRoot}`);
    console.log(`Agent targets: ${result.targets.join(", ")}`);
    return;
  }

  throw new Error(`Unknown command.\n\n${help()}`);
}

module.exports = { help, parseArgs, run };
