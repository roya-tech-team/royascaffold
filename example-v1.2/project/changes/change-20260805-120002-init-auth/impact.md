# Impact — init-auth

## Create
- `apps/api/src/modules/auth/auth.repository.js`
- `apps/api/src/modules/auth/auth.service.js`
- `apps/api/src/modules/auth/auth.controller.js`
- `apps/api/src/modules/auth/auth.routes.js`
- `apps/api/src/common/middleware/auth.js`
- `apps/web/src/pages/LoginPage.jsx`
- `apps/web/src/pages/RegisterPage.jsx`
- `apps/web/src/components/AuthLayout.jsx`

## Modify
- `apps/api/src/database.js` — add users table
- `apps/api/src/index.js` — mount auth routes
- `apps/web/src/App.jsx` — add auth routes
