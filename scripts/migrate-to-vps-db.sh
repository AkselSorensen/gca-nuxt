#!/bin/sh
# Copie la base Supabase vers PostgreSQL sur le VPS. À lancer SUR LE VPS, dans /opt/gsa :
#   OLD_URL='postgresql://...supabase...?sslmode=require' sh scripts/migrate-to-vps-db.sh
# Sans danger : ne modifie pas Supabase, et peut être relancé (il remplace le contenu de la base locale).
set -eu
: "${OLD_URL:?Donne l'URL Supabase : OLD_URL='postgresql://...' sh scripts/migrate-to-vps-db.sh}"
cd "$(dirname "$0")/.."
grep -q '^POSTGRES_PASSWORD=.\+' .env || { echo "Ajoute POSTGRES_PASSWORD=<mot de passe> dans .env avant de continuer."; exit 1; }

echo "1/4 Démarrage de la base locale"
docker compose up -d db
for i in $(seq 1 30); do
  docker compose exec -T db pg_isready -U gsa -d gsa >/dev/null 2>&1 && break
  sleep 2
done

echo "2/4 Export depuis Supabase"
mkdir -p backup
docker run --rm postgres:17-alpine pg_dump "$OLD_URL" --no-owner --no-acl --schema=public --format=custom > backup/supabase.dump
[ -s backup/supabase.dump ] || { echo "Export vide : vérifie OLD_URL"; exit 1; }
ls -lh backup/supabase.dump

echo "3/4 Import dans la base locale"
docker compose exec -T db pg_restore -U gsa -d gsa --no-owner --no-acl --clean --if-exists < backup/supabase.dump || true

echo "4/4 Vérification (nombre de lignes : Supabase | VPS)"
for t in users products product_media orders order_items reviews categories user_sessions; do
  a=$(docker run --rm postgres:17-alpine psql "$OLD_URL" -tAc "SELECT count(*) FROM $t" 2>/dev/null || echo '?')
  b=$(docker compose exec -T db psql -U gsa -d gsa -tAc "SELECT count(*) FROM $t" 2>/dev/null || echo '?')
  printf '%-14s %s | %s\n' "$t" "$a" "$b"
done
echo
echo "Si les nombres sont identiques : passe à l'étape « Basculer » de MIGRATION_DB.md."
