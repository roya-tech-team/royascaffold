# Migration Reconciliation

## Canonical additions

System/profile plus business, requirements, domain/workflows, design, implementation, quality, operations, release, Context Manifest, and evidence records under this v1.3 project root.

## Preserved provenance

Legacy IDs and source remain under `example-v1.2/`; historical pack defects/unevidenced PASS are described in `migration-report.md` rather than copied into current knowledge.

## Apply/rollback

The migration creates a separate folder. Rollback is removal of that new folder through version control; no legacy path was moved or deleted.

## Post-apply

Regenerate `generated/` and `contexts/generated/`, validate, then update evidence/result text if commands pass. Canonical application artifacts remain `implemented` until their planned behavior tests have fresh evidence.

