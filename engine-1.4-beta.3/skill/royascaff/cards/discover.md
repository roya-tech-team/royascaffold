# Card · Discover the project

Goal: understand the product with the person before anything is planned or built. Nothing opens until a person runs `royascaff approve project`.

1. **Save the request first**, word for word, under `## Request` in `project/knowledge/00-discovery/request.md`. Never shorten or rewrite it.
2. List every concrete demand in it (each look, feature, rule, number, list item): `royascaff new record source "<demand>" --quote "<exact words from the request>"`. The quote must be found in the request. Planning later links each one to a feature (`--covered CAP-…`) or marks it `Out of scope` with the person's reason.
3. Fill each of the 8 topics in `project/knowledge/00-discovery/discovery.md` in short plain sentences. Write only what the request says or the person told you. For a web-ui app, topic 8 ends with `**Visual bar:**` and at least 5 lines from the request: what good looks like, what is not acceptable.
4. For every gap or unclear point: `royascaff new record question "<question>" --topic <topic>`. For everything you inferred, including what you took from a long prompt: `royascaff new record assumption "<what you assumed>" --topic <topic> --basis "<why>"`.
5. **Technology:** write two or three `- **Option X:** …` lines and one `**Recommendation:** …`, even when the request names a stack. Never decide it yourself: add the question "Which option do you choose?".
6. **Stop and ask** the open questions in the chat, grouped, at most seven at a time. Wait for the answers.
7. Write each answer in its question's `Answer:` field and `Source: chat <date>`. Update the topics and remove assumptions the person rejected.
8. Record the confirmed stack: `royascaff new record decision "<stack>" --scope project`, with options, choice and why.
9. Describe the system in `project/knowledge/04-design/architecture.md`: context, apps, main parts, data flow and dependency rules. Keep it to one page.
10. Write the business brief (`knowledge/01-business/brd.md`) and 1–3 outcomes (`royascaff new record outcome …`).
11. Run `royascaff next`. When it says the project is ready, tell the person: "Review the request, demands, discovery, brief, architecture and decisions, then run `royascaff approve project`". Stop.
