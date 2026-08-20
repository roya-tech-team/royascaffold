# Custom Feature Rules Template — Detailed Guide

> This is the verbose reference for `../custom-feature-rules-template.md`. Contains rule-type templates, field meanings, and detailed guidance.

## File-Level Rules

- `project/rules.md` is created after `project/plan/modules.md` (which includes features).
- Use the **exact module and feature names** from the modules file.
- Put rules here only when they are **feature-specific** or **project-specific**.
- Do not repeat generic rules already in `royascaff/engine/rules/backend-rule.md` or `royascaff/engine/rules/frontend-rule.md`.
- One feature may have zero, one, or many custom rules.
- If a rule applies to multiple features, document it once under the primary feature and reference others.
- Prefer mandatory language: `must`, `must not`, `should`, `should not`.

## Recommended File Structure

```md
# Custom Feature Rules

## Short Summary
{What project these rules apply to.}

## Rules By Module

## Module: {ModuleName}

### Feature: {FeatureName}
{rule entry}

## Global Feature Rules
- rules that apply across multiple modules
```

## Rule Type Templates

### AI Rule
- Provider: `OpenAI | Claude | Azure OpenAI`
- Integration layer: `src/integrations/ai/`
- Model selection: fixed | configurable | settings-driven
- Must: use backend-controlled workflow; store AI output; track generation status
- Must not: expose API keys to client; treat frontend-generated output as source of truth

### Integration Rule
- Provider: `Twilio | SMTP | WhatsApp API | Stripe | S3`
- Integration layer: `src/integrations/{provider}/`
- Secrets: env vars or secret manager only
- Must: route through backend; log success/failure; respect retry/timeout policy
- Must not: call provider SDK from controller or frontend; store secrets in DB

### Async Job Rule
- Provider: queue | jobs collection | worker
- Must: create background job on trigger; expose status endpoint; persist failure reason
- Must not: fake async in frontend only; lose job state on restart

### Storage Rule
- Provider: S3 | R2 | GCS
- Must: generate presigned URLs server-side; validate keys; use config-driven credentials
- Must not: expose storage credentials; allow unlimited upload sizes without validation

### Security Rule
- Must: enforce at service layer; validate ownership; sanitize inputs
- Must not: rely on frontend-only validation; log sensitive data

## Suggested Field Meanings

- **Type** — category: AI, Integration, Async Job, Storage, Security, Business Logic, Performance
- **Summary** — one-line explanation of the custom requirement
- **Must** — mandatory actions for implementation
- **Provider** — external service and expected code layer
- **Must not** — forbidden implementation patterns
