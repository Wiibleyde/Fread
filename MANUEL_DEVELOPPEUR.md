# Manuel Développeur - Fread

## Table des matières

- [Introduction](#introduction)
- [Architecture globale](#architecture-globale)
- [Backend - API Express](#backend---api-express)
- [Frontend - React](#frontend---react)
- [Base de données et Prisma](#base-de-données-et-prisma)
- [Tests](#tests)
- [Développement local](#développement-local)
- [Contribution](#contribution)

---

## Introduction

Ce manuel s'adresse aux développeurs souhaitant comprendre, maintenir ou faire évoluer le projet Fread. Il couvre l'architecture technique, les conventions de code et les processus de développement.

### Stack technique

**Backend** :
- TypeScript avec Node.js / Bun
- Express.js (serveur HTTP)
- Prisma (ORM PostgreSQL)
- JWT pour l'authentification
- Zod pour la validation
- Jest pour les tests

**Frontend** :
- React 19 avec TypeScript
- TanStack Router (file-based routing)
- TanStack Query (gestion d'état serveur)
- Tailwind CSS 4 + shadcn/ui
- Vite (build tool)
- Vitest (tests)
- Biome (linting/formatting)

**Infrastructure** :
- PostgreSQL (base de données)
- Docker & Docker Compose
- Nginx (production frontend)

---

## Architecture globale

### Vue d'ensemble

```
┌─────────────┐      HTTP/JSON       ┌─────────────┐      SQL       ┌─────────────┐
│             │ ──────────────────►  │             │ ──────────────► │             │
│   Frontend  │                      │   Backend   │                 │  PostgreSQL │
│   (React)   │ ◄──────────────────  │  (Express)  │ ◄────────────── │             │
└─────────────┘                      └─────────────┘                 └─────────────┘
     :3000                                :3001                          :5432
```

### Styles architecturaux appliqués

#### 1. Architecture en couches (Layered Architecture)

Séparation en 3 couches distinctes :
- **Présentation** : Routes et Controllers (HTTP)
- **Logique métier** : Services (business logic)
- **Accès aux données** : Prisma (ORM)

**Avantages** :
- Code modulaire et maintenable
- Tests indépendants par couche
- Ajout rapide de nouvelles fonctionnalités (~20 min)

#### 2. Clean Architecture

Principe d'inversion de dépendances :
- Les couches internes (services) ne dépendent pas des couches externes (frameworks)
- Logique métier indépendante d'Express et Prisma
- Facilite les tests unitaires et la migration technologique

### Design Patterns utilisés

#### 1. Singleton (connexion base de données)
Garantit une seule instance du client Prisma partagée dans toute l'application.

**Implémentation** : voir `api/prisma.ts`

#### 2. Builder (création des routes)
Centralise la construction des routes via une interface déclarative `RouteDescriptor`.

**Implémentation** : voir `api/builder/routeRegister.ts`

#### 3. Factory (création des services)
Les services sont exposés comme factory functions pour faciliter les tests et l'injection de dépendances.

**Implémentation** : voir `api/services/*.service.ts`

---

## Backend - API Express

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
├── prisma/            # Schéma Prisma et migrations
├── generated/prisma/  # Client Prisma généré
├── tests/             # Tests unitaires Jest
├── index.ts           # Point d'entrée
└── env.ts             # Configuration environnement
```

### Point d'entrée : `api/index.ts`

Le fichier `index.ts` initialise l'application Express :
1. Configuration (JSON, CORS)
2. Route de santé `/status`
3. Enregistrement des routers (auth, account, follow, post, like)
4. Middleware global de gestion d'erreurs
5. Démarrage du serveur HTTP
6. Health check de la base de données

### Flux d'une requête

```
Requête HTTP
    │
    ▼
┌─────────────┐
│   Router    │  Route matching
└─────────────┘
    │
    ▼
┌─────────────┐
│ Middlewares │  Auth, Validation
└─────────────┘
    │
    ▼
┌─────────────┐
│ Controller  │  Orchestration
└─────────────┘
    │
    ▼
┌─────────────┐
│  Service    │  Logique métier + DB
└─────────────┘
    │
    ▼
┌─────────────┐
│   Prisma    │  Requêtes SQL
└─────────────┘
    │
    ▼
Réponse JSON
```

### Middlewares

#### `authMiddleware` (api/middleware/auth.ts)
- Vérifie la présence et la validité du JWT
- Décode le token et attache `req.account`
- Renvoie 401 si invalide

#### `optionalAuthMiddleware` (api/middleware/optional-auth.ts)
- Tente de décoder le JWT s'il existe
- Continue même sans token (routes publiques)

#### `validateParams/Body/Query` (api/middleware/validate.ts)
- Valide les données avec les schémas Zod
- Renvoie 400 avec détails des erreurs si échec

#### `errorMiddleware` (api/middleware/error.ts)
- Centralise le traitement des erreurs
- Convertit les `AppError` en réponses JSON standardisées

### Controllers

Les controllers orchestrent la logique métier sans contenir de logique métier :
- Extraction des paramètres de requête
- Appel des services
- Formatage de la réponse HTTP

**Exemple** : `api/controllers/account.controller.ts`

```typescript
class AccountController {
  getProfile = async (req: AuthenticatedRequest) => {
    const id = req.params.id;
    const viewerId = req.account?.id;

    const account = await getAccountByIdDB(id);
    const postsCount = await getPostsCountByAccountId(id);
    const followersCount = await getFollowersCount(id);

    return {
      account: {
        ...account,
        postsCount,
        followersCount
      },
      retrieved: true
    };
  }
}
```

### Services

Les services contiennent la logique métier et les interactions avec la base de données. Tous les noms de fonctions se terminent par `DB`.

**Convention de nommage** : `{action}{Entity}DB`

**Exemples** :
- `createAccountDB(data)`
- `getPostByIdDB(id)`
- `followAccountDB(followerId, followedId)`

**Fichiers** : `api/services/*.service.ts`

### Routes

Les routes utilisent le pattern Builder avec `RouteDescriptor` :

```typescript
interface RouteDescriptor {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  middlewares?: RequestHandler[];
  handler: RequestHandler;
}
```

**Exemple** : `api/routes/account/account.route.ts`

```typescript
const createAccountRoutes = (): RouteDescriptor[] => {
  const controller = new AccountController();
  return [
    {
      method: "get",
      path: "/account/:id",
      middlewares: [validateParams(idParamSchema), optionalAuthMiddleware],
      handler: asyncHandler(async (req, res) => {
        const result = await controller.getProfile(req);
        res.json(result);
      }),
    },
  ];
};
```

Enregistrement dans `index.ts` :
```typescript
import { registerRoutes } from "./builder/routeRegister";
const accountRouter = express.Router();
registerRoutes(accountRouter, createAccountRoutes());
app.use(accountRouter);
```

### Gestion des erreurs

Toutes les erreurs personnalisées héritent de `AppError` (voir `api/errors/`).

**Classes d'erreurs disponibles** :
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `InternalError` (500)

**Utilisation** :
```typescript
if (!account) {
  throw new NotFoundError("Account not found");
}
```

Le middleware `errorMiddleware` capture ces erreurs et les convertit en réponses JSON, cela permet de ne pas dépendre du framework dans la logique métier.

### Validation avec Zod

Les schémas de validation sont centralisés dans `api/schemas/`.

**Exemple** : `api/schemas/account.ts`
```typescript
export const accountEditSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
});
```

Utilisation dans les routes :
```typescript
middlewares: [validateBody(accountEditSchema)]
```

### Commandes de développement

```bash
cd api

# Installation
bun install

# Développement
bun run index.ts

# Tests
bun test              # Tous les tests
bun test:watch        # Mode watch
bun test:coverage     # Couverture de code

# Base de données
bun run db:generate   # Générer le client Prisma
bun run db:migrate    # Créer et appliquer une migration
```

---

## Frontend - React

### Structure des dossiers

```
front/src/
├── routes/            # File-based routing (TanStack Router)
│   ├── __root.tsx
│   ├── _authenticated.tsx
│   ├── index.tsx
│   ├── login.tsx
│   └── _authenticated/
│       ├── feed.tsx
│       └── profile/
├── components/        # Composants réutilisables
│   └── ui/           # Composants shadcn/ui
├── contexts/          # Contextes React (AuthContext)
├── hooks/             # Hooks personnalisés
│   ├── queries/      # TanStack Query (GET)
│   └── mutations/    # TanStack Query (POST/PATCH/DELETE)
├── integrations/      # Intégrations tierces
│   └── tanstack-query/
├── lib/               # Utilitaires et configuration
│   ├── api-client.ts
│   ├── api-types.ts
│   ├── query-keys.ts
│   └── storage.ts
├── test/              # Configuration tests
├── main.tsx           # Point d'entrée
└── styles.css         # Styles globaux Tailwind
```

### Point d'entrée : `front/src/main.tsx`

1. Création du routeur TanStack avec l'arbre généré
2. Configuration TanStack Query Provider
3. Initialisation du contexte d'authentification
4. Rendu de l'application dans le DOM

### Routage basé sur fichiers

TanStack Router génère automatiquement les routes à partir de la structure des fichiers.

**Convention de nommage** :
- `index.tsx` → route `/`
- `login.tsx` → route `/login`
- `$id.tsx` → paramètre dynamique `:id`
- `_authenticated.tsx` → layout protégé (préfixe `_`)

**Export pattern** :
```tsx
export const Route = createFileRoute("/profile/$id")({
  component: ProfilePage,
  beforeLoad: ({ context }) => {
    // Logique de chargement, auth, etc.
  },
});
```

### Authentification

#### AuthContext (`contexts/AuthContext.tsx`)

Gère l'état d'authentification global :
- Stockage/lecture du JWT dans localStorage
- Décodage du JWT pour extraire les infos utilisateur
- Méthodes : `login()`, `logout()`, `updateUser()`

**Utilisation** :
```tsx
const { user, isAuthenticated, logout } = useAuth();
```

#### Client API (`lib/api-client.ts`)

Instance Axios configurée avec :
- Base URL depuis `VITE_API_URL`
- Intercepteur ajoutant automatiquement `Authorization: Bearer <token>`
- Gestion des erreurs 401 (redirection vers login)

#### Routes protégées

Le layout `_authenticated.tsx` utilise `beforeLoad` pour vérifier l'authentification :
```tsx
beforeLoad: async ({ location }) => {
  if (!isAuthenticated) {
    throw redirect({
      to: "/login",
      search: { redirect: location.href }
    });
  }
}
```

### Gestion des données avec TanStack Query

#### Queries (lecture)

Hooks personnalisés dans `hooks/queries/` :

```tsx
// hooks/queries/useAccount.ts
export function useAccount(id: string) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => apiClient.get(`/account/${id}`).then(res => res.data),
  });
}

// Utilisation dans un composant
const { data, isLoading, error } = useAccount(userId);
```

#### Mutations (écriture)

Hooks personnalisés dans `hooks/mutations/` :

```tsx
// hooks/mutations/useCreatePost.ts
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => 
      apiClient.post('/post', data).then(res => res.data),
    onSuccess: () => {
      // Invalide le cache pour refetch les posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Utilisation
const createPost = useCreatePost();
createPost.mutate({ content: "Hello!", isPrivate: false });
```

#### Clés de cache centralisées

`lib/query-keys.ts` centralise les clés de cache :

```typescript
export const queryKeys = {
  account: (id: string) => ['account', id],
  posts: () => ['posts'],
  post: (id: string) => ['post', id],
  // ...
};
```

### Composants UI (shadcn/ui)

Composants réutilisables basés sur Radix UI + Tailwind dans `components/ui/`.

**Ajout d'un nouveau composant** :
```bash
npx shadcn@latest add button
```

**Utilisation** :
```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Publier
</Button>
```

### Styling avec Tailwind CSS

Classes utilitaires Tailwind directement dans le JSX :

```tsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-gray-100">
  <Avatar className="h-12 w-12" />
  <div className="flex-1">
    <h3 className="font-semibold text-lg">{user.displayName}</h3>
    <p className="text-sm text-gray-500">@{user.username}</p>
  </div>
</div>
```

Helper `cn()` pour combiner les classes conditionnellement :
```tsx
import { cn } from "@/lib/utils";

<Button className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes"
)} />
```

### Types TypeScript

Types pour les réponses API dans `lib/api-types.ts` :

```typescript
export interface Account {
  id: string;
  username: string;
  displayName: string;
  description?: string;
  isPrivate: boolean;
  profilePictureUrl?: string;
}

export interface Post {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  author: Account;
  likesCount: number;
  repliesCount: number;
}
```

### Commandes de développement

```bash
cd front

# Installation
bun install

# Développement
bun run dev           # http://localhost:3000

# Build
bun run build         # Génère dist/
bun run preview       # Sert le build

# Tests
bun test              # Tous les tests
bun test:watch        # Mode watch
bun test:ui           # Interface UI
bun test:coverage     # Couverture

# Qualité de code
bun run lint          # Vérification
bun run check:fix     # Correction auto
```

---

## Base de données et Prisma

### Schéma Prisma

Fichier : `api/prisma/schema.prisma`

**Modèles principaux** :
- `Account` : utilisateurs
- `Post` : publications
- `Like` : likes sur les posts
- `Follow` : relations de suivi

**Relations** :
- Un `Account` peut avoir plusieurs `Post`s
- Un `Post` peut avoir plusieurs `Like`s et réponses (`Post.parentId`)
- Un `Account` peut suivre plusieurs autres `Account`s

### Client Prisma

Généré dans `api/generated/prisma/` à partir du schéma.

**Import** :
```typescript
import { prisma } from "./prisma";

const account = await prisma.account.findUnique({
  where: { id: accountId },
});
```

### Migrations

Créer une nouvelle migration après modification du schéma :

```bash
cd api
bun run db:migrate
```

Cela :
1. Crée un fichier de migration SQL dans `api/prisma/migrations/`
2. Applique la migration sur la base de données

Il faudra à nouveau générer le client Prisma si le schéma a changé :

```bash
bun run db:generate
```

### Requêtes Prisma courantes

**Créer** :
```typescript
const account = await prisma.account.create({
  data: { username, displayName, description },
});
```

**Lire** :
```typescript
const account = await prisma.account.findUnique({
  where: { id },
  include: { posts: true }, // Relations
});
```

**Mettre à jour** :
```typescript
const account = await prisma.account.update({
  where: { id },
  data: { displayName: "New Name" },
});
```

**Supprimer** :
```typescript
await prisma.account.delete({
  where: { id },
});
```

**Requêtes complexes** :
```typescript
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { isPrivate: false },
      { authorId: { in: followedIds } },
    ],
  },
  include: {
    author: true,
    _count: { select: { likes: true, replies: true } },
  },
  orderBy: { createdAt: 'desc' },
});
```

---

## Tests

### Backend (Jest)

Fichiers de test : `api/tests/**/*.spec.ts`

**Structure** :
```typescript
describe('AccountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an account', async () => {
    const mockAccount = { id: '1', username: 'test' };
    (prisma.account.create as jest.Mock).mockResolvedValue(mockAccount);

    const result = await createAccountDB({ username: 'test' });

    expect(result).toEqual(mockAccount);
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: { username: 'test' },
    });
  });
});
```

**Mocking Prisma** :
```typescript
jest.mock("./prisma", () => ({
  prisma: {
    account: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
```

### Frontend (Vitest + Testing Library)

Fichiers de test : à côté des composants (`Component.test.tsx`)

**Exemple** :
```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Développement local

### Installation

📖 **Pour toutes les procédures d'installation détaillées**, consultez [INSTALLATION.md](INSTALLATION.md) qui couvre :
- Installation avec Docker (recommandé)
- Installation locale (backend + frontend + base de données)
- Configuration OAuth (Discord, Google)
- Variables d'environnement
- Vérification et dépannage

### Démarrage rapide

```bash
# Avec Docker (recommandé)
docker compose up -d

# OU sans Docker
cd api && bun install && bun run db:generate && bun run db:migrate && bun run index.ts
cd front && bun install && bun run dev
```

---

## Ressources utiles

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zod Documentation](https://zod.dev/)

---

**Bon développement sur Fread ! 🚀**
