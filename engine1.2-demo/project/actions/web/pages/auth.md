# Pages — PollPulse Web · Auth

### Login Page `PG-AUTH-01`
- Route: `/auth/login`
- Status: done
- Components: `AuthLayout`, `LoginForm`
- Service: `AuthService` → EP-AUTH-02 (POST /auth/login)
- Guard: none (redirect to dashboard if already logged in)
- Notes: email + password form; validation errors inline; link to register

### Register Page `PG-AUTH-02`
- Route: `/auth/register`
- Status: done
- Components: `AuthLayout`, `RegisterForm`
- Service: `AuthService` → EP-AUTH-01 (POST /auth/register)
- Guard: none
- Notes: name + email + password + confirm password; min 8 chars; link to login
