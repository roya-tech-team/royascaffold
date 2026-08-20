# Verification Template — Detailed Guide

> This is the verbose reference for `../verification-template.md`. Contains extended check formats with table-based evidence.

## File Naming

Each change keeps its reports in its own folder:

```
project/changes/change-<ID>-<slug>/
├── change-request.md
├── recon.md           ← impact analysis (Step 5.0b)
├── verify-plan.md     ← pre-build (optional for fast-track)
└── verify-code.md     ← post-build (always required)
```

Reports are permanent — do not delete them after archiving.

## Pre-Build Checks (extended format)

### Check 0: Reconnaissance Coverage

| Recon finding | Type | Reflected in plan? |
|---------------|------|:------------------:|
| [item] | complete-in-place / modify / reconcile | yes / no |

### Check 1: Feature Coverage

| Feature | Backend-relevant? | Endpoint exists? | Frontend-relevant? | Page exists? |
|---------|:-:|:-:|:-:|:-:|
| [name] | yes/no | yes/no/n/a | yes/no | yes/no/n/a |

### Check 2: Service Coverage

| Endpoint | Service Called | Exists in services/<module>.md? |
|----------|---------------|:-------------------------------:|
| [METHOD /route] | [Service.method()] | yes / no |

### Check 3: Data Model Consistency

| DTO / Entity Referenced | Defined in data-model.md? |
|------------------------|:------------------------:|
| [name] | yes / no |

### Check 4: Endpoint-Page Linking

| Page | Endpoint Referenced | Route in endpoints/<module>.md | Match? |
|------|--------------------|--------------------------------|:------:|
| [page] | [EP-ID · METHOD /route] | [actual] | ✓ / ✗ |

### Check 5: Auth Declarations

| Item | Type | Auth declared? | Guard declared? |
|------|------|:-:|:-:|
| [name] | endpoint / page | yes / no | yes / no / n/a |

### Check 6: Custom Rules Coverage

| New behavior | Rule exists? | Rule ID |
|-------------|:-:|---------|
| [behavior] | yes / no / n/a | [ID] |

## Post-Build Checks (extended format)

### Check 1: Endpoints in Code

| Endpoint (spec) | Code file | Method + Route in code | Match? |
|-----------------|-----------|------------------------|:------:|
| [METHOD /route] | [path] | [decorator] | ✓ / ✗ |

### Check 2: Pages in Code

| Page (spec) | Code file | Route in app config | Match? |
|-------------|-----------|---------------------|:------:|
| [page] | [path] | [route] | ✓ / ✗ |

### Check 3: Code Layering

| File | Layer | Violation? |
|------|-------|:----------:|
| [file] | controller / service / repository | none / [desc] |

### Check 4: Frontend Isolation

| File | Direct external URL found? | Details |
|------|:-:|---------|
| [file] | no / YES | [url if found] |

### Check 5: Auth Implementation

**Backend:**

| Endpoint | Guard in plan | Applied in code? |
|----------|:-:|:-:|
| [METHOD /route] | [guard] | yes / no |

**Frontend:**

| Route | Guard in plan | Applied in route config? |
|-------|:-:|:-:|
| [route] | [guard] | yes / no |

### Check 6: Acceptance Criteria

| # | Criterion | Met? | Evidence |
|---|-----------|:----:|---------|
| 1 | [text] | ✓ / ✗ | [how verified] |

### Check 7: UI Screenshots (optional)

| Page | Screenshot | Layout match? | States visible? | Route correct? | RTL correct? |
|------|-----------|:-:|:-:|:-:|:-:|
| [page] | [file] | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗/n/a |
