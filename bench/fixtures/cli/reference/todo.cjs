"use strict";

// The reference solution of the CLI fixture. Scripted agents copy it; real agents write their own.

const fs = require("fs");
const path = require("path");

const FILE = path.join(process.cwd(), "tasks.json");
const USAGE = `Usage: node todo.cjs <command>
  add "<title>"   add a task
  list            show every task
  done <id>       mark a task as finished
  remove <id>     delete a task
  help            show this message`;

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { next: 1, tasks: [] };
  }
}
const save = (data) => fs.writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`);
const stop = (message, code) => {
  process.stderr.write(`${message}\n`);
  process.exit(code);
};

const [command, ...args] = process.argv.slice(2);
const data = load();
const find = (raw) => {
  const id = Number(raw);
  const task = Number.isInteger(id) ? data.tasks.find((t) => t.id === id) : null;
  if (!task) stop(`No task with id ${raw === undefined ? "(none given)" : raw}. Run "node todo.cjs list" to see the ids.`, 1);
  return task;
};

if (!command || command === "help") process.stdout.write(`${USAGE}\n`);
else if (command === "add") {
  const title = (args[0] || "").trim();
  if (!title) stop('Title is required. Give the task a title: node todo.cjs add "Buy milk"', 1);
  data.tasks.push({ id: data.next, title, done: false });
  data.next += 1;
  save(data);
  process.stdout.write(`Added ${data.next - 1}: ${title}\n`);
} else if (command === "list") {
  process.stdout.write(data.tasks.length ? `${data.tasks.map((t) => `${t.id} [${t.done ? "x" : " "}] ${t.title}`).join("\n")}\n` : "No tasks yet.\n");
} else if (command === "done") {
  const task = find(args[0]);
  task.done = true;
  save(data);
  process.stdout.write(`Done ${task.id}: ${task.title}\n`);
} else if (command === "remove") {
  const task = find(args[0]);
  data.tasks = data.tasks.filter((t) => t !== task);
  save(data);
  process.stdout.write(`Removed ${task.id}: ${task.title}\n`);
} else stop(`Unknown command "${command}".\n${USAGE}`, 2);
