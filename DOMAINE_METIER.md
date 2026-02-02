# Domaine Métier - Fread (DDD)

Ce document décrit le domaine métier de Fread selon les principes du Domain-Driven Design (DDD).

## Table des matières

- [Vue d'ensemble du domaine](#vue-densemble-du-domaine)
- [Bounded Contexts](#bounded-contexts)
- [Entités (Entities)](#entités-entities)
- [Value Objects](#value-objects)
- [Aggregates](#aggregates)
- [Services métier](#services-métier)
- [Diagramme DDD](#diagramme-ddd)

---

## Vue d'ensemble du domaine

Fread est une plateforme de réseau social qui permet aux utilisateurs de partager du contenu, d'interagir et de construire des relations sociales. Le domaine métier s'articule autour de trois concepts principaux :

1. **Gestion des comptes utilisateurs** (identité, profils, authentification)
2. **Publication et interaction avec du contenu** (posts, likes, réponses)
3. **Relations sociales** (suivis entre utilisateurs)

---

## Bounded Contexts

Fread est structuré en 4 bounded contexts distincts, chacun ayant sa propre logique métier :

### 1. **Context Authentification & Identité**

**Responsabilité** : Gérer l'identité des utilisateurs et leur authentification

**Concepts métier** :
- Authentification via OAuth (Discord, Google)
- Génération et validation de JWT
- Gestion de session utilisateur

**Fichiers associés** :
- `api/services/auth.service.ts`
- `api/services/oauth.service.ts`
- `api/utils/jwt.ts`
- `api/controllers/auth.controller.ts`

**Règles métier** :
- Un utilisateur doit compléter son profil après la première connexion OAuth
- Le JWT expire après 7 jours
- Le `JWT_SECRET` doit contenir au moins 32 caractères

### 2. **Context Compte Utilisateur (Account)**

**Responsabilité** : Gérer les profils utilisateurs et leurs données personnelles

**Concepts métier** :
- Profil utilisateur (username, displayName, description)
- Confidentialité du compte (public/privé)
- Photo de profil
- Statistiques (nombre de posts, followers, following)

**Fichiers associés** :
- `api/services/account.service.ts`
- `api/controllers/account.controller.ts`
- `api/routes/account/`
- Modèle Prisma : `Account`

**Règles métier** :
- Un `username` doit être unique dans le système
- Un compte peut être public ou privé
- La suppression d'un compte supprime tous ses posts, likes et follows (cascade)

### 3. **Context Publication (Post)**

**Responsabilité** : Gérer la création, modification et consultation de contenu

**Concepts métier** :
- Publication de posts (texte uniquement)
- Réponses à des posts (threads)
- Confidentialité des posts (public/privé)
- Hiérarchie parent-enfant pour les réponses

**Fichiers associés** :
- `api/services/post.service.ts`
- `api/controllers/post.controller.ts`
- `api/routes/posts/`
- Modèle Prisma : `Post`

**Règles métier** :
- Un post doit avoir un auteur (`Account`)
- Un post peut avoir un parent (pour les réponses)
- Un post privé n'est visible que par l'auteur et ses followers
- La suppression d'un post supprime toutes ses réponses (cascade)
- Le contenu d'un post est limité à 500 caractères (validation Zod)

### 4. **Context Interactions Sociales**

**Responsabilité** : Gérer les relations et interactions entre utilisateurs

**Concepts métier** :
- Suivi entre utilisateurs (Follow)
- Likes sur les posts
- Fil d'actualité personnalisé

**Fichiers associés** :
- `api/services/follow.service.ts`
- `api/services/like.service.ts`
- `api/controllers/follow.controller.ts`
- `api/controllers/like.controller.ts`
- Modèles Prisma : `Follow`, `Like`

**Règles métier** :
- Un utilisateur ne peut pas se suivre lui-même
- Un utilisateur ne peut suivre un autre utilisateur qu'une seule fois (contrainte unique)
- Un utilisateur ne peut liker un post qu'une seule fois (contrainte unique)
- Un like ou un follow peut être retiré (unfollow, unlike)

---

## Entités (Entities)

Les entités sont des objets avec une identité unique qui persiste dans le temps.

### Account (Compte Utilisateur)

**Identité** : `id` (CUID)

**Attributs** :
- `username` : Identifiant unique de l'utilisateur
- `displayName` : Nom affiché publiquement
- `description` : Biographie de l'utilisateur
- `private` : Booléen indiquant si le compte est privé
- `profilePictureId` : Référence à une image de profil
- `discordId`, `googleId`, `appleId` : Identifiants OAuth
- `profileCompleted` : Indique si le profil a été complété après OAuth
- `createdAt`, `updatedAt` : Horodatages

**Relations** :
- Publie des `Post[]`
- A des `Like[]`
- Suit d'autres comptes (`following`)
- Est suivi par d'autres (`followers`)

**Invariants** :
- `username` doit être unique
- Les IDs OAuth sont uniques par provider

### Post (Publication)

**Identité** : `id` (CUID)

**Attributs** :
- `content` : Contenu textuel du post (max 500 caractères)
- `private` : Booléen indiquant si le post est privé
- `authorId` : Référence à l'auteur (`Account`)
- `parentId` : Référence au post parent (pour les réponses)
- `createdAt`, `updatedAt` : Horodatages

**Relations** :
- Appartient à un `Account` (author)
- Peut avoir un parent `Post` (pour les réponses)
- Peut avoir des `replies` (Post[])
- Peut avoir des `Like[]`

**Invariants** :
- Doit avoir un auteur
- Le contenu ne peut pas être vide
- Si privé, visible uniquement par l'auteur et ses followers

### Follow (Relation de suivi)

**Identité** : `id` (CUID)

**Attributs** :
- `followerId` : ID de l'utilisateur qui suit
- `followedId` : ID de l'utilisateur suivi
- `createdAt` : Date de création

**Invariants** :
- `followerId` ≠ `followedId` (on ne peut pas se suivre soi-même)
- La paire `(followerId, followedId)` est unique

### Like (Like sur un post)

**Identité** : `id` (CUID)

**Attributs** :
- `accountId` : ID de l'utilisateur qui like
- `postId` : ID du post liké
- `createdAt` : Date de création

**Invariants** :
- La paire `(accountId, postId)` est unique (un seul like par utilisateur par post)

---

## Value Objects

Les value objects sont des objets sans identité propre, définis uniquement par leurs attributs.

### JWTPayload

**Attributs** :
- `id` : ID de l'utilisateur
- `iat` : Date d'émission (issued at)
- `exp` : Date d'expiration

**Fichier** : `api/models/jwt.model.ts`

**Invariants** :
- Le token expire après 7 jours
- Doit contenir un ID valide

### CreateAccountData

**Attributs** :
- `username` : String
- `displayName` : String
- `description` : String | undefined
- `private` : Boolean
- `profilePictureId` : String | undefined
- OAuth IDs (optionnels)

**Fichier** : `api/models/account.model.ts`

**Validation** : Via schémas Zod dans `api/schemas/account.ts`

### PostContent

Bien que non explicitement défini comme classe, le contenu d'un post est un value object :
- Type : String
- Contraintes : 1-500 caractères (validation Zod)
- Immuable après création (sauf modification explicite)

---

## Aggregates

Les aggregates sont des clusters d'entités et value objects traités comme une unité cohérente.

### Account Aggregate

**Racine** : `Account`

**Entités incluses** :
- `Account` (racine)
- `Post[]` créés par ce compte
- `Like[]` créés par ce compte
- `Follow[]` (following et followers)

**Règles de cohérence** :
- La suppression d'un compte supprime tous ses posts, likes et follows
- Les statistiques (postsCount, followersCount) sont calculées dynamiquement

**Frontières transactionnelles** :
- Modification du profil : transaction atomique
- Suppression du compte : cascade sur toutes les entités liées

### Post Aggregate

**Racine** : `Post`

**Entités incluses** :
- `Post` (racine)
- `Post[]` réponses (enfants)
- `Like[]` sur ce post

**Règles de cohérence** :
- La suppression d'un post supprime toutes ses réponses
- Le comptage des likes est cohérent avec la table `Like`

**Frontières transactionnelles** :
- Création d'un post : transaction unique
- Suppression : cascade sur les réponses et likes

---

## Services métier

Les services métier contiennent la logique qui ne s'inscrit pas naturellement dans une entité ou value object.

### AccountService

**Fichier** : `api/services/account.service.ts`

**Responsabilités** :
- Création de compte
- Récupération de compte (par ID, username, OAuth IDs)
- Modification de profil
- Suppression de compte
- Calcul de statistiques

**Méthodes principales** :
```typescript
createAccountDB(data: CreateAccountData): Promise<Account>
getAccountByIdDB(id: string): Promise<Account | null>
getAccountByUsernameDB(username: string): Promise<Account | null>
editAccountDb(id: string, data: AccountEditBody): Promise<Account>
deleteAccount(id: string): Promise<void>
```

### PostService

**Fichier** : `api/services/post.service.ts`

**Responsabilités** :
- Création de posts
- Récupération de posts (avec filtrage public/privé)
- Modification de posts
- Suppression de posts
- Gestion des réponses
- Calcul de statistiques (likes, réponses)

**Méthodes principales** :
```typescript
createPostDB(data: CreatePostData): Promise<Post>
getPostByIdDB(id: string, viewerId?: string): Promise<Post | null>
getPostsByAccountId(accountId: string, viewerId?: string): Promise<Post[]>
updatePostDB(id: string, data: Partial<Post>): Promise<Post>
deletePostDB(id: string): Promise<void>
getPostLikesCount(postId: string): Promise<number>
getPostRepliesCount(postId: string): Promise<number>
```

### FollowService

**Fichier** : `api/services/follow.service.ts`

**Responsabilités** :
- Création de relations de suivi
- Suppression de relations
- Vérification de relations
- Récupération des followers/following
- Calcul de statistiques

**Méthodes principales** :
```typescript
followAccountDB(followerId: string, followedId: string): Promise<Follow>
unfollowAccountDB(followerId: string, followedId: string): Promise<void>
isFollowing(followerId: string, followedId: string): Promise<boolean>
getFollowersByAccountId(accountId: string): Promise<Account[]>
getFollowingByAccountId(accountId: string): Promise<Account[]>
getFollowersCount(accountId: string): Promise<number>
getFollowingCount(accountId: string): Promise<number>
```

### LikeService

**Fichier** : `api/services/like.service.ts`

**Responsabilités** :
- Création de likes
- Suppression de likes
- Vérification de likes

**Méthodes principales** :
```typescript
likePostDB(accountId: string, postId: string): Promise<Like>
unlikePostDB(accountId: string, postId: string): Promise<void>
isPostLikedByAccountDB(postId: string, accountId: string): Promise<boolean>
```

### AuthService

**Fichier** : `api/services/auth.service.ts`

**Responsabilités** :
- Authentification utilisateur
- Validation de token
- Récupération de compte authentifié

**Méthodes principales** :
```typescript
authenticateUser(id: string): Promise<Account | null>
```

### OAuthService

**Fichier** : `api/services/oauth.service.ts`

**Responsabilités** :
- Échange de code OAuth contre access token
- Récupération des données utilisateur depuis Discord/Google
- Création ou mise à jour du compte

---

## Diagramme DDD

Le diagramme DDD complet est disponible dans le fichier :
```
diagrammes/Fread - DDD.png
```

Ce diagramme illustre :
- Les 4 bounded contexts
- Les entités principales
- Les relations entre agrégats
- Les value objects
- Les services métier

---

## Événements du domaine

Bien que non implémentés actuellement, voici les événements métier identifiés :

- `AccountCreated` : Déclenché à la création d'un compte
- `AccountDeleted` : Déclenché à la suppression d'un compte
- `PostPublished` : Déclenché à la publication d'un post
- `PostDeleted` : Déclenché à la suppression d'un post
- `UserFollowed` : Déclenché quand un utilisateur en suit un autre
- `PostLiked` : Déclenché quand un post est liké

Ces événements pourraient être implémentés pour :
- Notifications en temps réel
- Audit et logging
- Intégration avec d'autres systèmes

---

## Conclusion

Cette modélisation DDD de Fread permet de :
- ✅ Séparer clairement les responsabilités métier
- ✅ Maintenir la cohérence des données via les aggregates
- ✅ Faciliter l'évolution et la maintenance
- ✅ Améliorer la testabilité du code métier

Pour l'implémentation technique, consultez [ARCHITECTURE.md](ARCHITECTURE.md).
