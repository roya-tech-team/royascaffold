# Services — PollPulse API · Auth

### SVC-AUTH-01 · AuthService [domain, internal, Auth]
- Status: done
- Methods:
  - `register(dto): AuthResponse` — validate, hash password, create user, return JWT + user
  - `login(dto): AuthResponse` — verify credentials, return JWT + user
  - `findById(id): UserDto` — load user by id for token validation
- Deps: `UsersRepository`, bcrypt, jsonwebtoken
- Side effects: none
- Rules: email unique; generic error on bad login; never expose password hash

### SVC-AUTH-02 · UsersRepository [persistence, internal, Auth]
- Status: done
- Methods:
  - `create(user): User` — insert user row
  - `findByEmail(email): User | null` — lookup by normalized email
  - `findById(id): User | null` — lookup by id
- Deps: DatabaseService
- Side effects: none
- Rules: email stored lowercase
