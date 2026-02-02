# ✅ Checklist de Conformité - Fread

Ce document vérifie la conformité du projet Fread avec les exigences du cours.

## Statut Global : ✅ CONFORME

---

## 1. ✅ Langage autorisé

**Exigence** : Projet réalisé dans un des langages autorisés (Java, C#, TypeScript, Python, Golang)

**Statut** : ✅ CONFORME

**Détails** :
- **Langage principal** : TypeScript
- **Backend** : TypeScript avec Node.js/Bun
- **Frontend** : TypeScript avec React 19
- **Documentation** : Clairement indiqué dans README.md et ARCHITECTURE.md

**Localisation** :
- [README.md](README.md) - Section "Stack technique"
- [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Vue d'ensemble"

---

## 2. ✅ Diagramme C4

**Exigence** : Le projet est modélisé grâce à un diagramme C4

**Statut** : ✅ CONFORME

**Détails** :
Tous les niveaux du modèle C4 sont présents :
- **C1 - Contexte** : `diagrammes/Fread - Diagramme C1.png`
- **C2 - Conteneurs** : `diagrammes/Fread - Diagramme C2.png`
- **C3 - Composants** : `diagrammes/Fread - Diagramme C3.png`
- **C4 - Code** : `diagrammes/Fread - Diagramme C4.png`

**Référence** :
- [README.md](README.md) - Table de documentation
- Dossier [diagrammes/](diagrammes/)

---

## 3. ✅ Styles architecturaux

**Exigence** : Le projet est conçu avec un des styles architecturaux vus en cours

**Statut** : ✅ CONFORME (2 styles appliqués)

**Détails** :

### Style 1 : Architecture en couches (Layered Architecture)

Séparation stricte en 3 couches :
- **Couche Présentation** : Routes et Controllers (HTTP)
- **Couche Logique Métier** : Services (business logic)
- **Couche Accès aux Données** : Prisma (ORM)

**Documentation** :
- [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Styles Architecturaux > Architecture en couches"
- Exemples de code complets fournis

### Style 2 : Clean Architecture

Principe d'inversion de dépendances :
- Les couches internes (services) ne dépendent pas des couches externes (frameworks)
- Logique métier indépendante d'Express et Prisma

**Documentation** :
- [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Styles Architecturaux > Clean Architecture"
- [MANUEL_DEVELOPPEUR.md](MANUEL_DEVELOPPEUR.md) - Section "Styles architecturaux appliqués"

---

## 4. ✅ Domaine métier clairement identifié

**Exigence** : Le domaine métier est clairement identifié (bounded contexts, value objects, entités, services, aggregates)

**Statut** : ✅ CONFORME

**Détails** :

### Bounded Contexts (4 identifiés)
1. **Context Authentification & Identité**
2. **Context Compte Utilisateur (Account)**
3. **Context Publication (Post)**
4. **Context Interactions Sociales**

### Entités (4 principales)
- `Account` (Compte utilisateur)
- `Post` (Publication)
- `Follow` (Relation de suivi)
- `Like` (Like sur un post)

### Value Objects
- `JWTPayload`
- `CreateAccountData`
- `PostContent`

### Aggregates (2 principaux)
- **Account Aggregate** (racine : Account)
- **Post Aggregate** (racine : Post)

### Services métier (5 services)
- `AccountService`
- `PostService`
- `FollowService`
- `LikeService`
- `AuthService`
- `OAuthService`

**Documentation complète** :
- [DOMAINE_METIER.md](DOMAINE_METIER.md) - Document dédié à la modélisation DDD
- Diagramme DDD : `diagrammes/Fread - DDD.png`

---

## 5. ✅ Design Patterns

**Exigence** : Le projet utilise à minima 1 design pattern de création, 1 structurel, 1 comportemental

**Statut** : ✅ CONFORME (4 patterns implémentés)

**Détails** :

### Pattern de Création (2 patterns)

#### 1. Singleton ✅
**Utilisation** : Gestion de la connexion base de données Prisma
**Fichier** : `api/prisma.ts`
**Documentation** : [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Design Patterns > Singleton"

#### 2. Factory ✅
**Utilisation** : Création des services comme factory functions
**Fichiers** : `api/services/*.service.ts`
**Documentation** : [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Design Patterns > Factory"

### Pattern Structurel (1 pattern)

#### 3. Builder ✅
**Utilisation** : Construction déclarative des routes Express
**Fichiers** : 
- `api/builder/routeRegister.ts`
- `api/models/route.model.ts`
**Documentation** : [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Design Patterns > Builder"

### Pattern Comportemental (1 pattern)

#### 4. Strategy ✅
**Utilisation** : Gestion des différentes stratégies d'authentification OAuth (Discord, Google)
**Fichiers** : 
- `api/services/oauth.service.ts`
- `api/controllers/auth.controller.ts`
**Documentation** : [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Design Patterns > Strategy"

**Résumé** :
- ✅ Création : Singleton, Factory
- ✅ Structurel : Builder
- ✅ Comportemental : Strategy

---

## 6. ✅ Manuel technique (développeurs)

**Exigence** : Le projet contient un manuel technique descriptif permettant de comprendre et maintenir le projet

**Statut** : ✅ CONFORME

**Détails** :

### Documents techniques disponibles

#### Manuel Développeur
**Fichier** : [MANUEL_DEVELOPPEUR.md](MANUEL_DEVELOPPEUR.md)

**Contenu** :
- Architecture globale
- Styles architecturaux appliqués
- Design patterns utilisés
- Structure du backend (API Express)
- Structure du frontend (React)
- Base de données et Prisma
- Tests (Jest, Vitest)
- Développement local
- Conventions de contribution

#### Architecture détaillée
**Fichier** : [ARCHITECTURE.md](ARCHITECTURE.md)

**Contenu** :
- Vue d'ensemble complète
- Styles architecturaux détaillés
- Design patterns avec exemples de code réels
- Architecture backend complète
- Architecture frontend complète
- Architecture base de données
- Flux de données
- Sécurité et authentification
- Performance et optimisation

#### Domaine métier
**Fichier** : [DOMAINE_METIER.md](DOMAINE_METIER.md)

**Contenu** :
- Bounded contexts
- Entités et value objects
- Aggregates
- Services métier
- Règles métier

---

## 7. ✅ Description technique

**Exigence** : Description technique du projet (langage, frameworks/librairies, dépendances externes)

**Statut** : ✅ CONFORME

**Détails** :

### Langage
- **TypeScript** pour backend et frontend

### Frameworks principaux

**Backend** :
- **Express.js** : Framework HTTP
- **Prisma** : ORM pour PostgreSQL
- **Zod** : Validation de schémas
- **Jest** : Tests unitaires

**Frontend** :
- **React 19** : Framework UI
- **TanStack Router** : Routage file-based
- **TanStack Query** : Gestion d'état serveur
- **Vite** : Build tool
- **Tailwind CSS 4** : Styling
- **shadcn/ui** : Composants UI

### Dépendances externes
- **PostgreSQL 16** : Base de données
- **Docker & Docker Compose** : Conteneurisation
- **Nginx** : Serveur web (production)
- **Discord OAuth API** : Authentification Discord
- **Google OAuth API** : Authentification Google

### Runtime
- **Node.js / Bun** : Runtime JavaScript/TypeScript

**Documentation** :
- [README.md](README.md) - Section "Stack technique"
- [ARCHITECTURE.md](ARCHITECTURE.md) - Section "Stack technique complète"
- [MANUEL_DEVELOPPEUR.md](MANUEL_DEVELOPPEUR.md) - Section "Stack technique"

---

## 8. ✅ Manuel utilisateur

**Exigence** : Le projet contient un manuel utilisateur permettant aux futurs utilisateurs de l'utiliser

**Statut** : ✅ CONFORME

**Détails** :

**Fichier** : [MANUEL_UTILISATEUR.md](MANUEL_UTILISATEUR.md)

**Contenu complet** :
- Introduction à Fread
- Premiers pas (accès à l'application)
- Créer un compte (OAuth Discord/Google)
- Se connecter et se déconnecter
- Gérer son profil (modification, photo de profil, confidentialité)
- Publier un post
- Interagir avec les posts (likes, réponses)
- Suivre d'autres utilisateurs (follow/unfollow)
- Navigation dans l'application
- Utilisation de l'API avec Postman

**Public cible** : Utilisateurs finaux, testeurs

---

## 9. ✅ Description fonctionnelle

**Exigence** : Description fonctionnelle du projet (besoin métier)

**Statut** : ✅ CONFORME

**Détails** :

### Description du besoin métier

**Fichier** : [README.md](README.md) - Section "Besoins utilisateurs"

**Besoins fonctionnels identifiés** :

1. **Partage de contenu** : Publier des messages courts (posts texte) pour exprimer des idées, opinions ou actualités

2. **Interactions sociales** : Interagir avec le contenu via likes, réponses et suivi d'autres comptes pour créer une dynamique de conversation

3. **Gestion d'identité** : Gérer son identité numérique à travers un profil personnalisable (nom, description, confidentialité, photo)

4. **Fil d'actualité** : Accéder à un fil d'actualité pertinent en fonction des comptes suivis et de la visibilité des contenus

5. **Découverte** : Consulter les profils et posts publics sans être connecté pour découvrir la plateforme

**Impact sur la conception** :
Ces besoins fonctionnels guident :
- La conception des fonctionnalités
- Les routes de l'API
- La structure de la base de données
- L'architecture du domaine métier

**Localisation** :
- [README.md](README.md) - Sections "Description du projet" et "Besoins utilisateurs"
- [DOMAINE_METIER.md](DOMAINE_METIER.md) - Section "Vue d'ensemble du domaine"
- [MANUEL_UTILISATEUR.md](MANUEL_UTILISATEUR.md) - Section "Introduction"

---

## Résumé de la conformité

| Critère | Statut | Documentation |
|---------|--------|---------------|
| 1. Langage autorisé (TypeScript) | ✅ | README.md, ARCHITECTURE.md |
| 2. Diagramme C4 | ✅ | diagrammes/ (C1, C2, C3, C4) |
| 3. Styles architecturaux | ✅ | ARCHITECTURE.md (Layered + Clean) |
| 4. Domaine métier DDD | ✅ | DOMAINE_METIER.md + diagramme DDD |
| 5. Design patterns | ✅ | ARCHITECTURE.md (4 patterns) |
| 6. Manuel technique | ✅ | MANUEL_DEVELOPPEUR.md, ARCHITECTURE.md |
| 7. Description technique | ✅ | README.md, ARCHITECTURE.md |
| 8. Manuel utilisateur | ✅ | MANUEL_UTILISATEUR.md |
| 9. Description fonctionnelle | ✅ | README.md, DOMAINE_METIER.md |

## Conclusion

**Le projet Fread est ENTIÈREMENT CONFORME à tous les critères d'évaluation.**

Tous les éléments requis sont présents, documentés et implémentés dans le code source.

---

*Document généré le 2 février 2026*
