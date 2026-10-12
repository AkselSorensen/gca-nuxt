# GSA Store — marketplace

GSA Store est une marketplace développée avec Nuxt et Vue. Elle réunit le catalogue public, les espaces clients et vendeurs et des outils d’administration.

## Fonctionnalités

- Catalogue, recherche, catégories et fiches produits.
- Comptes clients et vendeurs avec interfaces adaptées à leur rôle.
- Gestion des produits, commandes, ventes et factures.
- Paiement Stripe et suivi des commissions et frais.
- Administration du contenu, des vendeurs et des indicateurs financiers.
- Notifications par e-mail et déploiement conteneurisé.

## Technologies

Nuxt, Vue, TypeScript, Node.js, Stripe et Docker. Le déploiement est configuré pour un serveur OVH.

## Développement local

```bash
npm install
npm run dev
```

Les services de paiement, de base de données et d’envoi de courriels nécessitent une configuration d’environnement. Consulte `STRIPE_DOC.md` pour la documentation Stripe. Ne publie pas de secrets ou de clés API.

## Production

```bash
npm run build
```

Le dépôt contient un `Dockerfile`, `docker-compose.yml` et une configuration de déploiement. Adapte les variables d’environnement et les services avant de lancer une instance.
