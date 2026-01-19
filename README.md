# Fread (Better than Thread)

## Sommaire

- [Description du projet](#description-du-projet)
- [Description technique du projet](#description-technique-du-projet)
- [Instructions d'installation](#instructions-dinstallation)
- [Utilisation](#utilisation)
- [Définition du besoin utilisateur](#definition-du-besoin-utilisateur)
- [Structure du projet](#structure-du-projet)
- [Manuel utilisateur](#manuel-utilisateur)
- [Manuel technique pour les développeurs](#manuel-technique-pour-les-developpeurs)
- [Architecture du dépôt](#architecture-du-dépôt)
- [Dossiers principaux de l'API (api/)](#dossiers-principaux-de-lapi-api)
- [Fichier d'entrée de l'API : api/index.ts](#fichier-dentrée-de-lapi--apiindexts)
- [Flux typique d'une requête](#flux-typique-dune-requête)
- [Rôle des middlewares](#rôle-des-middlewares)
- [Commandes de base (API)](#commandes-de-base-api)
- [Gestion de la base de données et de Prisma](#gestion-de-la-base-de-données-et-de-prisma)
- [Tests](#tests)
- [Architecture Frontend (front/)](#architecture-frontend-front)
- [Dossiers principaux du Frontend (front/src/)](#dossiers-principaux-du-frontend-frontsrc)
- [Fichier d'entrée du Frontend : front/src/main.tsx](#fichier-dentrée-du-frontend--frontsrcmaintsx)
- [Flux typique d'une page](#flux-typique-dune-page)
- [Routage basé sur fichiers (File-Based Routing)](#routage-basé-sur-fichiers-file-based-routing)
- [Authentification Frontend](#authentification-frontend)
- [Gestion des données avec TanStack Query](#gestion-des-données-avec-tanstack-query)
- [Composants UI avec shadcn/ui](#composants-ui-avec-shadcnui)
- [Commandes de base (Frontend)](#commandes-de-base-frontend)
- [Tests Frontend](#tests-frontend)
- [Qualité de code](#qualité-de-code)
- [Configuration de l'environnement (Frontend)](#configuration-de-lenvironnement-frontend)
- [Déploiement avec Docker](#déploiement-avec-docker)
- [Conventions de développement Frontend](#conventions-de-développement-frontend)
- [Intégration API-Frontend](#intégration-api-frontend)

## Description du projet

Fread est une application de réseau social qui permet aux utilisateurs de partager des postes, d'interagir avec le contenu des autres utilisateurs, et de construire une communauté en ligne. Inspirée par des plateformes populaires (Threads), Fread vise à offrir une expérience utilisateur fluide et engageante, en mettant l'accent sur la simplicité et l'accessibilité.

Cette application est basée sur la stack technique Express.js pour le backend et Next.js pour le frontend, avec une base de données PostgreSQL gérée via l'ORM Prisma. L'authentification des utilisateurs est gérée par l'utilisation de JWT (JSON Web Tokens) pour assurer la sécurité et la confidentialité des données utilisateur.

Notre projet permet aux utilisateurs de:

- Publier des postes (texte)
- Liker et commenter les postes
- S'abonner à d'autres utilisateurs
- Créer et personnaliser leur profil utilisateur

## Description technique du projet

Une description technique du projet est disponible : langage utilisé, frameworks/librairies principaux, dépendances externes (s'il y a).

- **Langage** : TypeScript exécuté côté serveur avec Node.js (runtime Bun en développement pour l'API).
- **Frameworks / librairies principaux** :
  - Express.js pour le serveur HTTP et la gestion des routes REST.
  - Prisma comme ORM pour interagir avec la base PostgreSQL.
  - Zod pour la validation des données.
  - JSON Web Tokens (JWT) pour l'authentification et la gestion des sessions.
  - Jest / ts-jest pour les tests unitaires.
- **Dépendances externes** :
  - Base de données PostgreSQL (démarrée typiquement via Docker Compose).
  - Outils de développement : Bun pour la gestion des scripts et des dépendances.

## Instructions d'installation

### Prérequis

- Node.js / Bun pour le développement local.
- PostgreSQL (local ou via Docker).
- Docker et Docker Compose pour lancer l'API et la base de données en conteneurs.
- Git pour cloner le dépôt.
- Discord Developer Portal / Google Cloud Console pour obtenir les identifiants OAuth si vous souhaitez tester l'authentification via ces fournisseurs.

### Lancer l'API et la base de données avec Docker

Le projet peut être lancé entièrement via Docker (API + base PostgreSQL) grâce au fichier `docker-compose.yml` à la racine.

1. **Configurer les variables d'environnement dans `docker-compose.yml` (service `api`)** :

- `DATABASE_URL` : URL de connexion à PostgreSQL (par défaut `postgresql://root:RootPassword@postgres:5432/fread_db`, ne pas la modifier tant que vous utilisez la base fournie par le service `postgres`).
- `PORT` : port exposé par l'API (par défaut `3001`, mappé sur `localhost:3001`).
- `JWT_SECRET` : chaîne secrète utilisée pour signer les JWT (**à changer impérativement** en production, au moins 32 caractères).
- `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` / `DISCORD_REDIRECT_URI` : identifiants OAuth Discord et URL de redirection. Mettre vos vraies valeurs si vous testez l'auth Discord, `http://localhost:{PORT_FRONT}/auth/discord/callback`.
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` / `GOOGLE_REDIRECT_URI` : identifiants OAuth Google et URL de redirection. Mettre vos vraies valeurs si vous testez l'auth Google , `http://localhost:{PORT_FRONT}/auth/google/callback`.

2. **Construire les images et démarrer les conteneurs** (depuis la racine du projet) :

```bash
docker compose build
docker compose up -d
```

Cela démarre :

- un conteneur `postgres` avec la base `fread_db` ;
- un conteneur `api` qui génère le client Prisma, applique les migrations puis lance l'API Express.

3. **Vérifier que l'API est en ligne** :

```bash
curl http://localhost:3001/status
```

Vous devez obtenir une réponse JSON du type :

```json
{ "status": "ok", "timestamp": "2023-10-11T00:00:00.000Z" }
```

4. **Arrêter les conteneurs** :

```bash
docker compose down
```

## Utilisation

## Définition du besoin utilisateur

Cette section décrit le besoin métier auquel l'application doit répondre, c'est-à-dire ce que Fread doit permettre à ses utilisateurs de faire au quotidien :

- Partager des messages courts (posts texte) pour exprimer des idées, opinions ou actualités.
- Interagir avec le contenu des autres via des likes, des réponses et le suivi d'autres comptes (follow) pour créer une dynamique de conversation.
- Gérer son identité numérique à travers un profil personnalisable (nom affiché, description, confidentialité du compte et photo de profil).
- Accéder à un fil d'actualité pertinent en fonction des comptes suivis et de la visibilité (public/privé) des contenus.
- Consulter les profils et les posts publics sans être connecté, afin de découvrir la plateforme avant de créer un compte.

Ces besoins fonctionnels guident la conception des fonctionnalités, des routes de l'API et de la structure de la base de données.

## Structure du projet

Notre projet devra :

- Permettre la publication de postes par les utilisateurs :
  - Texte
- Permettre de liker des postes
- Permettre aux utilisateurs de commenter les postes et de répondre aux commentaires
- Permettre aux utilisateurs de s'abonner à d'autres utilisateurs
- Permettre la création de profils utilisateurs avec des informations personnelles et une photo de profil
- Permettre la recherche de postes par mots-clés ou hashtags

L'utilisateur devra être connnecté pour:

- Publier, liker, commenter, répondre, s'abonner
- Voir son fil d'actualité personnalisé

L'utilisateur non connecté pourra:

- Voir les postes/commentaires publics
- Consulter les profils publics

## Manuel utilisateur

Le projet contient un manuel utilisateur permettant aux futurs utilisateurs de l'utiliser. Une collection Postman dédiée à l'API est également fournie dans `api/postman/Fread.postman_collection.json` pour faciliter les tests des différentes routes. Celle-ci recense les principales routes de l'API, ainsi que les exemples de payloads et de configuration.

### Base de l'API et variables

- URL de base : `http://localhost:3001` (variables Postman `host = localhost`, `port = 3001`).
- Format des corps de requête : JSON (`Content-Type: application/json`).
- Authentification : pour les routes protégées, un token JWT doit être envoyé via l'en-tête HTTP `Authorization` :

  ```text
  Authorization: Bearer <votre_jwt>
  ```

La collection Postman définit une variable `jwt` qui peut être utilisée pour pré-remplir cet en-tête, par exemple : `Bearer {{jwt}}`.

### Routes principales et payloads utiles

#### Authentification (Auth)

- `GET /auth/discord`
  - Authentification : non requise (démarre le flux OAuth Discord).
- `GET /auth/google`
  - Authentification : non requise (démarre le flux OAuth Google).

Ces routes lancent le flux d'authentification via un fournisseur externe (à utiliser depuis un navigateur ou via Postman pour tester la redirection).

#### Comptes (Account)

- `GET /account/:id`
  - Récupère les informations publiques d'un compte à partir de son identifiant.
  - Authentification : non requise.
- `GET /account/:id/posts`
  - Récupère les posts publics d'un compte.
  - Authentification : non requise.
- `PATCH /account`
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).
  - Corps JSON attendu :

    ```json
    {
      "displayName": "Nom à afficher",
      "description": "Description du profil",
      "isPrivate": false
    }
    ```

  - Exemple d'en-tête :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

- `DELETE /account/:id`
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).
  - Aucun champ spécifique attendu dans le corps (éventuellement `{}`).

  - Exemple d'en-tête :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

#### Suivi d'utilisateurs (Follow)

- `POST /follow/:id` — Suivre un compte
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).
- `DELETE /follow/:id` — Ne plus suivre un compte
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).

  - Aucun champ spécifique attendu dans le corps (éventuellement `{}`).

  - Exemple d'en-tête :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

#### Posts (Post)

- `POST /post` — Créer un post
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).

  ```json
  {
    "content": "Contenu de mon post",
    "isPrivate": false
  }
  ```

  - Exemple d'en-tête :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

- `GET /post/:id` — Obtenir un post
  - Authentification : optionnelle.
  - Sans en-tête `Authorization` : accès invité aux contenus publics.
  - Avec en-tête `Authorization` :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

- `PATCH /post/:id` — Modifier un post
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).

  ```json
  {
    "content": "Nouveau contenu",
    "isPrivate": false
  }
  ```

  - Exemple d'en-tête :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

- `DELETE /post/:id` — Supprimer un post
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).

  - Aucun champ spécifique attendu dans le corps (éventuellement `{}`).

  - Exemple d'en-tête :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

- `POST /post/:id/reply` — Répondre à un post
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).

  ```json
  {
    "content": "Ma réponse",
    "isPrivate": false
  }
  ```

  - Exemple d'en-tête :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

- `GET /post/:id/replies` — Récupérer les réponses à un post
  - Authentification : optionnelle.
  - Sans en-tête `Authorization` : accès invité aux réponses publiques.
  - Avec en-tête `Authorization` :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

#### Likes (Like)

- `POST /like/:id` — Liker un post
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).
- `DELETE /like/:id` — Retirer son like
  - Authentification : requise (token JWT dans l'en-tête `Authorization`).

  - Aucun champ spécifique attendu dans le corps (éventuellement `{}`).

  - Exemple d'en-tête :

    ```text
    Authorization: Bearer <votre_jwt>
    ```

## Manuel technique pour les développeurs

L'objectif de cette section est de permettre à un développeur de comprendre rapidement comment est organisée l'API, comment une requête est traitée et quelles commandes utiliser pour installer, lancer et faire évoluer le projet.

### Architecture du dépôt

- Backend API Express : situé dans le dossier `api/` (serveur HTTP, routes REST, logique métier).
- Base de données : PostgreSQL, pilotée avec Prisma (ORM) via les fichiers du dossier `api/prisma/`.
- Client Prisma généré : dans `api/generated/prisma/` (ne pas modifier manuellement).

#### Dossiers principaux de l'API (api/)

- `builders/`: contient les constructeurs afin d'associer les différentes parties de l'application (ex. route builder gère la construction des routes).
- `controllers/` : traite les requêtes HTTP et appelle les services (par domaine : compte, auth, posts, etc.).
- `services/` : contient la logique métier (création de compte, follow, likes, posts…), gère les requêtes de la base de données via le client Prisma.
- `routes/` : enregistre les routes Express et les associe aux contrôleurs. Les routes sont regroupées par domaine, 5 méthodes HTTP sont utilisées : GET, POST, PUT, DELETE, PATCH, si vous avez besoin d'une autre méthode, rajoutez-la dans `models/route.model.ts`.
- `models/` : définitions des types TypeScript utilisés dans l'application (ex. modèles de données, types de requêtes/réponses).
- `schemas/` : schémas de validation (Zod) pour valider les données d'entrée dans les requêtes.
- `middleware/` : middlewares (fonction qui s'exécute entre la réception de la requête et la réponse afin d'intercepter ou de modifier/refuser la requête avant qu'elle ne soit traitée) (ex: authentification JWT, validation, gestion d'erreurs).
- `utils/` : utilitaires génériques utilisés partout dans l'application (connexion DB, logger, helpers JWT, handler générique).
- `prisma/` : schéma Prisma (`schema.prisma`) et migrations SQL.
- `generated/prisma/` : client Prisma généré à partir du schéma.
- `tests/` : tests unitaires (ex. services) exécutés avec Jest.

### Fichier d'entrée de l'API : `api/index.ts`

Le fichier `index.ts` est le point d'entrée de l'API Express. Il :

- crée et configure l'application Express (JSON, CORS) ;
- expose une route de santé `GET /status` pour vérifier que l'API répond ;
- enregistre les différents routeurs : authentification, comptes, follows, posts, likes ;
- branche le middleware global de gestion des erreurs ;
- démarre le serveur HTTP sur le port défini dans la configuration (`env.PORT`) et effectue un `dbHealthCheck` au démarrage pour s'assurer que la base de données est accessible.

### Flux typique d'une requête

Exemple : création d'un nouveau post.

1. **Route** : une requête HTTP (par ex. `POST /posts`) arrive sur une route définie dans `routes/posts/post.route.ts`.
2. **Middleware** : avant d'atteindre le contrôleur, plusieurs middlewares peuvent être exécutés :
   - `auth` : vérifie la présence et la validité du JWT (l'utilisateur doit être connecté pour créer un post).
   - `validate` : contrôle que le corps de la requête respecte le schéma Zod défini dans `schemas/posts.ts`.
3. **Contrôleur** : le contrôleur correspondant dans `controllers/post.controller.ts` récupère les données de la requête et appelle la fonction du service adapté.
4. **Service** : la logique métier est implémentée dans `services/post.service.ts` (vérifications, appels à Prisma, etc.).
5. **Accès base de données** : le service utilise Prisma (via `utils/db.ts` et le client généré) pour lire/écrire dans la base PostgreSQL.
6. **Réponse** : le contrôleur renvoie au client une réponse HTTP structurée (données du nouveau post, message de succès, etc.).

Ce même schéma s'applique à la plupart des fonctionnalités (authentification, follow, like, etc.).

### Rôle des middlewares

Les middlewares sont des fonctions qui s'exécutent entre la réception de la requête et l'appel du contrôleur. Ils peuvent lire/modifier la requête, interrompre le traitement ou continuer vers l'étape suivante.

Principaux middlewares :

- **Authentification (`middleware/auth.ts`)** :
  - Lit le token JWT dans les en-têtes (par ex. `Authorization: Bearer <token>`).
  - Vérifie sa validité et, en cas de succès, ajoute les informations utilisateur à l'objet `req` avant d'appeler `next()`.
  - En cas d'échec, renvoie une réponse `401 Unauthorized`.
- **Authentification optionnelle (`middleware/optional-auth.ts`)** :
  - Tente de décoder un éventuel JWT présent dans l'en-tête `Authorization`, mais laisse passer la requête même si aucun token n'est fourni.
  - Utile pour les routes accessibles publiquement, mais personnalisables selon l'utilisateur connecté.
- **Validation (`middleware/validate.ts`)** :
  - Utilise les schémas définis dans `schemas/` pour vérifier que les données envoyées (body, params, query) sont conformes.
  - Si la validation échoue, renvoie une erreur 400 avec le détail des erreurs.
- **Gestion des erreurs (`middleware/error.ts`)** :
  - Centralise le traitement des erreurs (ex. `AppError`) et renvoie une réponse JSON standardisée.

### Commandes de base (API)

Toutes les commandes ci-dessous se lancent depuis le dossier `api/`.

#### Installation des dépendances

```bash
cd api
bun install
```

#### Lancer le serveur en développement

```bash
cd api
bun run index.ts
```

### Gestion de la base de données et de Prisma

Le projet utilise Prisma pour définir le schéma de la base, générer le client TypeScript et gérer les migrations.

Depuis le dossier `api/` :

- Générer le client Prisma (après modification du schéma sans migration) :

  ```bash
  bun run db:generate
  ```

- Créer et appliquer une nouvelle migration (en dev) + générer le client :

  ```bash
  bun run db:migrate
  ```

Les migrations et le schéma se trouvent dans `api/prisma/`. Le client généré est ensuite écrit dans `api/generated/prisma/` et utilisé par la couche d'accès aux données.

### Tests

Des tests unitaires existent dans `api/tests/` et s'exécutent avec Jest.

Depuis `api/` :

```bash
bun run test          # lance la suite de tests
bun run test:watch    # tests en mode watch
bun run test:coverage # rapport de couverture
```

---

## Architecture Frontend (front/)

Le frontend de Fread est une application React moderne utilisant TanStack Router pour la navigation, TanStack Query pour la gestion de l'état serveur, et Tailwind CSS pour le style. L'application est construite avec Vite et utilise TypeScript pour la sûreté de type.

### Technologies utilisées

- **Framework UI** : React 19 avec hooks et StrictMode
- **Routeur** : TanStack Router avec routage basé sur les fichiers (file-based routing)
- **Gestion d'état serveur** : TanStack Query (React Query) pour le cache et la synchronisation des données
- **Gestion de formulaires** : TanStack Form avec validation
- **Styling** : Tailwind CSS 4 avec composants shadcn/ui
- **HTTP Client** : Axios pour les requêtes vers l'API
- **Tests** : Vitest avec Testing Library
- **Qualité de code** : Biome (linting et formatting)
- **Build tool** : Vite

### Dossiers principaux du Frontend (front/src/)

- `routes/` : définit la structure de navigation de l'application avec le routage basé sur fichiers
  - `__root.tsx` : layout racine de l'application
  - `_authenticated.tsx` : layout pour les routes protégées nécessitant une authentification
  - `index.tsx`, `login.tsx` : pages publiques
  - `_authenticated/` : pages nécessitant une authentification (feed, profil, posts)
- `components/` : composants React réutilisables
  - `ui/` : composants UI de base (button, input, etc.) basés sur shadcn/ui
  - Composants métier : `PostCard`, `ProfileCard`, `FollowButton`, `LikeButton`, `CreatePostForm`
- `contexts/` : contextes React pour partager l'état global
  - `AuthContext.tsx` : gère l'état d'authentification et les informations utilisateur
- `hooks/` : hooks React personnalisés
  - `queries/` : hooks TanStack Query pour récupérer les données (GET)
  - `mutations/` : hooks TanStack Query pour modifier les données (POST, PATCH, DELETE)
  - `useAuth.ts` : hook pour accéder au contexte d'authentification
- `integrations/` : intégrations avec des bibliothèques tierces
  - `tanstack-query/` : configuration de TanStack Query (Provider, Devtools)
- `lib/` : utilitaires et configuration
  - `api-client.ts` : client Axios configuré pour l'API
  - `api-types.ts` : types TypeScript pour les réponses de l'API
  - `query-keys.ts` : clés de cache TanStack Query centralisées
  - `storage.ts` : utilitaires pour le localStorage (JWT)
  - `utils.ts` : fonctions utilitaires diverses
- `test/` : configuration des tests

### Fichier d'entrée du Frontend : `front/src/main.tsx`

Le fichier `main.tsx` est le point d'entrée de l'application React. Il :

- crée le routeur TanStack avec l'arbre de routes généré automatiquement (`routeTree.gen.ts`) ;
- configure le contexte TanStack Query pour la gestion des données serveur ;
- initialise les options du routeur (preload, scroll restoration, etc.) ;
- enveloppe l'application dans les Providers nécessaires (Query, Router) ;
- rend l'application dans le DOM via `ReactDOM.createRoot`.

### Flux typique d'une page

Exemple : affichage du profil d'un utilisateur.

1. **Navigation** : l'utilisateur clique sur un lien vers `/profile/:id` ou tape l'URL directement.

2. **Route** : TanStack Router charge le composant défini dans `routes/_authenticated/profile/$id/index.tsx`.

3. **Protection** : la route hérite du layout `_authenticated.tsx` qui vérifie l'authentification via `beforeLoad` :
   - Si non connecté, redirection vers `/login`
   - Si connecté, la route se charge normalement

4. **Chargement des données** : le composant utilise un hook de query personnalisé (ex. `useAccount(id)`) pour récupérer les données du profil depuis l'API :
   - Le hook encapsule `useQuery` de TanStack Query
   - Une requête HTTP GET est envoyée via le client Axios configuré dans `lib/api-client.ts`
   - Le token JWT est automatiquement ajouté aux en-têtes si l'utilisateur est authentifié

5. **Gestion du cache** : TanStack Query gère automatiquement :
   - Le cache des données
   - Le refetch en arrière-plan
   - Les états de chargement et d'erreur

6. **Rendu** : le composant affiche les données récupérées via des composants UI réutilisables (`ProfileCard`, etc.).

7. **Interactions** : les actions utilisateur (follow, like, create post) utilisent des hooks de mutation :
   - Les mutations appellent l'API via Axios
   - En cas de succès, le cache TanStack Query est invalidé pour refetch les données
   - Des toasts sont affichés pour informer l'utilisateur

### Routage basé sur fichiers (File-Based Routing)

TanStack Router génère automatiquement l'arbre de routes à partir de la structure des fichiers dans `src/routes/` :

- `index.tsx` → route `/`
- `login.tsx` → route `/login`
- `profile/$id.tsx` → route `/profile/:id` (paramètre dynamique)
- `_authenticated/feed.tsx` → route `/feed` (protégée par le layout `_authenticated`)
- `_authenticated/profile/$id/followers.tsx` → route `/profile/:id/followers` (imbriquée)

**Conventions de nommage** :

- `$id.tsx` : paramètre dynamique dans l'URL
- `_authenticated.tsx` : layout (préfixe `_`) qui enveloppe les routes enfants
- `index.tsx` : route par défaut du dossier parent

**Export pattern** :
Chaque fichier de route exporte une constante `Route` créée avec `createFileRoute()` :

```tsx
export const Route = createFileRoute("/profile/$id")({
  component: ProfilePage,
  // options: beforeLoad, loader, etc.
});
```

### Authentification Frontend

L'authentification est gérée via un système de contexte React et JWT :

1. **AuthContext** (`contexts/AuthContext.tsx`) :
   - Stocke l'état d'authentification (utilisateur connecté ou non)
   - Fournit des méthodes : `login()`, `logout()`, `updateUser()`
   - Lit le JWT depuis le localStorage au chargement de l'application
   - Décode le JWT pour extraire les informations utilisateur

2. **Hook useAuth** :
   - Permet d'accéder au contexte d'authentification depuis n'importe quel composant
   - Exemple : `const { user, isAuthenticated, logout } = useAuth();`

3. **Client API** (`lib/api-client.ts`) :
   - Instance Axios configurée avec un intercepteur de requêtes
   - Ajoute automatiquement l'en-tête `Authorization: Bearer <token>` si un JWT est présent
   - Gère les erreurs 401 (Unauthorized) pour rediriger vers la page de connexion

4. **Routes protégées** :
   - Le layout `_authenticated.tsx` utilise `beforeLoad` pour vérifier l'authentification
   - Redirige vers `/login` si l'utilisateur n'est pas connecté

5. **Callbacks OAuth** :
   - Routes dédiées pour les redirections OAuth : `/auth/discord/callback`, `/auth/google/callback`
   - Extraient le JWT de l'URL, le stockent dans le localStorage et redirigent vers le feed

### Gestion des données avec TanStack Query

TanStack Query (React Query) gère l'état serveur de manière déclarative :

**Queries (lecture)** :

- Hooks personnalisés dans `hooks/queries/` encapsulent `useQuery`
- Exemple : `useAccount(id)` récupère un profil utilisateur
- Clés de cache définies dans `lib/query-keys.ts` pour une gestion centralisée
- Configuration globale dans `integrations/tanstack-query/root-provider.tsx`

**Mutations (écriture)** :

- Hooks personnalisés dans `hooks/mutations/` encapsulent `useMutation`
- Exemple : `useCreatePost()` crée un nouveau post
- Après succès, invalidation automatique du cache pour refetch les données
- Gestion des états de chargement, succès, erreur

**Avantages** :

- Cache automatique avec stale-while-revalidate
- Refetch en arrière-plan pour garder les données fraîches
- États de chargement et d'erreur gérés automatiquement
- Optimistic updates possibles
- Dédoublonnage des requêtes

### Composants UI avec shadcn/ui

Le projet utilise shadcn/ui, une collection de composants React réutilisables basés sur Radix UI et Tailwind CSS :

- Composants de base dans `components/ui/` : `Button`, `Input`, `Label`, `Select`, `Slider`, `Switch`, `Textarea`
- Personnalisables via Tailwind et variants (class-variance-authority)
- Accessibles par défaut (Radix UI)
- Copiés directement dans le projet (pas de dépendance npm à shadcn)

**Ajout de nouveaux composants** :

```bash
npx shadcn@latest add <component-name>
```

### Commandes de base (Frontend)

Toutes les commandes ci-dessous se lancent depuis le dossier `front/`.

#### Installation des dépendances

```bash
cd front
bun install
```

#### Lancer le serveur de développement

```bash
cd front
bun run dev  # Démarre sur http://localhost:3000
```

Le serveur Vite démarre avec Hot Module Replacement (HMR) pour un rechargement instantané lors des modifications de code.

#### Build de production

```bash
cd front
bun run build  # Compile l'app optimisée dans dist/
```

Le build génère des fichiers statiques optimisés (minification, tree-shaking, code splitting) dans le dossier `dist/`.

#### Prévisualiser le build de production

```bash
cd front
bun run preview  # Sert le dossier dist/ localement
```

### Tests Frontend

Le frontend utilise Vitest (compatible Vite) avec Testing Library pour les tests unitaires et d'intégration.

Depuis `front/` :

```bash
bun run test          # Lance tous les tests
bun run test:watch    # Tests en mode watch (relance automatique)
bun run test:ui       # Interface UI pour les tests (navigateur)
bun run test:coverage # Génère un rapport de couverture
```

**Organisation des tests** :

- Tests unitaires à côté des fichiers : `Component.test.tsx`
- Utilitaires de test dans `src/test/`
- Configuration Vitest dans `vite.config.ts`

**Exemples de tests** :

- `FollowButton.test.tsx` : teste le comportement du bouton de suivi
- `LikeButton.test.tsx` : teste le bouton de like
- `AuthContext.test.tsx` : teste le contexte d'authentification

### Qualité de code

Le projet utilise Biome pour le linting et le formatting (alternative à ESLint + Prettier).

Depuis `front/` :

```bash
bun run lint          # Vérifie les erreurs de linting
bun run lint:fix      # Corrige automatiquement les erreurs
bun run format        # Affiche les erreurs de formatage
bun run check         # Lint + format (vérification complète)
bun run check:fix     # Corrige lint + format automatiquement
```

Configuration dans `biome.json`.

### Configuration de l'environnement (Frontend)

Le frontend utilise un fichier `.env.local` pour les variables d'environnement :

```bash
# URL de l'API backend
VITE_API_URL=http://localhost:3001
```

Les variables doivent être préfixées par `VITE_` pour être accessibles dans le code via `import.meta.env.VITE_API_URL`.

### Déploiement avec Docker

Le frontend peut être déployé en production via Docker (voir `front/Dockerfile`) :

1. Build multi-stage avec Bun pour construire l'app
2. Serveur Nginx pour servir les fichiers statiques
3. Configuration Nginx dans `front/nginx.conf`

La configuration Docker Compose (racine du projet) inclut le service frontend qui :

- Build l'application
- Sert les fichiers via Nginx sur le port 3000
- Configure les redirections pour le routage SPA

### Conventions de développement Frontend

**Structure des composants** :

- Composants partagés dans `components/`
- Composants spécifiques à une page dans le fichier de route lui-même
- Un composant par fichier
- Utiliser des composants fonctionnels avec hooks

**Gestion de l'état** :

- État serveur : TanStack Query (queries/mutations)
- État local : `useState`, `useReducer`
- État global partagé : Context API (`AuthContext`)
- Pas de Redux nécessaire pour ce projet

**Style** :

- Tailwind CSS pour le styling (classes utilitaires)
- `cn()` helper pour combiner les classes conditionnellement
- Pas de CSS modules ou styled-components
- Composants shadcn/ui comme base

**Types TypeScript** :

- Types pour les réponses API dans `lib/api-types.ts`
- Typage strict activé (`tsconfig.json`)
- Éviter `any`, préférer `unknown` si nécessaire
- Props des composants typées avec des interfaces

**Navigation** :

- Utiliser `<Link to="...">` de TanStack Router pour la navigation SPA
- Éviter `<a href="...">` qui recharge la page
- Paramètres d'URL typés via TanStack Router

### Intégration API-Frontend

Le frontend communique avec l'API backend via Axios :

1. **Client API configuré** (`lib/api-client.ts`) :
   - Base URL depuis `VITE_API_URL`
   - Intercepteur qui ajoute le JWT aux requêtes
   - Gestion centralisée des erreurs HTTP

2. **Types partagés** (`lib/api-types.ts`) :
   - Interfaces TypeScript pour les réponses de l'API
   - Synchronisation manuelle avec les types backend

3. **Hooks de requêtes** :
   - Encapsulent les appels API dans des hooks TanStack Query
   - Gèrent automatiquement le cache et les refetch
   - Exemple : `useAccount()`, `usePosts()`, `usePost()`

4. **Hooks de mutations** :
   - Encapsulent les actions de modification (POST, PATCH, DELETE)
   - Invalidation du cache après succès
   - Exemple : `useCreatePost()`, `useUpdateAccount()`, `useFollowAccount()`

Cette architecture découple la logique de récupération des données de l'UI, facilitant la maintenance et les tests.
