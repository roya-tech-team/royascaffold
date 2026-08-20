# Source Code Ownership Map

Every JavaScript or JSX file under the configured source roots appears here, including bootstraps, configuration, middleware, routes, repositories, context providers, guards, pages, and reusable UI. The validator compares this list with the filesystem and reports unmapped or missing files.

```yaml code-map
entries:
  - path: ../apps/api/src/index.js
    kind: bootstrap
    owner: CMP-API-BOOTSTRAP
    relation: implements
    status: current
  - path: ../apps/api/src/config.js
    kind: configuration
    owner: CMP-API-BOOTSTRAP
    relation: configures
    status: current
  - path: ../apps/api/src/common/errors.js
    kind: error-model
    owner: CMP-API-BOOTSTRAP
    relation: implements
    status: current
  - path: ../apps/api/src/database.js
    kind: database
    owner: CMP-DATABASE
    relation: implements
    status: current
  - path: ../apps/api/src/common/middleware/auth.js
    kind: middleware
    owner: CMP-AUTH-CONTROLLER
    relation: implements
    status: current
  - path: ../apps/api/src/modules/auth/auth.routes.js
    kind: routes
    owner: CMP-AUTH-CONTROLLER
    relation: implements
    status: current
  - path: ../apps/api/src/modules/auth/auth.controller.js
    kind: controller
    owner: CMP-AUTH-CONTROLLER
    relation: implements
    status: current
  - path: ../apps/api/src/modules/auth/auth.service.js
    kind: service
    owner: CMP-AUTH-SERVICE
    relation: implements
    status: current
  - path: ../apps/api/src/modules/auth/auth.repository.js
    kind: repository
    owner: CMP-USERS-REPOSITORY
    relation: implements
    status: current
  - path: ../apps/api/src/modules/polls/polls.routes.js
    kind: routes
    owner: CMP-POLLS-CONTROLLER
    relation: implements
    status: current
  - path: ../apps/api/src/modules/polls/polls.controller.js
    kind: controller
    owner: CMP-POLLS-CONTROLLER
    relation: implements
    status: current
  - path: ../apps/api/src/modules/polls/polls.service.js
    kind: service
    owner: CMP-POLLS-SERVICE
    relation: implements
    status: current
  - path: ../apps/api/src/modules/polls/polls.repository.js
    kind: repository
    owner: CMP-POLLS-REPOSITORY
    relation: implements
    status: current
  - path: ../apps/api/src/modules/polls/votes.repository.js
    kind: repository
    owner: CMP-VOTES-REPOSITORY
    relation: implements
    status: current
  - path: ../apps/web/src/main.jsx
    kind: bootstrap
    owner: CMP-WEB-SHELL
    relation: implements
    status: current
  - path: ../apps/web/src/App.jsx
    kind: router
    owner: CMP-WEB-SHELL
    relation: implements
    status: current
  - path: ../apps/web/src/components/Layout.jsx
    kind: layout
    owner: CMP-WEB-SHELL
    relation: implements
    status: current
  - path: ../apps/web/src/core/ProtectedRoute.jsx
    kind: route-guard
    owner: CMP-WEB-AUTH
    relation: implements
    status: current
  - path: ../apps/web/src/core/api.js
    kind: api-client
    owner: CMP-WEB-API
    relation: implements
    status: current
  - path: ../apps/web/src/core/authContext.jsx
    kind: state-provider
    owner: CMP-WEB-AUTH
    relation: implements
    status: current
  - path: ../apps/web/src/components/AuthLayout.jsx
    kind: layout
    owner: CMP-WEB-AUTH
    relation: implements
    status: current
  - path: ../apps/web/src/pages/LoginPage.jsx
    kind: page
    owner: CMP-WEB-AUTH
    relation: implements
    status: current
  - path: ../apps/web/src/pages/RegisterPage.jsx
    kind: page
    owner: CMP-WEB-AUTH
    relation: implements
    status: current
  - path: ../apps/web/src/pages/DashboardPage.jsx
    kind: page
    owner: CMP-WEB-POLLS
    relation: implements
    status: current
  - path: ../apps/web/src/pages/PollListPage.jsx
    kind: page
    owner: CMP-WEB-POLLS
    relation: implements
    status: current
  - path: ../apps/web/src/pages/CreatePollPage.jsx
    kind: page
    owner: CMP-WEB-POLLS
    relation: implements
    status: current
  - path: ../apps/web/src/pages/PollDetailPage.jsx
    kind: page
    owner: CMP-WEB-POLLS
    relation: implements
    status: current
  - path: ../apps/web/src/components/PollCard.jsx
    kind: component
    owner: CMP-WEB-POLL-VIEWS
    relation: implements
    status: current
  - path: ../apps/web/src/components/PollResults.jsx
    kind: component
    owner: CMP-WEB-POLL-VIEWS
    relation: implements
    status: current
```

`src/index.css` and build configuration are intentionally outside `code_extensions`. If CSS or configuration becomes architecturally significant, add the extension to `profile.md` and map the resulting files.
