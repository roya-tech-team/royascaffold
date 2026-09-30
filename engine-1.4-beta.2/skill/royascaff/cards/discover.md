# Card · Discover the project

Goal: understand the product with the person before anything is planned or built. Nothing opens until a person runs `royascaff approve project`.

1. Read the request. Fill each of the 8 topics in `project/knowledge/00-discovery/discovery.md` in short plain sentences. Write only what the request says or the person told you.
2. For every gap or unclear point: `royascaff new record question "<question>" --topic <topic>`. For everything you inferred, including what you took from a long prompt: `royascaff new record assumption "<what you assumed>" --topic <topic> --basis "<why>"`.
3. **Technology:** write two or three `- **Option X:** …` lines and one `**Recommendation:** …`, even when the request names a stack. Never decide it yourself: add the question "Which option do you choose?".
4. **Stop and ask** the open questions in the chat, grouped, at most seven at a time. Wait for the answers.
5. Write each answer in its question's `Answer:` field and `Source: chat <date>`. Update the topics and remove assumptions the person rejected.
6. Record the confirmed stack: `royascaff new record decision "<stack>" --scope project`, with options, choice and why.
7. Describe the system in `project/knowledge/04-design/architecture.md`: context, apps, main parts, data flow and dependency rules. Keep it to one page.
8. Write the business brief (`knowledge/01-business/brd.md`) and 1–3 outcomes (`royascaff new record outcome …`).
9. Run `royascaff next`. When it says the project is ready, tell the person: "Review the discovery, brief, architecture and decisions, then run `royascaff approve project`". Stop.
