# Fread (Better than Thread)

## 📚 Documentation du projet

| Document | Description | Public cible |
|----------|-------------|--------------|
| **[README.md](README.md)** | Vue d'ensemble du projet, démarrage rapide | Tous |
| **[INSTALLATION.md](INSTALLATION.md)** | Guide d'installation complet : Docker, local, OAuth, dépannage | Tous |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architecture complète : styles architecturaux, design patterns, flux de données | Architectes, développeurs |
| **[MANUEL_UTILISATEUR.md](MANUEL_UTILISATEUR.md)** | Guide complet d'utilisation de l'application et de l'API | Utilisateurs finaux, testeurs |
| **[MANUEL_DEVELOPPEUR.md](MANUEL_DEVELOPPEUR.md)** | Documentation technique détaillée, conventions de code, contribution | Développeurs, contributeurs |
| **[API Postman](api/postman/Fread.postman_collection.json)** | Collection Postman pour tester les routes de l'API | Développeurs, testeurs API |

## Sommaire

- [Description du projet](#description-du-projet)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Aperçu rapide de l'API](#aperçu-rapide-de-lapi)
- [Commandes rapides](#commandes-rapides)
- [Contribution](#contribution)
- [Ressources](#ressources)

---

## Description du projet

Fread est une application de réseau social qui permet aux utilisateurs de partager des postes, d'interagir avec le contenu des autres utilisateurs, et de construire une communauté en ligne. Inspirée par des plateformes populaires (Threads), Fread vise à offrir une expérience utilisateur fluide et engageante, en mettant l'accent sur la simplicité et l'accessibilité.

### Fonctionnalités principales

**Pour tous les utilisateurs** :
- Consulter les profils et posts publics
- Parcourir le contenu sans authentification

**Pour les utilisateurs connectés** :
- Publier des posts (texte)
- Liker et commenter les posts
- S'abonner à d'autres utilisateurs
- Créer et personnaliser son profil utilisateur
- Gérer la confidentialité de son compte et de ses posts

---

## Stack technique

### Backend
- **Runtime** : Node.js / Bun (développement)
- **Framework** : Express.js
- **ORM** : Prisma (PostgreSQL)
- **Authentification** : JWT + OAuth (Discord, Google)
- **Validation** : Zod
- **Tests** : Jest

### Frontend
- **Framework** : React 19
- **Routeur** : TanStack Router (file-based routing)
- **État serveur** : TanStack Query
- **Styling** : Tailwind CSS 4 + shadcn/ui
- **Tests** : Vitest
- **Build** : Vite

### Infrastructure
- **Base de données** : PostgreSQL 16
- **Conteneurisation** : Docker + Docker Compose

📖 **Pour l'architecture détaillée**, consultez [ARCHITECTURE.md](ARCHITECTURE.md)

---

## Installation

### Démarrage rapide avec Docker

```bash
# Cloner le dépôt
git clone https://github.com/Wiibleyde/Fread
cd Fread

# Démarrer tous les services (postgres + api + frontend)
docker compose build
docker compose up -d
```

**L'API est accessible sur** `http://localhost:3001`  
**Le frontend est accessible sur** `http://localhost:3000`

📖 **Pour l'installation complète** (locale, OAuth, dépannage), consultez [INSTALLATION.md](INSTALLATION.md)

---

## Aperçu rapide de l'API

Le projet contient une API REST complète pour gérer les utilisateurs, posts, likes et follows.

### Routes principales

**Authentification**
- `GET /auth/discord` - Connexion Discord
- `GET /auth/google` - Connexion Google

**Comptes**
- `GET /account/:id` - Consulter un profil
- `PATCH /account` - Modifier son profil (🔒 authentification requise)
- `DELETE /account/:id` - Supprimer son compte (🔒)

**Posts**
- `POST /post` - Créer un post (🔒)
- `GET /post/:id` - Consulter un post
- `PATCH /post/:id` - Modifier un post (🔒)
- `DELETE /post/:id` - Supprimer un post (🔒)
- `POST /post/:id/reply` - Répondre à un post (🔒)

**Interactions**
- `POST /follow/:id` - Suivre un utilisateur (🔒)
- `DELETE /follow/:id` - Se désabonner (🔒)
- `POST /like/:id` - Liker un post (🔒)
- `DELETE /like/:id` - Retirer son like (🔒)

**Format** : JSON | **Auth** : Bearer Token dans header `Authorization`

📖 Pour les payloads détaillés, consultez le [Manuel Utilisateur](MANUEL_UTILISATEUR.md) et la [Collection Postman](api/postman/Fread.postman_collection.json).

---

## Commandes rapides

### Backend (API)

```bash
cd api
bun install              # Installation
bun run index.ts         # Démarrage dev
bun test                 # Tests
bun run db:migrate       # Migrations Prisma
```

### Frontend

```bash
cd front
bun install              # Installation
bun run dev              # Démarrage dev (http://localhost:3000)
bun run build            # Build production
bun run check:fix        # Lint + format
bun test                 # Tests
```

### Docker (recommandé)

```bash
docker compose build      # Construire les images
docker compose up -d     # Démarrer tout
docker compose down      # Arrêter
docker compose logs -f   # Logs
```

---

## Contribution

Pour contribuer au projet :

1. Consultez le [Manuel Développeur](MANUEL_DEVELOPPEUR.md) pour comprendre l'architecture
2. Créez une branche depuis `main`
3. Faites vos modifications en respectant les conventions
4. Testez localement (backend + frontend + linting)
5. Créez une Pull Request

**Checklist avant PR** :
- [ ] Tests passent (`bun test`)
- [ ] Pas d'erreurs de linting (`bun run check`)
- [ ] Types TypeScript corrects
- [ ] Documentation mise à jour si nécessaire

---

## Ressources

- [Architecture](ARCHITECTURE.md) - Architecture complète du projet
- [Manuel Utilisateur](MANUEL_UTILISATEUR.md) - Guide d'utilisation complet
- [Manuel Développeur](MANUEL_DEVELOPPEUR.md) - Documentation technique
- [Collection Postman](api/postman/Fread.postman_collection.json) - Tests API
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TanStack Router](https://tanstack.com/router/latest)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Fread - Une plateforme sociale moderne et élégante 🚀**
