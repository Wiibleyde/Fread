# Installation - Fread

Ce guide détaille toutes les procédures d'installation pour le projet Fread.

## Table des matières

- [Prérequis](#prérequis)
- [Configuration OAuth](#configuration-oauth)
- [Installation avec Docker (recommandé)](#installation-avec-docker-recommandé)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Vérification de l'installation](#vérification-de-linstallation)

---

## Prérequis

### Requis

- [Docker](https://www.docker.com/) + Docker Compose (recommandé)
- OU [Bun](https://bun.sh/) + [Node.js](https://nodejs.org/) v18+ + PostgreSQL 16
- Git

### Pour OAuth (optionnel mais recommandé)

- Compte Discord Developer (pour connexion Discord)
- Compte Google Cloud Console (pour connexion Google)

---

## Configuration OAuth

### Discord

1. Accédez au [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquez sur **"New Application"** et donnez un nom à votre application
3. Dans l'onglet **OAuth2**, ajoutez un redirect URI :
   ```
   http://localhost:3000/auth/discord/callback
   ```
4. Notez le **Client ID** et le **Client Secret** (vous en aurez besoin dans `.env`)

### Google

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API **People API** (dans "APIs & Services" > "Library")
4. Créez des identifiants OAuth 2.0 :
   - Allez dans "APIs & Services" > "Credentials"
   - Cliquez sur **"Create Credentials"** > **"OAuth client ID"**
   - Type : **Web application**
5. Configurez les URIs autorisées :
   - **URI de redirection autorisée** :
     ```
     http://localhost:3000/auth/google/callback
     ```
   - **Origines JavaScript autorisées** :
     ```
     http://localhost:3001
     ```
6. Notez le **Client ID** et le **Client Secret**

---

## Installation avec Docker (recommandé)

Cette méthode démarre automatiquement PostgreSQL, l'API backend et le frontend React.

```bash
# Cloner le dépôt
git clone https://github.com/Wiibleyde/Fread
cd Fread

# Construire les images Docker
docker compose build

# Démarrer tous les services (postgres + api + frontend)
docker compose up -d
```

**Services démarrés** :
- **PostgreSQL** : `localhost:5432`
- **API Backend** : `http://localhost:3001`
- **Frontend React** : `http://localhost:3000`

**Commandes Docker utiles** :
```bash
docker compose down           # Arrêter tous les services
docker compose logs -f        # Voir les logs en temps réel
docker compose logs api       # Logs du backend uniquement
docker compose logs front     # Logs du frontend uniquement
docker compose restart api    # Redémarrer l'API
```

---

## Installation locale

Cette méthode vous permet de développer sans Docker en exécutant chaque service séparément.

### 1. Base de données PostgreSQL

**Option A : Utiliser Docker uniquement pour PostgreSQL**

```bash
docker run -d \
  --name fread-postgres \
  -e POSTGRES_USER=root \
  -e POSTGRES_PASSWORD=RootPassword \
  -e POSTGRES_DB=fread_db \
  -p 5432:5432 \
  postgres:16
```

**Option B : Installation native de PostgreSQL**

Suivez les instructions d'installation pour votre OS sur [postgresql.org](https://www.postgresql.org/download/), puis créez la base de données :

```sql
CREATE DATABASE fread_db;
CREATE USER root WITH PASSWORD 'RootPassword';
GRANT ALL PRIVILEGES ON DATABASE fread_db TO root;
```

### 2. Backend (API)

```bash
cd api

# Installation des dépendances
bun install

# Configuration
cp .env.example .env
# Éditer .env avec vos variables (voir section "Variables d'environnement" ci-dessous)

# Générer le client Prisma
bun run db:generate

# Appliquer les migrations de base de données
bun run db:migrate

# Démarrer le serveur de développement
bun run index.ts
```

**L'API sera accessible sur** `http://localhost:3001`

### 3. Frontend

```bash
cd front

# Installation des dépendances
bun install

# Configuration
cp .env.example .env.local
# Éditer .env.local (ajouter l'URL de l'API si différente de http://localhost:3001)

# Démarrer le serveur de développement
bun run dev
```

**Le frontend sera accessible sur** `http://localhost:3000`

---

## Variables d'environnement

### Backend (`api/.env`)

**Configuration complète (avec OAuth)** :

```env
# Base de données
DATABASE_URL=postgresql://root:RootPassword@localhost:5432/fread_db

# Serveur
PORT=3001

# JWT (minimum 32 caractères requis par Zod)
JWT_SECRET=your-super-secret-key-minimum-32-characters-required

# OAuth Discord
AUTH_DISCORD_ID=your-discord-client-id
AUTH_DISCORD_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback

# OAuth Google
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

**Notes** :
- `JWT_SECRET` : Doit contenir au moins 32 caractères (validé par Zod dans `api/env.ts`)
- `DATABASE_URL` : Si vous utilisez Docker Compose, remplacez `localhost` par `postgres` (nom du service Docker)

---

## Vérification de l'installation

### 1. Vérifier l'API

```bash
# Tester la route de santé
curl http://localhost:3001/status

# Réponse attendue
{"status":"ok","timestamp":"2024-06-01T12:00:00.000Z"}
```

### 2. Vérifier le frontend

Ouvrez votre navigateur et accédez à :
```
http://localhost:3000
```

Vous devriez voir la page d'accueil de Fread.

### 3. Tester OAuth (optionnel)

1. Sur le frontend, cliquez sur **"Se connecter avec Discord"** ou **"Se connecter avec Google"**
2. Autorisez l'application
3. Vous devriez être redirigé vers votre profil utilisateur

### 4. Tester la base de données

```bash
cd api

# Vérifier l'état des migrations
bun run db:migrate status

# Ouvrir Prisma Studio (interface visuelle de la DB)
bunx prisma studio
```

Prisma Studio s'ouvrira sur `http://localhost:5555` et vous permettra de visualiser vos tables.

---

## Prochaines étapes

Une fois l'installation terminée :

1. **Consultez le [Manuel Utilisateur](MANUEL_UTILISATEUR.md)** pour apprendre à utiliser l'application
2. **Lisez le [Manuel Développeur](MANUEL_DEVELOPPEUR.md)** pour comprendre l'architecture et contribuer
3. **Explorez [ARCHITECTURE.md](ARCHITECTURE.md)** pour une vue d'ensemble technique approfondie
4. **Testez l'API** avec la [Collection Postman](api/postman/Fread.postman_collection.json)

---

**Installation réussie ! Bon développement sur Fread ! 🚀**
