# Architecture - Fread

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Styles Architecturaux](#styles-architecturaux)
- [Design Patterns](#design-patterns)
- [Architecture Backend](#architecture-backend)
- [Architecture Frontend](#architecture-frontend)
- [Architecture de la base de données](#architecture-de-la-base-de-données)
- [Flux de données](#flux-de-données)
- [Sécurité et Authentification](#sécurité-et-authentification)

---

## Vue d'ensemble

Fread suit une architecture moderne full-stack avec séparation claire entre frontend et backend, communiquant via une API REST.

```
┌─────────────────────┐      HTTP/JSON       ┌─────────────────────┐      SQL       ┌─────────────────────┐
│                     │ ──────────────────►  │                     │ ──────────────► │                     │
│   Frontend (React)  │                      │  Backend (Express)  │                 │  PostgreSQL         │
│   TanStack Router   │ ◄──────────────────  │  Prisma ORM         │ ◄────────────── │  Base de données    │
│   TanStack Query    │                      │  JWT Auth           │                 │                     │
└─────────────────────┘                      └─────────────────────┘                 └─────────────────────┘
     Port: 3000                                   Port: 3001                              Port: 5432
```

### Stack technique complète

**Backend** :
- **Runtime** : Node.js / Bun (développement)
- **Framework** : Express.js
- **ORM** : Prisma avec adaptateur PostgreSQL
- **Authentification** : JWT (JSON Web Tokens) + OAuth (Discord, Google)
- **Validation** : Zod
- **Tests** : Jest + ts-jest
- **Logging** : Winston (custom logger)

**Frontend** :
- **Framework** : React 19
- **Routeur** : TanStack Router (file-based routing)
- **État serveur** : TanStack Query (React Query)
- **Formulaires** : TanStack Form
- **Styling** : Tailwind CSS 4
- **Composants** : shadcn/ui (Radix UI)
- **HTTP Client** : Axios
- **Tests** : Vitest + Testing Library
- **Linting/Formatting** : Biome
- **Build** : Vite

**Infrastructure** :
- **Base de données** : PostgreSQL 16
- **Conteneurisation** : Docker + Docker Compose
- **Serveur web (prod)** : Nginx (pour le frontend)

📖 **Pour l'installation et la configuration**, consultez [INSTALLATION.md](INSTALLATION.md)

---

## Styles Architecturaux

### 1. Architecture en couches (Layered Architecture)

Séparation stricte en 3 couches distinctes pour maintenir un code propre, modulaire et testable.

#### Les couches

```
┌─────────────────────────────────────────────┐
│  Couche Présentation (Routes/Controllers)  │  ← Gestion HTTP, validation
├─────────────────────────────────────────────┤
│  Couche Logique Métier (Services)          │  ← Business logic
├─────────────────────────────────────────────┤
│  Couche Accès aux Données (Prisma)         │  ← Interaction DB
└─────────────────────────────────────────────┘
```

#### Exemple de cheminement complet

**1. Couche Présentation (Routes)** - Définition de l'endpoint et des middlewares

`api/routes/account/account.route.ts`
```typescript
{
  method: "get",
  path: `${prefix}/:id`,  // prefix = "/account"
  middlewares: [
    validateParams(idParamSchema, "params"),
    optionalAuthMiddleware,
  ],
  handler: asyncHandler(async (req, res) => {
    const result = await controller.getProfile(req as AuthenticatedRequest);
    res.json(result);
  }),
}
```

**2. Couche Logique Métier (Controller)** - Orchestration de la logique

`api/controllers/account.controller.ts`
```typescript
class AccountController {
  getProfile = async (req: AuthenticatedRequest) => {
    const id = req.params.id;
    const viewerId = req.account?.id;

    if (!id) {
      return { account: null, retrieved: false };
    }

    logger.debug("Retrieving profile");
    const account = await getAccountByIdDB(id);
    if (!account) {
      return { account: null, retrieved: false };
    }

    // Logique métier : vérification des permissions, agrégation de données
    return {
      retrieved: !!account,
      account: {
        ...account,
        postsCount: await getPostsCountByAccountId(account.id),
        followingCount: await getFollowingCount(account.id),
        followersCount: await getFollowersCount(account.id),
        followers: await getFollowersByAccountId(account.id),
        follows: await getFollowingByAccountId(account.id),
        isFollowing: viewerId ? await isFollowing(account.id, viewerId) : false,
      },
    };
  };
}
```

**3. Couche Accès aux Données (Service)** - Interaction avec la base de données

`api/services/account.service.ts`
```typescript
export const getAccountByIdDB = (id: string) => {
  return prisma.account.findUnique({
    where: { id },
    include: {
      profilePicture: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
  });
};

export const getPostsCountByAccountId = (accountId: string) => {
  return prisma.post.count({
    where: { authorId: accountId },
  });
};
```

#### Avantages

- ✅ **Maintenabilité** : Ajout rapide de nouvelles fonctionnalités (~20 min pour une feature complète)
- ✅ **Testabilité** : Tests indépendants par couche sans dépendances croisées
- ✅ **Séparation des responsabilités** : Chaque couche a un rôle bien défini
- ✅ **Évolutivité** : Facilite les modifications et les extensions

### 2. Clean Architecture

Principe d'inversion de dépendances : les couches internes ne dépendent jamais des couches externes.

#### Diagramme de dépendances

```
         ┌──────────────────┐
         │   Frameworks     │  ← Express, Prisma (couche externe)
         │   (HTTP, DB)     │
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │   Controllers    │  ← Adaptateurs HTTP
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │    Services      │  ← Logique métier pure (couche interne)
         │  (Business Logic)│
         └──────────────────┘
```

**Les dépendances pointent toujours vers l'intérieur**

#### Illustration du principe

`api/services/account.service.ts` - Services indépendants du framework
```typescript
// CreateAccountData est un type métier pur, indépendant d'Express
export const createAccountDB = (data: CreateAccountData) => {
  return prisma.account.create({
    data: {
      username: data.username,
      displayName: data.displayName,
      description: data.description as string,
      private: data.private,
      profilePictureId: data.profilePictureId,
      appleId: data.appleId,
      googleId: data.googleId,
      discordId: data.discordId,
      profileCompleted: data.profileCompleted,
    },
  });
};
```

`api/controllers/account.controller.ts` - Controller adapte HTTP vers la logique métier
```typescript
class AccountController {
  getProfile = async (req: AuthenticatedRequest) => {
    // Extraction des données HTTP (spécifique à Express)
    const id = req.params.id;
    const viewerId = req.account?.id;
    
    // Appel de la logique métier (indépendante d'Express)
    const account = await getAccountByIdDB(id);
    
    // Formatage de la réponse HTTP
    return { account, retrieved: true };
  }
}
```

#### Avantages

- ✅ **Indépendance du framework** : La logique métier peut être réutilisée sans Express
- ✅ **Testabilité** : Services testables sans mocker Express ou HTTP
- ✅ **Migration facilitée** : Changement de framework possible sans réécrire la logique
- ✅ **Domaine métier protégé** : Le cœur de l'application reste stable

---

## Design Patterns

### 1. Singleton (gestion de la connexion base de données)

Garantit qu'une seule instance du client Prisma existe dans toute l'application.

#### Problème résolu

- ❌ Sans Singleton : Multiples connexions à la DB → dépassement de limites, performances dégradées
- ✅ Avec Singleton : Une seule connexion partagée → optimisation des ressources

#### Implémentation

`api/prisma.ts`
```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "./generated/prisma/client";
import { Logger } from "./utils/logger";

const { Pool } = pg;

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const logger = new Logger("prisma");

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: [{ emit: "event", level: "query" }],
  });
}

// ✨ Singleton : réutilise l'instance existante ou en crée une nouvelle
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

prisma.$on("query", (e) => {
  logger.debug(`[Prisma] ${e.query} ${e.params} (${e.duration}ms)`);
});

// En développement, stocke l'instance dans globalThis pour persister entre les rechargements
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

#### Utilisation

```typescript
// Tous les services importent la même instance
import { prisma } from "../prisma";

export const getAccountByIdDB = (id: string) => {
  return prisma.account.findUnique({ where: { id } });
};
```

### 2. Builder (création des routes)

Centralise et standardise la construction des routes via une interface déclarative.

#### Problème résolu

- ❌ Sans Builder : Routes créées manuellement, duplication, incohérences
- ✅ Avec Builder : Configuration déclarative, standardisée, DRY

#### Implémentation

**Étape 1 : Définir la structure**

`api/models/route.model.ts`
```typescript
export interface RouteDescriptor {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  middlewares?: RequestHandler[];
  handler: RequestHandler;
}
```

**Étape 2 : Créer le builder**

`api/builder/routeRegister.ts`
```typescript
import type { Router } from "express";
import type { RouteDescriptor } from "../models/route.model";
import { Logger } from "../utils/logger";

export function registerRoutes(
  router: Router,
  routes: RouteDescriptor[]
) {
  const logger = Logger.here();

  routes.forEach(route => {
    logger.debug(`Registering route [${route.method.toUpperCase()}] ${route.path}`);
    router[route.method](
      route.path,
      ...(route.middlewares ?? []),
      route.handler
    );
  });
}
```

**Étape 3 : Utiliser le builder**

`api/routes/account/account.route.ts`
```typescript
const createAccountRoutes = (): RouteDescriptor[] => {
  const controller = new AccountController();
  const prefix = "/account";

  return [
    {
      method: "get",
      path: `${prefix}/:id`,
      middlewares: [
        validateParams(idParamSchema, "params"),
        optionalAuthMiddleware,
      ],
      handler: asyncHandler(async (req, res) => {
        const result = await controller.getProfile(req as AuthenticatedRequest);
        res.json(result);
      }),
    },
    {
      method: "patch",
      path: `${prefix}`,
      middlewares: [authMiddleware, validateBody(accountEditSchema, "body")],
      handler: asyncHandler(async (req, res) => {
        const result = await controller.editAccount(req as AuthenticatedRequest);
        res.json(result);
      }),
    },
  ];
};
```

**Étape 4 : Enregistrer dans l'application**

`api/index.ts`
```typescript
import { registerRoutes } from "./builder/routeRegister";

const accountRouter = express.Router();
registerRoutes(accountRouter, createAccountRoutes());
app.use(accountRouter);
```

#### Avantages

- ✅ **Centralisation** : Changement de routage en un seul endroit
- ✅ **Standardisation** : Toutes les routes suivent le même pattern
- ✅ **Lisibilité** : Configuration déclarative claire
- ✅ **Extensibilité** : Ajout facile de nouvelles routes

### 3. Factory (création des services)

Les services sont exposés comme des factory functions pour encapsuler la logique de création.

#### Problème résolu

- ❌ Sans Factory : Dépendances hardcodées, difficiles à tester
- ✅ Avec Factory : Injection de dépendances, mocking facile

#### Implémentation

`api/services/account.service.ts` - Services comme factory functions
```typescript
export const getAccountByIdDB = (id: string) => {
  return prisma.account.findUnique({ where: { id } });
};

export const createAccountDB = (data: CreateAccountData) => {
  return prisma.account.create({ data });
};

export const updateAccountDB = (id: string, data: Partial<Account>) => {
  return prisma.account.update({ where: { id }, data });
};
```

`api/controllers/account.controller.ts` - Controller utilise les factories
```typescript
class AccountController {
  getProfile = async (req: AuthenticatedRequest) => {
    const id = req.params.id;
    const viewerId = req.account?.id;

    // Appels aux différents services (factory functions)
    const account = await getAccountByIdDB(id);
    const postsCount = await getPostsCountByAccountId(id);
    const followersCount = await getFollowersCount(id);
    const followingCount = await getFollowingCount(id);
    
    // Assemblage et retour du résultat
    return {
      account: {
        ...account,
        postsCount,
        followersCount,
        followingCount,
      },
      retrieved: true
    };
  }
}
```

#### Tests facilités

`api/tests/services/account.service.spec.ts`
```typescript
// Mock facile de Prisma
jest.mock("../prisma", () => ({
  prisma: {
    account: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }
  }
}));

describe("getAccountByUsernameDB", () => {
  it("récupère un compte via son username", async () => {
    prismaMock.account.findUnique.mockResolvedValue(baseAccount);

    const result = await getAccountByUsernameDB(baseAccount.username);

    expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
        where: { username: baseAccount.username },
    });
    expect(result).toBe(baseAccount);
  });
});
```

---

## Architecture Backend

### Structure des dossiers

```
api/
├── builders/          # Constructeurs (route builder)
├── controllers/       # Controllers (orchestration HTTP)
├── services/          # Services (logique métier + DB)
├── routes/            # Définition des routes par domaine
├── middleware/        # Middlewares (auth, validation, erreurs)
├── models/            # Types TypeScript
├── schemas/           # Schémas de validation Zod
├── utils/             # Utilitaires (logger, JWT, DB)
├── errors/            # Classes d'erreurs personnalisées
├── prisma/            # Schéma Prisma et migrations
├── generated/prisma/  # Client Prisma généré
├── tests/             # Tests unitaires Jest
├── index.ts           # Point d'entrée
└── env.ts             # Configuration environnement
```

### Flux d'une requête HTTP

```
1. Client HTTP
     │
     ▼
2. Express Router (route matching)
     │
     ▼
3. Middlewares
     ├─► Validation (Zod schemas)
     ├─► Authentification (JWT)
     └─► Logging
     │
     ▼
4. Controller
     ├─► Extraction des paramètres
     ├─► Appel des services
     └─► Formatage de la réponse
     │
     ▼
5. Services
     ├─► Logique métier
     ├─► Validation business rules
     └─► Appels Prisma
     │
     ▼
6. Prisma ORM
     ├─► Génération SQL
     └─► Exécution requête
     │
     ▼
7. PostgreSQL
     │
     ▼
8. Réponse JSON au client
```

### Middlewares

#### 1. Authentification (`middleware/auth.ts`)

```typescript
export const authMiddleware: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = getTokenFromAuthorizationHeader(req);

        if (!token) {
            log.warn("Auth failed: no token provided in Authorization header");
            return next(new UnauthorizedError("Unauthorized"));
        }

        const payload = verifyJWT(token);

        if (!payload) {
            log.warn("Auth failed: invalid token");
            return next(new UnauthorizedError("Unauthorized"));
        }

        const account = await authenticateUser(payload.id);

        if (!account) {
            log.warn("Auth failed: user not found for token subject");
            return next(new UnauthorizedError("Unauthorized"));
        }

        (req as AuthenticatedRequest).account = account;
        log.debug("Authenticated request");
        next();
    } catch (_err) {
        log.error("Auth middleware error");
        return next(new UnauthorizedError("Unauthorized"));
    }
};
```

#### 2. Authentification optionnelle (`middleware/optional-auth.ts`)

```typescript
export const optionalAuthMiddleware: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = getTokenFromAuthorizationHeader(req);

        if (!token) {
            log.debug("No token provided, proceeding as guest");
            return next();
        }

        const payload = verifyJWT(token);

        if (!payload) {
            log.debug("Invalid token, proceeding as guest");
            return next();
        }

        const account = await authenticateUser(payload.id);

        if (!account) {
            log.debug("No account found for token subject, proceeding as guest");
            return next();
        }

		(req as AuthenticatedRequest).account = account || undefined;
		log.debug("Authenticated in optional auth middleware");
        next();
    } catch (_err) {
        log.warn("Optional auth middleware error; treating as guest");
        return next();
    }
}
```

#### 3. Validation (`middleware/validate.ts`)

```typescript
function makeValidator(getPart: (req: Request) => unknown, setPart?: (req: Request, value: unknown) => void) {
    return (schema: ZodTypeAny, label: string): RequestHandler => {
        return (req: Request, _res: Response, next: NextFunction) => {
            const result = schema.safeParse(getPart(req));
            if (!result.success) {
                log.warn(`Invalid ${label}`);
                const first = result.error.issues?.[0];
                const message = first?.message || "Invalid input";
                return next(new BadRequestError(message));
            }
            if (setPart) setPart(req, result.data);
            next();
        };
    };
}

export const validateBody = makeValidator(
    (req) => req.body,
    (req, val) => { req.body = val as Record<string, unknown>; }
);

export const validateParams = makeValidator(
    (req) => req.params,
    (req, val) => { req.params = val as Record<string, string>; }
);

export const validateQuery = makeValidator(
    (req) => req.query,
    (req, val) => { req.query = val as Record<string, string>; }
);

```

#### 4. Gestion d'erreurs (`middleware/error.ts`)

```typescript
export function errorMiddleware(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.data ?? {}),
        });
    }

    // Stack trace uniquement en niveau debug pour éviter de logguer trop d'infos sensibles
    if (log.minLevel === "debug") {
        log.error("Unhandled error (debug)", err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err);
    } else {
        log.error("Unhandled error");
    }
    res.status(500).json({ error: "Internal server error" });
}
```

### Gestion des erreurs

Toutes les erreurs héritent de `AppError` :

```typescript
// errors/AppError.ts
class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
  }
}

export default AppError;

// errors/badrequest.error.ts
class BadRequestError extends AppError {
  constructor(message: string, data?: Record<string, unknown>) {
    super(message, 400, data);
  }
}

export default BadRequestError;

// Autres : UnauthorizedError (401), ForbiddenError (403), NotFoundError (404)
```

### Création de middlewares personnalisés

Vous pouvez créer des middlewares personnalisés en suivant le modèle ci-dessus. Par exemple, un middleware qui empeche l'accès aux utilisateurs non administrateurs et l'utiliser dans une route en suivant le modèle des autres middlewares.

---

## Architecture Frontend

### Structure des dossiers

```
front/src/
├── routes/            # File-based routing (TanStack Router)
│   ├── __root.tsx     # Layout racine
│   ├── _authenticated.tsx  # Layout protégé
│   ├── index.tsx      # Page d'accueil
│   ├── login.tsx      # Page de connexion
│   └── _authenticated/
│       ├── feed.tsx   # Fil d'actualité
│       └── profile/   # Profils
├── components/        # Composants réutilisables
│   └── ui/           # shadcn/ui components
├── contexts/          # Contextes React
│   └── AuthContext.tsx
├── hooks/             # Hooks personnalisés
│   ├── queries/      # TanStack Query (GET)
│   └── mutations/    # TanStack Query (POST/PATCH/DELETE)
├── integrations/      # Intégrations tierces
│   └── tanstack-query/
├── lib/               # Utilitaires
│   ├── api-client.ts # Client Axios
│   ├── api-types.ts  # Types API
│   ├── query-keys.ts # Clés de cache
│   └── storage.ts    # localStorage utils
└── main.tsx           # Point d'entrée
```

### Routage basé sur fichiers

```
Structure des fichiers          →    Routes générées
──────────────────────────────────────────────────────
routes/index.tsx                →    /
routes/login.tsx                →    /login
routes/_authenticated.tsx       →    Layout protégé
routes/_authenticated/feed.tsx  →    /feed
routes/profile/$id.tsx          →    /profile/:id
routes/profile/$id/followers.tsx →   /profile/:id/followers
```

**Conventions** :
- `$id.tsx` → paramètre dynamique
- `_authenticated.tsx` → layout (préfixe `_`)
- `index.tsx` → route par défaut

### Flux d'une page

```
1. Navigation utilisateur (/profile/:id)
     │
     ▼
2. TanStack Router
     ├─► beforeLoad (vérification auth)
     └─► Chargement du composant
     │
     ▼
3. Composant React
     ├─► useQuery (récupération données)
     └─► Rendu UI
     │
     ▼
4. TanStack Query
     ├─► Vérifie le cache
     ├─► Requête API si besoin
     └─► Mise à jour du cache
     │
     ▼
5. Axios (api-client)
     ├─► Ajout JWT header
     └─► Requête HTTP
     │
     ▼
6. Backend API
     │
     ▼
7. Réponse → Cache → Rendu
```

### Gestion d'état

#### 1. État serveur (TanStack Query)

```typescript
// hooks/queries/useAccount.ts
export function useAccount(id: string) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => apiClient.get(`/account/${id}`).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Utilisation
const { data: account, isLoading } = useAccount(userId);
```

#### 2. État local (React hooks)

```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '' });
```

#### 3. État global (Context)

```typescript
// contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ...
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Utilisation
const { user, isAuthenticated, logout } = useAuth();
```

---

## Architecture de la base de données

### Modèles Prisma

```prisma
model Account {
  id              String   @id @default(cuid())
  username        String   @unique
  displayName     String
  description     String?
  private         Boolean  @default(false)
  profilePictureId String?
  
  // OAuth
  discordId       String?  @unique
  googleId        String?  @unique
  appleId         String?  @unique
  
  // Relations
  posts           Post[]
  likes           Like[]
  following       Follow[] @relation("Following")
  followers       Follow[] @relation("Followers")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Post {
  id              String   @id @default(cuid())
  content         String
  private         Boolean  @default(false)
  
  // Relations
  authorId        String
  author          Account  @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  parentId        String?
  parent          Post?    @relation("Replies", fields: [parentId], references: [id], onDelete: Cascade)
  replies         Post[]   @relation("Replies")
  
  likes           Like[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Like {
  id              String   @id @default(cuid())
  
  accountId       String
  account         Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  postId          String
  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  
  @@unique([accountId, postId])
}

model Follow {
  id              String   @id @default(cuid())
  
  followerId      String
  follower        Account  @relation("Following", fields: [followerId], references: [id], onDelete: Cascade)
  
  followedId      String
  followed        Account  @relation("Followers", fields: [followedId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  
  @@unique([followerId, followedId])
}
```

### Diagramme relationnel

```
┌─────────────┐         ┌─────────────┐
│   Account   │         │    Post     │
├─────────────┤         ├─────────────┤
│ id          │◄───────┤ authorId    │
│ username    │    1:N  │ content     │
│ displayName │         │ private     │
│ private     │         │ parentId    │──┐
└─────────────┘         └─────────────┘  │
       │                       │          │ Self-reference
       │ 1:N                   │ 1:N      │ (Replies)
       │                       │          │
       ▼                       ▼          ▼
┌─────────────┐         ┌─────────────┐
│    Follow   │         │    Like     │
├─────────────┤         ├─────────────┤
│ followerId  │         │ accountId   │
│ followedId  │         │ postId      │
└─────────────┘         └─────────────┘
```

### Contraintes et cascades

- **Unique** : `username`, `discordId`, `googleId`, `(accountId, postId)`, `(followerId, followedId)`
- **Cascade delete** : Suppression d'un compte → supprime posts, likes, follows
- **IDs** : CUID (Collision-resistant Unique IDs)

---

## Flux de données

### Création d'un post (exemple complet)

```
┌──────────┐
│ Frontend │
└────┬─────┘
     │ 1. User click "Publier"
     │
     ▼
┌────────────────────────┐
│ useCreatePost hook     │
└────┬───────────────────┘
     │ 2. mutation.mutate({ content, isPrivate })
     │
     ▼
┌────────────────────────┐
│ Axios API Client       │
└────┬───────────────────┘
     │ 3. POST /post + JWT header
     │
     ▼
┌────────────────────────┐
│ Backend: POST /post    │
└────┬───────────────────┘
     │ 4. authMiddleware → vérifie JWT
     │ 5. validateBody → Zod validation
     │
     ▼
┌────────────────────────┐
│ PostController.create  │
└────┬───────────────────┘
     │ 6. Extraction req.body, req.account
     │
     ▼
┌────────────────────────┐
│ createPostDB service   │
└────┬───────────────────┘
     │ 7. prisma.post.create()
     │
     ▼
┌────────────────────────┐
│ PostgreSQL             │
└────┬───────────────────┘
     │ 8. INSERT INTO posts
     │
     ▼
┌────────────────────────┐
│ Retour du post créé    │
└────┬───────────────────┘
     │ 9. Réponse JSON
     │
     ▼
┌────────────────────────┐
│ TanStack Query         │
└────┬───────────────────┘
     │ 10. onSuccess: invalidateQueries(['posts'])
     │
     ▼
┌────────────────────────┐
│ UI mise à jour         │
└────────────────────────┘
```

---

## Sécurité et Authentification

### JWT (JSON Web Tokens)

#### Génération du token

```typescript
// api/utils/jwt.ts
export function generateJWT(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}
```

#### Vérification du token

```typescript
export function verifyJWT(token: string): JWTPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}
```

#### Stockage (Frontend)

```typescript
// lib/storage.ts
export const storage = {
  setToken: (token: string) => {
    localStorage.setItem('jwt', token);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('jwt');
  },
  
  removeToken: () => {
    localStorage.removeItem('jwt');
  },
};
```

### OAuth (Discord / Google)

#### Flux OAuth

```
1. User click "Se connecter avec Discord"
     │
     ▼
2. Redirect → Discord Authorization
     │
     ▼
3. User autorise l'application
     │
     ▼
4. Discord redirect → /auth/discord/callback?code=xxx
     │
     ▼
5. Backend échange code contre access_token
     │
     ▼
6. Backend récupère infos utilisateur Discord
     │
     ▼
7. Backend crée/met à jour Account
     │
     ▼
8. Backend génère JWT
     │
     ▼
9. Redirect frontend avec JWT dans URL
     │
     ▼
10. Frontend stocke JWT → localStorage
```

### Protection des routes

#### Backend

```typescript
// Route protégée
{
  method: "post",
  path: "/post",
  middlewares: [authMiddleware, validateBody(createPostSchema)],
  handler: controller.create,
}

// Route publique avec auth optionnelle ça peut empecher l'accès à certaines données lorsqu'elles sont privées
{
  method: "get",
  path: "/post/:id",
  middlewares: [optionalAuthMiddleware],
  handler: controller.get,
}
```

#### Frontend

```typescript
// routes/_authenticated.tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href }
      });
    }
  },
});
```

### Validation des données

#### Schémas Zod

```typescript
// schemas/posts.ts
export const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  isPrivate: z.boolean().default(false),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(500).optional(),
  isPrivate: z.boolean().optional(),
});
```

---

## Performance et Optimisation

### Cache (TanStack Query)

```typescript
// Configuration globale
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### Optimistic Updates

```typescript
// hooks/mutations/useCreatePost.ts
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.post('/post', data),
    onMutate: async (newPost) => {
      // Optimistic update
      await queryClient.cancelQueries(['posts']);
      
      const previousPosts = queryClient.getQueryData(['posts']);
      
      queryClient.setQueryData(['posts'], (old) => [
        { ...newPost, id: 'temp', createdAt: new Date() },
        ...old,
      ]);
      
      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      // Rollback en cas d'erreur
      queryClient.setQueryData(['posts'], context.previousPosts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });
}
```

### Index de base de données

```prisma
model Post {
  // ...
  
  @@index([authorId])
  @@index([createdAt])
  @@index([parentId])
}

model Like {
  // ...
  
  @@index([postId])
  @@index([accountId])
}
```

---

## Conclusion

Cette architecture combine les meilleures pratiques modernes :

✅ **Séparation des responsabilités** (Layered Architecture)
✅ **Indépendance du domaine** (Clean Architecture)
✅ **Patterns éprouvés** (Singleton, Builder, Factory)
✅ **Sécurité** (JWT, OAuth, validation)
✅ **Performance** (Cache, optimistic updates, indexes)
✅ **Testabilité** (Mocks, injection de dépendances)
✅ **Maintenabilité** (Code organisé, conventions claires)

Pour plus de détails sur l'implémentation, consultez le [Manuel Développeur](MANUEL_DEVELOPPEUR.md).
