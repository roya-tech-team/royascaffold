# When to use RoyaScaff

RoyaScaff buys you continuity and control, and charges you planning time up front. That is a good trade for some work and a bad trade for others.

## Good fit

**The system will outlive the session.** If you will still be adding features in three months, the blueprint pays for itself the first time someone asks "why is it built this way."

**More than one person, or more than one chat.** The whole resume protocol exists for handoffs. A solo developer working in a single unbroken session gets the least value; a team on branches gets the most.

**The domain has real rules.** Pricing, permissions, workflow states, multi-tenancy. These are exactly the decisions that get silently reinvented by an AI that has not been told about them, and exactly what `project/rules.md` and the data model capture.

**Multiple applications sharing a backend.** The `actions/<app-key>/` structure and the endpoint IDs referenced by pages and views keep an API, a web app, an admin panel, and a mobile client honest about a shared contract.

**You inherited a codebase.** Phase R is worth running on its own even if you never use the other flows. A drift report plus a documented blueprint is valuable output regardless of how you continue.

**You want reviewable AI work.** If you are uncomfortable merging code you did not read line by line, the gates let you review plans instead — which is both faster and catches a more useful class of error.

## Poor fit

**Throwaway work.** A one-off script, a spike, a demo you will delete Friday. Phase 0–2 will cost more than the thing is worth. Just prompt the model.

**A single tiny change to a project with no blueprint.** Phases 5, P, and 6 all require `project/profile.md` to exist. Bootstrapping a blueprint to change one CSS value is not a sensible trade — though if you plan to keep working in that codebase, Phase R is a reasonable investment.

**Pure exploration.** When you do not yet know what you are building, writing a description and a data model is premature. Explore first, then run `/initial-build` once you know the shape.

**Non-application work.** The engine models modules, entities, services, endpoints, and pages. Data pipelines, infrastructure repos, ML training code, and libraries do not map cleanly onto that vocabulary.

## How it differs from the alternatives

### Versus prompting the AI directly

Direct prompting is faster for the first feature and slower for every one after. It has no persistent state, so each session re-derives the architecture; no scope boundary, so changes ripple unpredictably; and no verification beyond "it compiles."

RoyaScaff costs you Phase 0–2 up front and then gets cheaper: each subsequent change loads a small pack instead of the whole system.

### Versus a rules file or long system prompt

A rules file (`.cursorrules`, `AGENTS.md`, a system prompt) tells the model **how to write code**. That is genuinely useful, and RoyaScaff includes exactly that in [engine/rules/](../../engine/rules/).

What a rules file cannot do is tell the model **what exists**. It cannot say that `EP-BILLING-03` is specced but not built, that the export feature was deferred pending a payment provider decision, or that another branch is mid-flight on the same module. Rules govern style; the blueprint governs state. RoyaScaff is the second thing, and it happens to include the first.

### Versus spec-first and design-doc tools

Most spec tooling produces a document and stops. The document is accurate the day it is written and drifts from then on, because nothing forces it to change when the code does.

RoyaScaff's distinguishing property is the closed loop: specs are written, code is implemented from a pack rather than from the specs directly, verification compares code against that pack, and only then does main get updated. The plan cannot fall behind the code, because updating the plan is a step in shipping the code.

### Versus a full application generator

Generators optimize for the first output. They tend to produce a codebase in their own shape, which you then fight or abandon.

RoyaScaff generates no code by itself and imposes no framework. It describes architecture in terms your stack already uses (`controller -> service -> repository`, `page -> feature service -> HTTP client`) and records your actual stack in `project/profile.md`. The engine never learns what framework you use; the blueprint does.

## Cost, stated plainly

| You pay | You get |
|---------|---------|
| Phase 0–2 before the first line of code | A blueprint that makes every later change cheaper |
| Five approval gates per change | Review at the plan level instead of the diff level |
| Discipline to keep the indexes in sync | Any chat can resume any work |
| One pack at a time instead of one big session | Changes that stay the size you asked for |

If your work is short-lived, that is overhead. If it is not, it is the cheapest part of the project.

## Related

- [What is RoyaScaff](01-what-is-royascaff.md)
- [Benefits](03-benefits.md)
- [Install](../guides/01-install.md)
- [Quickstart](../guides/02-quickstart.md)
