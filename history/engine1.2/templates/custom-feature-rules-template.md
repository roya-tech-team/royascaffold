# Custom Feature Rules Template

Project-specific rules for features needing special implementation guidance. Lives at `project/rules.md`. Created after modules.

> Verbose guidance → `references/custom-feature-rules-template-guide.md`

## Schema

```md
# Custom Feature Rules

## Module: {ModuleName}

### Feature: {FeatureName}
- Type: AI | Integration | Async Job | Storage | Security | Business Logic
- Must: [required behavior]
- Provider: `Name` via `src/integrations/x/` (or N/A)
- Must not: [forbidden behavior]
```

## Example

```md
## Module: Projects

### Feature: AI Technical Proposal Generation
- Type: AI, Async Job
- Must:
  - queue generation from project data and uploaded RFP
  - track status (queued → processing → completed → failed)
  - store generated HTML in project documents and object storage
  - sanitize HTML before rendering
- Provider: `Claude` via `src/integrations/ai/` — server-side only
- Must not:
  - call AI provider from frontend
  - overwrite issued proposal snapshots

### Feature: Proposal Delivery Notification
- Type: Integration
- Must:
  - send notification via backend after job completion
  - support email first; SMS/WhatsApp if enabled
- Provider: `SMTP` via `src/integrations/mail/`
- Must not:
  - send notifications from frontend
```
