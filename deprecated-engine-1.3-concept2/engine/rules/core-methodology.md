# Technology-Independent Core Rules

1. Organize architecture by explicit responsibility and dependency boundaries, not framework naming.
2. Keep transport, domain/application behavior, persistence, integration, and presentation concerns separable even when implemented in one process.
3. Protect security and business invariants at authoritative boundaries, never only in a client interface.
4. Define contracts at application/module/external boundaries and version breaking public changes deliberately.
5. Distinguish conceptual/domain, persistence, transport, integration, and view models.
6. Give external effects timeouts, failure behavior, idempotency/retry semantics where relevant, and observable outcomes.
7. Record architecture exceptions as accepted decisions or time-bounded waivers.
8. Map significant runtime files to canonical owners and tests.
9. Prefer project-native build/type/lint/test tools; record evidence rather than assuming success.
10. Keep the core generic. Framework detection, file layout, and command defaults belong to adapters/profile.
