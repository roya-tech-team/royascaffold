# Canonical Artifact File Template

````md
---
schema: royascaff/artifact-file/v1
layer: <layer>
module: <module>
owner: <owner>
artifacts: [<ID>]
---

# <Layer> — <Module>

## <ID> — <Title>

```yaml artifact
id: <ID>
type: <artifact-type>
title: <Title>
module: <module>
owner: <owner>
knowledge_status: draft
implementation_status: planned
tags: []
```

<Human-readable normative content.>
````

One file may contain several cohesive artifacts. Every listed front-matter ID must have one artifact block and stable heading.
