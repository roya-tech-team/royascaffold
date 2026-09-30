---
document_id: DOC-{{CODE}}-EXPERIENCE
title: Experience
layer: design
schema_version: 2
document_status: approved
owners: [{{OWNER}}]
---

# Experience

> **What:** what the user sees and does: screens, interactions, states, and the look (design tokens)
> **Read when:** designing or checking anything a user sees or touches

## 1. Screens and first view

_Each screen, what it is for, and what the user sees first when it opens._

## 2. Interactions and states

_For each interaction: default, hover, focus, selected, disabled; for each data view: loading, empty, error, success._

## 3. Layout and responsiveness

_Target screens (desktop, tablet, phone), what moves or hides on each, and what must never be covered._

## 4. Design tokens

_Colors, type, spacing, radii, motion timings and effects, each with a name and a value. The code reads these from one place._

## 5. Accessibility

_Keyboard path through the main flow, focus visibility, contrast, labels, reduced motion._

## Record format (example)

```md
## 4. Design tokens

| Token | Value | Use |
|---|---|---|
| `color.bg` | `#070b14` | page and scene background |
| `color.accent` | `#6ee7ff` | selected item, focus ring |
| `motion.focus` | 600 ms ease-out | camera move to a selected item |
```
