# Endpoints — PollPulse API · Auth

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-AUTH-01 | POST | /auth/register | public | `body: RegisterDto` | `201 AuthResponse` | `AuthService.register()` | done | name, email, password |
| EP-AUTH-02 | POST | /auth/login | public | `body: LoginDto` | `200 AuthResponse` | `AuthService.login()` | done | email, password |
| EP-AUTH-03 | GET | /auth/me | authenticated | — | `200 UserDto` | `AuthService.findById()` | done | current user profile |
