# New App Template

Used when `change-type` is `new-app`. Defines the new application before any planning docs or code change. The new app reuses the existing backend.

> Verbose guidance → `references/new-app-template-guide.md`

## Schema

```md
## New App Definition
- **app-name**: [name]
- **app-purpose**: [one sentence]
- **target-platform**: web | mobile-cross-platform | mobile-ios | mobile-android
- **tech-stack**: [framework + libs]
- **auth-strategy**: same-backend-jwt | separate-auth | sso | none

### Modules to Include
| Module | Include? | Features included | Features excluded |
|--------|:--------:|-------------------|-------------------|
| [name] | full/partial/no | [list] | [list] |

### New Modules / Features
- [name]: [description] (or blank)

### App Pages/Views
1. [name] — [purpose]
```

## Example

```md
## New App Definition
- **app-name**: Customer Mobile App
- **app-purpose**: Dashboard viewer for iOS and Android
- **target-platform**: mobile-cross-platform
- **tech-stack**: React Native + Expo + NativeWind
- **auth-strategy**: same-backend-jwt

### Modules to Include
| Module | Include? | Features included | Features excluded |
|--------|:--------:|-------------------|-------------------|
| Auth | full | Login, Logout, Reset | Register (web only) |
| Projects | partial | List, View | Create, Edit, Delete |
| Dashboards | partial | View Dashboard | Create, Edit, Delete |

### New Modules / Features
- Push Notifications: mobile push via Expo

### App Views
1. Login — email + password
2. Projects List — scrollable list
3. Dashboard Viewer — native chart grid
4. Notifications — list + mark-read
```
