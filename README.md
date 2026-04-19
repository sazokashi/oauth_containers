# oauth_containers

A reference implementation of browser-oriented authentication built with React, Express, TypeScript, MongoDB, Redis, and Docker Compose. The stack is intentionally small — four containers, no cloud dependencies — so the focus stays on the auth architecture itself.

This is a code-reading project. There is no flashy demo. The interesting part is how the pieces fit together: trust boundaries, session handling, token lifecycle, and the security tradeoffs that come with serving a browser client from a separate API.

## What it does

The system issues OAuth2 access and refresh tokens, stores durable state in MongoDB, caches hot-path lookups in Redis, and bridges everything to the browser through `httpOnly` cookies with CSRF protection. Beyond login, it covers registration, email verification, password reset, logout, and mock social sign-in.

```
Browser -> React SPA -> Express API -> OAuth storage model -> MongoDB / Redis
```

Docker Compose runs all four services locally. Copy `.env.example` to `.env`, run `docker compose up --build`, and open `http://localhost:5173`.

Seeded credentials: `reader@example.com` / `ChangeMe123!`

## Architecture

### How the backend is organized

The codebase follows a compositional pattern rather than a controller-heavy one. A request flows through distinct layers:

1. **Route** receives the HTTP request and applies middleware
2. **Transport parser** normalizes request data into a working object
3. **Domain functions** validate and enrich that object
4. **Queries / Services** handle persistence and side effects
5. **Response builder** translates the result back to HTTP

Route files stay thin. The logic lives in small functions composed with `pipeAsync` (see [`util/fp.ts`](./apps/api/src/util/fp.ts)), which makes each flow readable top-to-bottom.

```
routes/       -> endpoint wiring and middleware
transport/    -> request parsing, response shaping
domain/       -> auth and account business rules
queries/      -> MongoDB and token-store operations
services/     -> mail delivery, session issuance, side effects
```

### Frontend responsibility

The React app collects credentials, coordinates session bootstrap, guards routes, and triggers lifecycle flows. It does not store tokens — the browser holds `httpOnly` cookies it cannot read, and the frontend syncs its auth state by asking the API.

Session bootstrap on mount:

```
try /api/session/me
  -> if valid, hydrate auth context
  -> if expired, try /api/session/refresh
     -> if refresh works, retry /api/session/me
     -> if refresh fails, remain logged out
```

The backend is always authoritative. The frontend never decides on its own whether a session is valid.

### Persistence split

**MongoDB** is the source of truth: user records, OAuth clients, tokens, verification artifacts, reset tokens. Verification and reset records use TTL indexes for automatic expiration.

**Redis** serves two roles: access-token lookup acceleration (the hot path on every authenticated request) and shared rate-limit state across API instances. It is never treated as a source of truth — if Redis goes away, the system falls back to MongoDB.

## Design decisions

### Cookie-backed sessions, not localStorage tokens

The browser never touches the access token directly. Tokens live in `httpOnly` cookies, which means frontend JavaScript cannot exfiltrate them via XSS. The tradeoff is that CSRF becomes mandatory — so CSRF is a first-class concern here, not bolted on after the fact.

- [`auth/csrf.ts`](./apps/api/src/auth/csrf.ts) — CSRF enforcement
- [`web/src/api/http.ts`](./apps/web/src/api/http.ts) — how the frontend sends the CSRF header

### OAuth2 library with a custom storage model

Token issuance uses [`@node-oauth/oauth2-server`](https://github.com/node-oauth/node-oauth2-server) rather than hand-rolled grant logic. The library handles the protocol mechanics; a custom storage model ([`auth/model.ts`](./apps/api/src/auth/model.ts)) keeps persistence and scope rules in application code the reader can follow. This separation means token issuance, token storage, and scope validation each have a clear owner.

### Access and refresh token separation

Access tokens are short-lived working credentials. Refresh tokens allow session recovery without re-entering a password. The split adds complexity — revocation and storage discipline matter more — but it makes session lifecycle explicit rather than hiding it behind a single long-lived token.

### Middleware ordering

The Express middleware chain has a deliberate sequence, and the ordering is load-bearing:

1. Security headers (`helmet`) — set early, before anything else runs
2. Cookie parsing — must happen before cookie-based auth or CSRF
3. Body parsing — must happen before route handlers need request bodies
4. CORS — restricts browser-origin access to the configured frontend
5. Request logging — sees the request before business logic
6. Rate limiting — blocks abuse before it reaches handlers
7. Cookie-to-bearer bridge — converts the session cookie into an Authorization header
8. CSRF enforcement — runs after cookies are available, before state-changing handlers

See [`app.ts`](./apps/api/src/app.ts) for the full stack.

### Account lifecycle beyond login

Login alone is not interesting. The auth surface here includes:

- **Registration** — user record created, password hashed with bcrypt, `emailVerified` set false
- **Email verification** — token stored in MongoDB with TTL, delivered via Resend (or returned as a preview if no API key is configured)
- **Password reset** — separate server-side state transition, not a frontend decoration
- **Logout** — clears cookies and revokes tokens
- **Mock social sign-in** — demonstrates identity translation into local authorization; the provider proves identity, the application decides permissions

Password reset flow:
```
request reset -> store token with expiry -> deliver email
submit token + new password -> consume token -> re-hash password
```

The mock social flow is intentionally not wired to a real provider. The point is to show that a well-designed social login does not let the provider define the application's authorization model.

## Threat model

This is scoped to a browser application talking to its own API. It is not an identity provider, federation layer, or enterprise IAM system.

**What is addressed:**

| Threat | Control |
|---|---|
| Plaintext password storage | bcrypt hashing |
| XSS token theft | `httpOnly` cookies |
| CSRF on state-changing requests | Token validation on cookie-authenticated writes |
| Brute-force / auth abuse | Redis-backed rate limiting |
| Stale verification / reset tokens | MongoDB TTL indexes |
| Weak response headers | `helmet` baseline |
| No operational visibility | Structured JSON logging via `winston` |

**What is intentionally left simple:**

Refresh tokens are not hashed. There is no MFA, no device/session inventory, no audit event stream, no real social provider binding, and no tests yet. These are the right next steps, but including them would make the core harder to read.

## End-to-end flows

### Password login

```
POST /api/oauth/token with email + password
  -> OAuth library delegates to storage model
  -> bcrypt verifies the hash
  -> access + refresh tokens issued, stored in MongoDB, access token cached in Redis
  -> response sets access cookie, refresh cookie, CSRF cookie
  -> frontend calls GET /api/session/me to hydrate auth state
```

### Registration and verification

```
POST /api/auth/register
  -> create user record, hash password, set emailVerified = false
  -> store verification token with TTL
  -> send email (or return preview)

POST /api/auth/verify
  -> consume token, mark account verified, issue session
```

### Password reset

```
POST /api/auth/forgot-password  -> store reset token with expiry, send email
POST /api/auth/reset-password   -> consume token, re-hash password
```

## Reading the code

If you want to understand the system quickly, this order works well:

1. **Frontend entry** — [`LoginPage.tsx`](./apps/web/src/pages/login/LoginPage.tsx) shows every flow the browser exposes
2. **API clients** — [`session-api.ts`](./apps/web/src/api/session-api.ts), [`account-api.ts`](./apps/web/src/api/account-api.ts) define the browser-server contract
3. **Auth context** — [`auth-context.tsx`](./apps/web/src/auth/auth-context.tsx), [`auth-session.ts`](./apps/web/src/auth/auth-session.ts) show session bootstrap and why refresh exists
4. **API routes** — [`account-routes.ts`](./apps/api/src/auth/routes/account-routes.ts), [`session-routes.ts`](./apps/api/src/auth/routes/session-routes.ts) are the backend entry points
5. **Auth engine** — [`oauth.ts`](./apps/api/src/auth/oauth.ts), [`model.ts`](./apps/api/src/auth/model.ts) implement the token model
6. **CSRF** — [`csrf.ts`](./apps/api/src/auth/csrf.ts) handles browser-specific protection
7. **User lifecycle** — [`users.ts`](./apps/api/src/auth/users.ts), [`token-records.ts`](./apps/api/src/auth/token-records.ts)
8. **Persistence** — [`mongo.ts`](./apps/api/src/db/mongo.ts), [`redis.ts`](./apps/api/src/db/redis.ts)
9. **Middleware and ops** — [`app.ts`](./apps/api/src/app.ts), [`rate-limit.ts`](./apps/api/src/util/rate-limit.ts), [`logger.ts`](./apps/api/src/util/logger.ts), [`mailer.ts`](./apps/api/src/util/mailer.ts)

## Local development

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

If `RESEND_API_KEY` is not set, verification and reset endpoints still work — the backend returns preview data and the frontend displays preview URLs so flows remain testable without live email.

## What would come next

1. Hash refresh tokens before storage
2. Integration tests for login, verification, reset, refresh, and logout
3. Replace the mock social flow with a real OIDC provider
4. Audit events for security-sensitive account actions
5. Session inventory and targeted revocation
6. Stricter CSRF rotation
