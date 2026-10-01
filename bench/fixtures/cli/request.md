# Request: a small to-do list command line tool

Build a command line tool in one file, `todo.cjs`, in the folder you start in. It uses only what Node.js
ships with. Do not install anything.

## Commands

- `node todo.cjs add "<title>"` adds a task and prints `Added 1: <title>`. Ids start at 1 and go up by one.
- `node todo.cjs list` prints one line per task, like `1 [ ] Buy milk`. A finished task shows `[x]`. With no
  tasks it prints `No tasks yet.`
- `node todo.cjs done <id>` marks a task as finished and prints `Done 1: <title>`.
- `node todo.cjs remove <id>` deletes a task and prints `Removed 1: <title>`.
- `node todo.cjs help`, or no command at all, prints the usage: one line per command.

## Rules

- Tasks are kept in `tasks.json` in the folder the command runs from. The file is created when it is needed.
- An empty title is refused with the message `Title is required`, exit code 1, and nothing is saved.
- An unknown id prints `No task with id <id>` and exits with code 1.
- An unknown command prints the usage and exits with code 2.
- Every error message says what to do next, in plain words.
- Ids are never reused: after removing task 2 of 3, the next task added is 4.

## What good looks like

- A person can learn the whole tool from `help` alone.
- A mistake never loses the tasks that are already saved.
- Nothing is printed that the person did not ask for.
