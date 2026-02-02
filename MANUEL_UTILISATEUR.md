# Manuel Utilisateur - Fread

## Table des matières

- [Introduction](#introduction)
- [Premiers pas](#premiers-pas)
- [Créer un compte](#créer-un-compte)
- [Se connecter](#se-connecter)
- [Gérer son profil](#gérer-son-profil)
- [Publier un post](#publier-un-post)
- [Interagir avec les posts](#interagir-avec-les-posts)
- [Suivre d'autres utilisateurs](#suivre-dautres-utilisateurs)
- [Navigation](#navigation)
- [Utilisation de l'API (Postman)](#utilisation-de-lapi-postman)

## Introduction

Fread est une plateforme de réseau social qui vous permet de partager vos pensées, idées et actualités sous forme de posts courts. Vous pouvez interagir avec d'autres utilisateurs via des likes, des commentaires et en les suivant.

### Fonctionnalités principales

- ✍️ Publier des posts texte
- ❤️ Liker et commenter les posts
- 👥 Suivre d'autres utilisateurs
- 🔒 Gérer la confidentialité de votre compte et de vos posts
- 📱 Personnaliser votre profil avec une photo et une description

## Premiers pas

### Accès à l'application

Avoir installé et démarré l'application localement (voir README.md pour les instructions d'installation).
L'application est accessible via votre navigateur à l'adresse :
```
http://localhost:3000
```

### Navigation sans compte

Vous pouvez parcourir Fread sans créer de compte :
- Consulter les profils publics
- Lire les posts publics
- Voir les commentaires publics

Pour publier, liker ou suivre des utilisateurs, vous devez créer un compte.

## Créer un compte

Fread propose deux méthodes d'authentification :

### Via Discord

1. Cliquez sur le bouton **"Se connecter avec Discord"**
2. Autorisez Fread à accéder à votre compte Discord
3. Complétez votre profil Fread (nom d'utilisateur, description)

### Via Google

1. Cliquez sur le bouton **"Se connecter avec Google"**
2. Sélectionnez votre compte Google
3. Autorisez Fread à accéder à votre compte
4. Complétez votre profil Fread (nom d'utilisateur, description)

### Compléter votre profil

Après votre première connexion :
1. Choisissez un **nom d'utilisateur** unique (identifiant public)
2. Ajoutez un **nom d'affichage** (peut être différent du nom d'utilisateur)
3. Rédigez une **description** de votre profil (optionnel)
4. Définissez la **confidentialité** de votre compte (public ou privé)

## Se connecter

### Connexion

1. Accédez à la page de connexion
2. Choisissez votre méthode d'authentification (Discord ou Google)
3. Autorisez l'application si nécessaire

### Déconnexion

1. Ouvrez le menu utilisateur (les 3 traits en haut à gauche)
2. Sélectionnez **"Logout"**

## Gérer son profil

### Accéder à votre profil

1. Ouvrez le menu utilisateur (les 3 traits en haut à gauche)
2. Cliquez sur votre nom d'utilisateur ou sur **"Profile"**
3. Vous verrez vos informations publiques et vos statistiques :
   - Nombre de posts
   - Nombre d'abonnés
   - Nombre d'abonnements

### Modifier votre profil

1. Sur votre page de profil, cliquez sur **"Edit Profile"**
2. Modifiez les informations souhaitées :
   - Nom d'affichage
   - Description
   - Photo de profil
   - Confidentialité du compte (public/privé)
3. Cliquez sur **"Save"**

### Confidentialité du compte

- **Compte public** : tout le monde peut voir vos posts et votre profil
- **Compte privé** : seuls vos abonnés peuvent voir vos posts privés

## Publier un post

### Créer un post

1. Sur la page d'accueil
2. Rédigez votre message (texte uniquement)
3. Choisissez la visibilité :
   - **Public** : visible par tous
   - **Privé** : visible uniquement par vos abonnés
4. Cliquez sur **"Post"**

### Modifier un post

1. Sur votre post, cliquez sur le menu **"..."** (trois points)
2. Sélectionnez **"Edit"**
3. Modifiez le contenu ou la visibilité
4. Cliquez sur **"Save"**

### Supprimer un post

1. Sur votre post, cliquez sur le menu **"..."**
2. Sélectionnez **"Delete"**
3. Confirmez la suppression

⚠️ **Attention** : la suppression est définitive et ne peut pas être annulée.

## Interagir avec les posts

### Liker un post

1. Cliquez sur l'icône **❤️** sous le post
2. Le like est comptabilisé immédiatement
3. Cliquez à nouveau pour retirer votre like

### Commenter un post

1. Cliquez sur **"Reply"** ou l'icône de commentaire
2. Rédigez votre commentaire
3. Choisissez la visibilité (public/privé)
4. Cliquez sur **"Post"**

### Voir les commentaires

1. Cliquez sur **"Voir les réponses"** ou le nombre de commentaires
2. Les commentaires s'affichent en dessous du post

## Suivre d'autres utilisateurs

### Suivre un utilisateur

1. Accédez au profil de l'utilisateur
2. Cliquez sur **"Suivre"**
3. Vous verrez désormais ses posts publics dans votre fil d'actualité

### Se désabonner

1. Sur le profil de l'utilisateur, cliquez sur **"Abonné"**
2. Cliquez sur **"Se désabonner"** pour confirmer

### Voir vos abonnements

1. Accédez à votre profil
2. Cliquez sur le nombre d'**"Abonnements"**
3. La liste de vos abonnements s'affiche

### Voir vos abonnés

1. Accédez à votre profil
2. Cliquez sur le nombre d'**"Abonnés"**
3. La liste de vos abonnés s'affiche

## Navigation

### Page d'accueil / Fil d'actualité

- Affiche les posts des utilisateurs que vous suivez
- Les posts publics de tous les utilisateurs
- Triés par date de publication (plus récents en premier)

### Recherche

Utilisez la barre de recherche pour trouver :
- Des utilisateurs par nom d'utilisateur ou nom d'affichage
- Des posts par mots-clés

### Notifications

🚧 **Fonctionnalité à venir** : vous serez notifié des :
- Nouveaux abonnés
- Likes sur vos posts
- Commentaires sur vos posts

## Utilisation de l'API (Postman)

Pour les utilisateurs avancés ou les développeurs souhaitant tester l'API directement, une collection Postman est disponible dans `api/postman/Fread.postman_collection.json`.

### Configuration de Postman

1. Importez la collection dans Postman
2. Configurez les variables d'environnement :
   - `host` : localhost
   - `port` : 3001
   - `jwt` : votre token JWT (obtenu après connexion)

### Base de l'API

- **URL de base** : `http://localhost:3001`
- **Format** : JSON (`Content-Type: application/json`)
- **Authentification** : Bearer Token dans l'en-tête `Authorization`

### Routes principales

#### Authentification

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/auth/discord` | Connexion Discord | ❌ |
| GET | `/auth/google` | Connexion Google | ❌ |

#### Comptes

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/account/:id` | Consulter un profil | ❌ |
| GET | `/account/:id/posts` | Posts d'un utilisateur | ❌ |
| PATCH | `/account` | Modifier son profil | ✅ |
| DELETE | `/account/:id` | Supprimer son compte | ✅ |

#### Posts

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/post` | Créer un post | ✅ |
| GET | `/post/:id` | Consulter un post | ❌ |
| PATCH | `/post/:id` | Modifier un post | ✅ |
| DELETE | `/post/:id` | Supprimer un post | ✅ |
| POST | `/post/:id/reply` | Répondre à un post | ✅ |
| GET | `/post/:id/replies` | Voir les réponses | ❌ |

#### Interactions

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/follow/:id` | Suivre un utilisateur | ✅ |
| DELETE | `/follow/:id` | Se désabonner | ✅ |
| POST | `/like/:id` | Liker un post | ✅ |
| DELETE | `/like/:id` | Retirer un like | ✅ |

### Exemples de payloads détaillés

#### Authentification (Auth)

**GET /auth/discord**
- Authentification : non requise (démarre le flux OAuth Discord)
- Pas de payload nécessaire
- À utiliser depuis un navigateur pour la redirection OAuth

**GET /auth/google**
- Authentification : non requise (démarre le flux OAuth Google)
- Pas de payload nécessaire
- À utiliser depuis un navigateur pour la redirection OAuth

---

#### Comptes (Account)

**GET /account/:id**
- Authentification : non requise
- Pas de payload nécessaire
- Exemple : `GET http://localhost:3001/account/cm52abc123def456ghi`

**GET /account/:id/posts**
- Authentification : non requise
- Pas de payload nécessaire
- Exemple : `GET http://localhost:3001/account/cm52abc123def456ghi/posts`

**PATCH /account**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Corps JSON attendu :

```json
{
  "displayName": "Nom à afficher",
  "description": "Description du profil",
  "isPrivate": false
}
```

- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
Content-Type: application/json
```

**DELETE /account/:id**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Aucun champ spécifique attendu dans le corps (peut être vide `{}`)
- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
```

---

#### Suivi d'utilisateurs (Follow)

**POST /follow/:id**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Suivre un compte
- Pas de payload nécessaire dans le corps
- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
```

- Exemple : `POST http://localhost:3001/follow/cm52abc123def456ghi`

**DELETE /follow/:id**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Ne plus suivre un compte
- Aucun champ spécifique attendu dans le corps
- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
```

- Exemple : `DELETE http://localhost:3001/follow/cm52abc123def456ghi`

---

#### Posts (Post)

**POST /post**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Créer un post
- Corps JSON attendu :

```json
{
  "content": "Contenu de mon post",
  "isPrivate": false
}
```

- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
Content-Type: application/json
```

**GET /post/:id**
- Authentification : optionnelle
- Obtenir un post
- Pas de payload nécessaire
- Sans en-tête `Authorization` : accès invité aux contenus publics uniquement
- Avec en-tête `Authorization` : accès aux contenus publics et privés si autorisé

```
Authorization: Bearer <votre_jwt>
```

- Exemple : `GET http://localhost:3001/post/cm52xyz789abc012def`

**PATCH /post/:id**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Modifier un post
- Corps JSON attendu :

```json
{
  "content": "Nouveau contenu",
  "isPrivate": false
}
```

- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
Content-Type: application/json
```

**DELETE /post/:id**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Supprimer un post
- Aucun champ spécifique attendu dans le corps
- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
```

- Exemple : `DELETE http://localhost:3001/post/cm52xyz789abc012def`

**POST /post/:id/reply**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Répondre à un post
- Corps JSON attendu :

```json
{
  "content": "Ma réponse",
  "isPrivate": false
}
```

- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
Content-Type: application/json
```

- Exemple : `POST http://localhost:3001/post/cm52xyz789abc012def/reply`

**GET /post/:id/replies**
- Authentification : optionnelle
- Récupérer les réponses à un post
- Pas de payload nécessaire
- Sans en-tête `Authorization` : accès invité aux réponses publiques
- Avec en-tête `Authorization` : accès aux réponses publiques et privées si autorisé

```
Authorization: Bearer <votre_jwt>
```

- Exemple : `GET http://localhost:3001/post/cm52xyz789abc012def/replies`

---

#### Likes (Like)

**POST /like/:id**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Liker un post
- Pas de payload nécessaire dans le corps
- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
```

- Exemple : `POST http://localhost:3001/like/cm52xyz789abc012def`

**DELETE /like/:id**
- Authentification : requise (token JWT dans l'en-tête `Authorization`)
- Retirer son like
- Aucun champ spécifique attendu dans le corps
- En-têtes requis :

```
Authorization: Bearer <votre_jwt>
```

- Exemple : `DELETE http://localhost:3001/like/cm52xyz789abc012def`

---

## Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez que l'API et le frontend sont bien démarrés
2. Consultez la documentation technique (voir MANUEL_DEVELOPPEUR.md)
3. Vérifiez les logs du navigateur (Console F12)
4. Contactez l'équipe de développement

**Bonne utilisation de Fread ! 🎉**
