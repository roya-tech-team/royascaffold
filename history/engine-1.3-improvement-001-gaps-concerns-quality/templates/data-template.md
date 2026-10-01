# Data Design Template

Separate conceptual/domain meaning from persistence.

Include stores/ownership, entities/tables/documents, fields/types/constraints,
relationships/indexes, transaction/consistency rules, retention/deletion/classification,
migration/backfill/rollback, lineage for pipelines, mappings to `CON-*`/`INV-*`/
contracts, and data-quality checks.

When data is user-visible or credibility-sensitive, also record source class, curation
expectation/ratio where meaningful, realism, completeness, freshness, labeling,
placeholder policy, prohibited fabrication, and observable credibility criteria.
