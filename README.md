# Fread (Better than Thread)

## Définition du besoin utilisateur

Notre projet devra :

- Permettre la publication de postes par les utilisateurs :
  - Texte
  - Images
  - Vidéos
- Permettre de liker des postes
- Permettre aux utilisateurs de commenter les postes et de répondre aux commentaires
- Permettre aux utilisateurs de s'abonner à d'autres utilisateurs
- Permettre la création de profils utilisateurs avec des informations personnelles et une photo de profil
- Permettre de pouvoir reposter les postes d'autres utilisateurs
- Permettre la recherche de postes par mots-clés ou hashtags

L'utilisateur devra être connnecté pour:
- Publier, liker, commenter, répondre, s'abonner, reposter
- Voir son fil d'actualité personnalisé

L'utilisateur non connecté pourra:
- Voir les postes/commentaires publics
- Consulter les profils publics


## Technologies utilisées

- Fullstack : Next.js
- Base de données : PostgreSQL (Prisma)
- Authentification : NextAuth.js V5
