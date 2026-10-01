# Adapter · python

> **What:** guidance for Python services, scripts and libraries
> **Read when:** the stage card or `royascaff next` names this adapter

## Design

- Group code in packages by responsibility; one module, one reason to change. Name the component for each package.
- Keep entry points (command line, web routes, jobs) thin: they parse input and call functions that hold the rules.
- Describe data shapes once (dataclasses, models or schemas) and reuse them; record migrations in the data document.
- Plan the command line's help text and error messages in the experience document: they are the interface.

## Rules

- Functions that hold business rules do not read files, the network or the clock directly; they take what they need.
- No bare `except:`; catch what you can handle and let the rest stop the program with a clear message.
- Every public function has type hints; the type check passes.
- Dependencies are pinned in the lockfile; a new one needs a reason in the decision log.
- Tests call the code; they never read source files as text.

## Check

- Runner: tests, type check and lint pass; the recorded run of the command line reads well to a person.
- Each change to a function that holds a rule has a test for the normal case and one failure case.

## Words

pytest, venv, pip, pyproject, decorator, docstring, kwargs, dataclass
