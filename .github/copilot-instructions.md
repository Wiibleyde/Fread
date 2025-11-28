# Fread - Copilot Instructions

## Project Overview

Fread is a social media platform (similar to Threads/Twitter) built with Next.js 16, React 19, and Prisma. Users can post content (text/images/videos), like, comment, follow others, and repost. Authentication planned via NextAuth.js V5.

## Architecture & Key Patterns

We're working with the following architectural patterns and conventions:

- Clean architecture principles
- Layered structure: Database layer, Next.js app layer, and tooling layer

### Database Layer

- **Custom Prisma Output**: Prisma Client generates to `app/generated/prisma/` (not default `node_modules`). Always import from `@/app/generated/prisma/client`.
- **Singleton Pattern**: Use `@/lib/prisma.ts` for the PrismaClient instance (handles hot-reload in dev).
- **Schema Design**: Posts use a self-referential Reply model for threading. Files are separate entities linked to posts/profiles.

### Next.js Structure

- **App Router**: Using Next.js 16 App Router (`app/` directory).
- **React Compiler**: Enabled via `babel-plugin-react-compiler` in `next.config.ts`.
- **Path Aliases**: `@/*` maps to project root (see `tsconfig.json`).

### Tooling

- **Linter/Formatter**: Biome (not ESLint/Prettier). Run `bun lint` to check, `bun format` to fix.
- **Package Manager**: Bun (inferred from scripts usage context).
- **Database**: PostgreSQL via Docker Compose on port 5432 (credentials in `docker-compose.yml`).

## Critical Workflows

### Database Migrations

```bash
bun db:migrate      # Run after schema changes (creates migration + generates client)
bun db:generate     # Regenerate Prisma Client only (no schema changes)
```

Always run `db:migrate` after modifying `prisma/schema.prisma`. Client code regenerates to `app/generated/prisma/`.

### Development Setup

1. Start PostgreSQL: `docker compose up -d`
2. Run migrations: `bun db:migrate`
3. Start dev server: `bun dev`

### Code Quality

- Run `bun lint` before committing (Biome checks Next.js and React domains).
- Auto-fix imports: Biome organizes imports on save.

## Project-Specific Conventions

### Database Models

- **IDs**: All models use `@default(cuid())` for unique, sortable IDs.
- **Privacy**: Account and Post models have `private` boolean fields.
- **OAuth**: Account supports multiple auth providers (appleId, googleId, discordId).
- **Timestamps**: Use `createdAt` (not `created_at`) for consistency.

### File Relationships

- Profile pictures use a separate one-to-one `File` relation (`profilePictureId`).
- Post attachments use many-to-many `File[]` relation.
- Files always belong to an Account (creator).

### Reply/Threading

- Replies are separate `Reply` join table with `basePostId` (parent) and `replyPostId` (child).
- Each reply creates a new Post and links it via Reply model.

### Authentication (Planned)

- NextAuth.js V5 will handle authentication.
- Account model already has OAuth provider fields (appleId, googleId, discordId).

## Important Files

- `prisma/schema.prisma`: Database schema (source of truth).
- `lib/prisma.ts`: Prisma Client singleton (import from here).
- `app/generated/prisma/`: Generated Prisma Client (don't edit manually).
- `biome.json`: Linter/formatter config (Next.js and React domains enabled).
- `docker-compose.yml`: PostgreSQL setup (DB name: fread_db, user: root).

## Code Quality Standards

### Clean Code Principles

- **No `any` types**: Always use proper TypeScript types. Use `unknown` if the type is truly unknown, then narrow it.
- **No code duplication**: Extract shared logic into reusable functions/components. Follow DRY (Don't Repeat Yourself).
- **Single Responsibility**: Each function/component should do one thing well.
- **Meaningful names**: Use descriptive variable/function names that explain intent.
- **No comments in code**: Code should be self-explanatory through clear naming and structure. Refactor complex logic into well-named functions instead of adding comments.
- **No markdown files for features**: When implementing features, write only the necessary code files. Don't create summary markdown documents unless explicitly requested.

### Pre-Completion Checklist

Before marking any task as complete, ALWAYS:

1. Run `bun lint` - Fix all linting errors.
2. Run `bun format` - Ensure consistent formatting.
3. Verify TypeScript types compile without errors.
4. Test the feature manually if applicable.

### Documentation Updates

When making architectural changes, new patterns, or workflow modifications, update `.github/copilot-instructions.md` to reflect:

- New conventions or patterns introduced.
- Changes to project structure or tooling.
- Additional workflows or commands.
- Important lessons learned or pitfalls discovered.

## Common Pitfalls

- Don't import from `@prisma/client` - use `@/app/generated/prisma/client` instead.
- Don't run `prisma generate` directly - use `bun db:generate` (respects custom output path).
- Don't use ESLint/Prettier commands - this project uses Biome exclusively.
- Remember to handle both authenticated and public access paths (see README requirements).
- Never use `any` type - it defeats TypeScript's type safety.
