---
document_id: DOC-{{CODE}}-DISCOVERY
title: Discovery
layer: discovery
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Discovery

> **What:** what we know, what we assumed and what we asked before planning {{NAME}}
> **Read when:** starting the project, or when a plan seems to contradict what the person wants

Fill every topic from the request. For every gap write a question (`QST-`); for everything you inferred write an assumption (`ASM-`). Then ask the person in the chat and record each answer. `royascaff approve project` refuses while a topic is empty or a question is open.

## 1. Users and roles

_Who uses the product, and what each kind of user wants._

## 2. Problem and outcomes

_What is hard today, and what will be true when this works (link OUT- records in the brief)._

## 3. Scope and out of scope

_What the first release includes, and what it deliberately leaves out._

## 4. Success measures

_How the person will judge it: numbers, a review, a demo._

## 5. Constraints

_Time, budget, platforms, devices, languages, rules the team must follow._

## 6. Technology

_Always two or three options with a recommendation, even when the request names a stack. The person confirms the choice; it is then recorded as a decision with `Scope: project`._

## 7. Data and content

_Where the data comes from, how much, how real it must look, and who owns it._

## 8. Look, feel and references

_References, tone, brand, density, motion; what must not be copied._

_For a web-ui app, end with `**Visual bar:**` and at least 5 list lines taken from the request: what good looks like, and what is not acceptable. The person scores every UI change against it._

## Questions and assumptions

_Added with `royascaff new record question "<question>" --topic <topic>` and `royascaff new record assumption "<what you assumed>" --topic <topic>`. Write the person's answer in `Answer:` and where it came from in `Source:`._

## Record format (example)

```md
## 6. Technology

- **Option A:** React + TypeScript + Vite: large ecosystem, matches the team's skills
- **Option B:** Vue + TypeScript: simpler templates, smaller team knowledge

**Recommendation:** Option A, because the team already ships React and needs the 3D ecosystem.

### QST-{{CODE}}-001 · Who judges the visual quality?

- **Topic:** look
- **Answer:** the product owner, on a 27-inch desktop screen
- **Source:** chat 2026-09-30

### ASM-{{CODE}}-001 · The first release is desktop-first

- **Topic:** constraints
- **Basis:** the request says "desktop is the priority"
```
