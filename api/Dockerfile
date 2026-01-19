# Image Bun officielle
FROM oven/bun:1

WORKDIR /app

# Copier tout le code de l'API (les fichiers inutiles sont exclus via .dockerignore)
COPY . .

# Installer les dépendances (production + ce qu'il faut pour Prisma)
RUN bun install

# Exposer le port de l'API (même que env.PORT, par défaut 3000)
EXPOSE 3001

# Commande de démarrage : générer le client Prisma, appliquer les migrations puis lancer l'API
CMD ["sh", "-c", "bun run db:generate && bun run db:migrate && bun index.ts"]
