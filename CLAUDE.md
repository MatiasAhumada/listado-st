# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Development server on port 3008
pnpm build        # Production build
pnpm start        # Production server on port 3008
pnpm lint         # ESLint
pnpm test         # Node test runner through tsx
pnpm format       # Prettier --write

pnpm migrate      # prisma migrate dev
pnpm reset        # prisma migrate reset
pnpm studio       # Prisma Studio
pnpm seed         # tsx prisma/seed.ts
pnpm admin:rotate-password # Explicitly rotate a lost admin password
pnpm smoke:admin  # Fullstack HTTP acceptance flow against a running app
```

## Architecture

**Stack:** Next.js App Router + TypeScript + PostgreSQL (Prisma) + Tailwind CSS 4 + shadcn/ui

**Port:** 3008 (not the default 3000)

### Layer structure

```
src/app/api/          → Next.js route handlers (RESTful endpoints)
src/server/service/   → Business logic layer
src/server/repositories/ → Prisma data access layer
src/components/       → React UI components
src/services/         → Client-side API call wrappers (axios)
src/constants/        → All hardcoded values live here
src/utils/handlers/   → apiError.handler.ts (backend), clientError.handler.ts (frontend)
```

API routes call service layer → service layer calls repository layer → repository uses Prisma. Business logic never goes in route handlers.

### Auth

Platform administrators and clients enter through one unified `/login` form using username and password. The server resolves the matching account type and redirects to `/admin` or `/cliente`; the user never chooses a role in the login UI. Internally, each access type keeps its own opaque, revocable session stored in a secure `httpOnly` cookie. Only token hashes are persisted. No auth data is stored in `localStorage`.

Usernames are lowercase, globally unique across platform administrators and workshop clients, and contain 3 to 40 letters, numbers, dots, hyphens or underscores.

`pnpm reset` drops the configured database, applies every migration and runs the seed. The seed creates the fixed `admin` username with a cryptographically random password printed once to stdout. Admin credentials never belong in `.env` or `.env.example`.

The MVP has exactly two platform access types: administrator and client. Role resolution is automatic after authentication. A client is currently an independent repair technician who owns one workshop and has a subscription. Technician is a profession, not an authorization role. Future customers who leave devices at a workshop must use a distinct workshop-customer entity.

The server-resolved client session is the only source of authority for `workshopId`.

`/` only resolves session state. Anonymous visitors go to `/login`, administrators to `/admin`, and clients to `/cliente`. Client product areas must be nested below `/cliente`; workshop management starts at `/cliente/taller`.

### Global catalog

The platform administrator imports supplier XLSX files into a reviewable draft and explicitly publishes the version visible to technicians. Red, blue and incoming rows are excluded; only available items are persisted. Pricing suggestions are calculated from administrator-managed cost ranges, while the technician remains free to use another supplier, cost or final price in a future quote.

### State

Component-level state for UI. Authentication state is resolved on the server from cookies.

### Paths

`@/*` resolves to `./src/*`.

---

## Code rules (non-negotiable)

### Absolute prohibitions

- No `any`, no `typeof` (exception: inside `zod.preprocess()`)
- No explicit comparisons: `=== null`, `=== undefined`, `=== true`, `=== false`
- No hardcoded values — every string/number/URL goes in `/constants/`
- No comments in code
- No duplicated logic — search before implementing
- No anti-REST endpoints (`/getAll`, `/doSomething`, action verbs in URL)

### Clean architecture — types & interfaces

- `src/types/*.ts` → reusable type aliases, unions, intersections
- `src/interfaces/*.ts` → reusable interfaces (contracts, data shapes)
- Always import from these folders; never duplicate definitions; one source of truth

### SOLID principles

| Principle                     | Rule                                                                |
| ----------------------------- | ------------------------------------------------------------------- |
| **S** — Single Responsibility | Each class/function has one reason to change                        |
| **O** — Open/Closed           | Extend behavior without modifying existing code                     |
| **L** — Liskov Substitution   | Subclasses must be substitutable for their base                     |
| **I** — Interface Segregation | Specific interfaces over one general-purpose interface              |
| **D** — Dependency Inversion  | Depend on abstractions; inject dependencies, don't instantiate them |

### Conditionals

```ts
// ✅
if (value) { ... }
if (!value) { ... }
if (condition) { doSomething() }
return condition ? valueA : valueB   // ternary only in returns

// ❌
if (value === null) { ... }
if (value === undefined) { ... }
if (flag === true) { ... }
if (flag === false) { ... }
value && doSomething()
```

### HTTP & errors

- Use axios exclusively (client-side via `clientAxios.util.ts`)
- Backend errors: `apiError.handler.ts`; frontend errors: `clientError.handler.ts` (Sonner toasts)
- Correct HTTP verbs and status codes; never expose raw errors

### REST

```
✅ GET/POST/PUT/PATCH/DELETE /users/123
❌ /getUser?id=123
❌ /users/123/activate  →  ✅ PATCH /users/123
```

### Constants

- Business rules → `src/constants/*.constant.ts`
- Config → `src/config/*.ts`
- Prisma enums for database-level values
- Never hardcode: user messages, numeric limits, URLs, UI text

### Naming

Descriptive, semantic names. No `i`, `x`, `temp`, `data`.

### Git commits

**Never** include `Co-Authored-By: Claude` or any AI authorship line in commit messages. Commits must only reflect the human author.

After every implementation, run the relevant type, lint, test and production-build checks. When every required check passes and the working tree contains only the intended changes, commit the implementation and push it to `dev` automatically. Never commit or push an implementation with failing checks; report the failure instead. An explicit user instruction can override the target branch or request no commit or push.

### Pre-delivery checklist

Before every response verify:

- No `any` or `typeof` (except Zod)
- No explicit comparisons
- No hardcoded values
- No comments
- Constants centralized
- Names are descriptive
- Errors handled correctly
- REST compliant
- Code is reusable
