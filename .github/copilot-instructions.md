# Fread - AI Coding Agent Instructions

## Project Overview

Fread is a social media platform (inspired by Threads) with a TypeScript-based API using Express.js + Prisma, and a React frontend using TanStack Router. The project runs in Docker with PostgreSQL.

## Architecture

### Backend (`api/`)

- **Framework**: Express.js with Bun runtime (development)
- **ORM**: Prisma with PostgreSQL adapter
- **Auth**: JWT tokens + OAuth (Discord/Google)
- **Validation**: Zod schemas for request validation
- **Testing**: Jest with ts-jest

#### Key Backend Patterns

**Route Registration System**:
Routes use a declarative pattern via `RouteDescriptor[]`:

```typescript
// api/routes/account/account.route.ts
{
  method: "get",
  path: `${prefix}/:id`,
  middlewares: [validateParams(idParamSchema, "params")],
  handler: asyncHandler(async (req, res) => {
    const result = await controller.getProfile(req);
    res.json(result);
  })
}
```

**Error Handling**:

- All custom errors extend `AppError` (see `api/errors/`)
- Use specific error classes: `BadRequestError`, `UnauthorizedError`, `NotFoundError`, `ForbiddenError`
- Async handlers wrapped with `asyncHandler` utility to catch exceptions
- Global error middleware converts `AppError` to JSON responses

**Service Layer Pattern**:

- Controllers (`api/controllers/`) handle HTTP concerns
- Services (`api/services/`) contain database operations ending in `DB` suffix
- Example: `createAccountDB()`, `getAccountByIdDB()`, `followAccountDB()`

**Authentication**:

- `authMiddleware` for required auth (attaches `account` to request)
- `optionalAuthMiddleware` for optional auth (used for viewing public/private posts)
- JWT tokens validated via `verifyJWT()` utility

**Prisma Schema Location**:

- Schema: `api/prisma/schema.prisma`
- Generated client: `api/generated/prisma/` (custom output path)
- Import via `api/prisma.ts` which exports configured `prisma` instance

### Frontend (`front/`)

- **Framework**: React 19 with TanStack Router (file-based routing)
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Forms**: TanStack Form
- **Code Quality**: Biome for linting/formatting

#### Key Frontend Patterns

**File-Based Routing**:

- Routes in `front/src/routes/` map to URLs
- `_authenticated.tsx` layout protects nested routes
- Dynamic params: `$id.tsx` for `/profile/:id`
- Export pattern: `export const Route = createFileRoute("/path")({ component })`

**Data Fetching**:

- Custom hooks in `front/src/hooks/queries/` wrap TanStack Query
- Mutations in `front/src/hooks/mutations/`
- API integration via axios in `front/src/integrations/`

**Auth Context**:

- JWT stored in localStorage
- `useAuth()` hook provides user context
- Protected routes redirect via TanStack Router's `beforeLoad`

## Development Workflow

### Running Locally

**Docker (Recommended)**:

```bash
docker compose up -d  # Starts postgres + api + front
docker compose down
```

**Local Development**:

```bash
# API (uses Bun)
cd api
bun install
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run index.ts

# Frontend
cd front
bun install
bun run dev  # Runs on port 3000
```

### Environment Variables

**API** (`.env` or docker-compose):

- `DATABASE_URL`: PostgreSQL connection (Docker: `postgresql://root:RootPassword@postgres:5432/fread_db`)
- `JWT_SECRET`: Min 32 chars (validated via Zod in `api/env.ts`)
- OAuth: `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`, `DISCORD_REDIRECT_URI`
- OAuth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `GOOGLE_REDIRECT_URI`

**Frontend** (`.env.local`):

- API base URL for axios integration

### Testing

**API**:

```bash
cd api
bun test              # Run all tests
bun test:watch        # Watch mode
bun test:coverage     # Coverage report
```

- Tests use Jest mocks for Prisma client
- Pattern: Mock `prisma` object from `api/prisma` module
- See `api/tests/services/follow.service.spec.ts` for example

**Frontend**:

```bash
cd front
bun test              # Run Vitest tests
bun test:watch        # Watch mode
bun test:ui           # Vitest UI
bun test:coverage     # Coverage
```

### Database Operations

```bash
cd api
bun run db:generate   # Regenerate Prisma client after schema changes
bun run db:migrate    # Create and apply migration
```

## Project Conventions

### Code Style

- **API**: No explicit formatter/linter configured (follow TypeScript conventions)
- **Frontend**: Use Biome - `bun run check:fix` to auto-fix
- Prefer explicit types over `any`
- Use Zod schemas for runtime validation

### File Organization

- **API Routes**: Group by feature in `api/routes/{feature}/`
- **API Services**: Named `{feature}.service.ts` with `{action}DB` function exports
- **Frontend Components**: Shared UI in `components/`, page-specific inline
- **Schemas**: Centralized in `api/schemas/` and reused across routes

### Naming

- Database functions: `verbNounDB()` (e.g., `createAccountDB`, `getPostByIdDB`)
- Middleware: `{purpose}Middleware` (e.g., `authMiddleware`, `errorMiddleware`)
- Routes: Export `createAccountRoutes()` function returning `RouteDescriptor[]`
- Frontend routes: Use component name matching the page (e.g., `ProfilePage`)

### Database Schema Notes

- All IDs use `cuid()` (Prisma default)
- Cascade deletes configured for user content (see `onDelete: Cascade` in schema)
- Unique constraints on follow/like to prevent duplicates
- `profileCompleted` flag tracks OAuth signup completion

## Integration Points

- **OAuth Flow**: `api/services/oauth.service.ts` handles Discord/Google callbacks
- **File Uploads**: `api/services/file.service.ts` for profile pictures and post attachments
- **Cross-Origin**: CORS enabled globally in `api/index.ts`
- **Frontend API**: Axios client configured in `front/src/integrations/`

## Common Tasks

**Add New Route**:

1. Create route file in `api/routes/{feature}/`
2. Define `RouteDescriptor[]` with path, method, middlewares, handler
3. Create controller in `api/controllers/` and service in `api/services/`
4. Register in `api/index.ts` via `app.use()`

**Add Database Model**:

1. Update `api/prisma/schema.prisma`
2. Run `bun run db:migrate` (creates migration + regenerates client)
3. Use new model via `prisma.{model}.{operation}()` in services

**Add Frontend Page**:

1. Create route file in `front/src/routes/`
2. Export `Route = createFileRoute("/path")({ component })`
3. Use TanStack Query hooks for data fetching
4. Protect with `_authenticated` layout if needed
