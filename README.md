# Fread (Better than Thread)

## Sommaire

- [Description du projet](#description-du-projet)
- [Description technique du projet](#description-technique-du-projet)
- [Instructions d'installation](#instructions-dinstallation)
- [Utilisation](#utilisation)
- [Définition du besoin utilisateur](#definition-du-besoin-utilisateur)
- [Structure du projet](#structure-du-projet)
- [Manuel technique pour les développeurs](#manuel-technique-pour-les-developpeurs)

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

## Utilisation

## Définition du besoin utilisateur

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
  - Tente de décoder un éventuel JWT, mais laisse passer la requête même si aucun token n'est fourni.
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

