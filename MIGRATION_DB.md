# Passer de Supabase à PostgreSQL sur le VPS

Le code et le `docker-compose.yml` sont prêts : la base (`db`) et la sauvegarde quotidienne (`backup`) sont définies, mais **ne démarrent pas toutes seules**. Le site continue d'utiliser Supabase jusqu'à l'étape « Basculer ».

Tout se fait sur le VPS, dans `/opt/gsa` (`ssh gsa@TON_IP`). Compter 20 minutes, dont 1 à 2 minutes de coupure.

## Sans connexion SSH : depuis GitHub
Si tu ne peux pas te connecter au VPS depuis ton PC, tout peut se lancer depuis GitHub (le secret SSH du déploiement est déjà enregistré) :
1. Dépôt GitHub → **Settings → Secrets and variables → Actions → New repository secret** : nom `SUPABASE_DATABASE_URL`, valeur = l'URL Supabase (avec `?sslmode=require`).
2. **Actions → « VPS base de données » → Run workflow**, puis, dans cet ordre : `status`, `setup`, `migrate` (compare les nombres de lignes dans les logs).
3. Mettre le site en maintenance, relancer `migrate`, puis `switch`, vérifier le site et désactiver la maintenance.
4. `rollback` remet le site sur Supabase en cas de problème.


## 1. Préparer
1. Pousser le code, attendre la fin du déploiement, puis sur le VPS : `cd /opt/gsa && git pull origin main`.
2. Ajouter un mot de passe pour la base dans `.env` (une longue valeur aléatoire, sans espace ni `@` `:` `/` `#`) :
   ```
   POSTGRES_PASSWORD=UNE_LONGUE_VALEUR_ALEATOIRE
   ```
   Pour en générer une : `openssl rand -hex 24`.
3. Récupérer l'URL actuelle de Supabase : c'est la valeur de `DATABASE_URL` dans `.env`. **La garder de côté** (copie dans un fichier), elle sert de retour arrière. Elle doit finir par `?sslmode=require`.
   - Si l'export échoue avec une URL en port 6543 (« transaction pooler »), utiliser l'URL « Session pooler » (port 5432) de Supabase → Connect.

## 2. Copier les données (sans rien casser)
```sh
cd /opt/gsa
OLD_URL='postgresql://...ton URL Supabase...?sslmode=require' sh scripts/migrate-to-vps-db.sh
```
Le script démarre la base locale, exporte Supabase, importe sur le VPS, puis affiche le nombre de lignes des tables clés **côté Supabase | côté VPS**. Il ne modifie pas Supabase et peut être relancé autant de fois que nécessaire. Le site n'est pas touché.

## 3. Basculer (la courte coupure)
Pour ne perdre aucune commande entre la copie et la bascule :
1. Mettre le site en **maintenance** (admin → bouton maintenance).
2. Relancer le script de l'étape 2 (il recopie les dernières données).
3. Dans `.env`, remplacer `DATABASE_URL` par :
   ```
   DATABASE_URL=postgresql://gsa:LE_MOT_DE_PASSE@db:5432/gsa
   ```
   (même mot de passe que `POSTGRES_PASSWORD`).
4. Relancer le site :
   ```sh
   docker compose up -d --force-recreate app
   docker compose up -d backup
   ```
5. Vérifier que le site s'affiche, que la connexion fonctionne et qu'une page produit s'ouvre, puis **désactiver la maintenance**.

## 4. Vérifier la sauvegarde
```sh
docker compose logs backup | tail
```
Tu dois voir `[backup] ok` puis `[backup] copié sur R2`. Le fichier est dans R2 sous `backups/db/`. Ajouter dans Cloudflare R2 une règle de cycle de vie pour supprimer ces fichiers après 30 jours (Bucket → Settings → Object lifecycle rules).

## Retour arrière
Remettre l'ancienne `DATABASE_URL` Supabase dans `.env`, puis `docker compose up -d --force-recreate app`. Supabase n'a jamais été modifié, mais ne contient pas les commandes passées après la bascule.

## À savoir
- Garde Supabase actif **au moins une semaine** après la bascule, avant de le supprimer.
- La base est dans le volume Docker `pgdata`. **Ne jamais lancer `docker compose down -v`** : l'option `-v` supprime ce volume.
- Pour tester une restauration : `gunzip -c fichier.sql.gz | docker compose exec -T db psql -U gsa -d gsa`.
