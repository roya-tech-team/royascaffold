# Code Map Template

```yaml code-map
entries:
  - path: ../apps/api/src/module/file.js
    kind: application-service
    owner: CMP-MODULE-API-01
    relation: implements
    runtime: true
    status: verified
  - path: ../apps/api/src/module/helper.js
    kind: mapper
    owner: CMP-MODULE-API-01
    relation: supports
    runtime: true
    status: verified
```

Relations: `implements`, `defines`, `supports`, `configures`, `verifies`, `migrates`, `generates`.
