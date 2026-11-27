#!/bin/sh
# Sauvegarde PostgreSQL : au démarrage puis chaque jour à 03:00 UTC.
# Fichier .sql.gz gardé 7 jours dans le volume "dbbackups" et copié sur R2 (backups/db/).
set -u
apk add --no-cache aws-cli >/dev/null 2>&1 || echo "[backup] aws-cli indisponible : copie R2 désactivée"
export PGPASSWORD="${POSTGRES_PASSWORD:-}"
export AWS_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID:-}" AWS_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY:-}" AWS_DEFAULT_REGION=auto
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required AWS_RESPONSE_CHECKSUM_VALIDATION=when_required

run_backup() {
  f="/backups/gsa-$(date -u +%Y%m%d-%H%M%S).sql.gz"
  if pg_dump --no-owner --no-acl | gzip > "$f" && [ -s "$f" ]; then
    echo "[backup] ok : $f ($(du -h "$f" | cut -f1))"
    if command -v aws >/dev/null 2>&1 && [ -n "${R2_ENDPOINT:-}" ]; then
      aws s3 cp "$f" "s3://${R2_BUCKET:-gca-files}/backups/db/$(basename "$f")" --endpoint-url "$R2_ENDPOINT" --only-show-errors \
        && echo "[backup] copié sur R2" || echo "[backup] ÉCHEC de la copie sur R2"
    fi
    find /backups -name 'gsa-*.sql.gz' -mtime +7 -delete
  else
    echo "[backup] ÉCHEC de la sauvegarde"; rm -f "$f"
  fi
}

run_backup
while true; do
  now=$(date -u +%s)
  next=$(date -u -d "tomorrow 03:00" +%s 2>/dev/null || echo $((now + 86400)))
  [ "$next" -le "$now" ] && next=$((now + 86400))
  sleep $((next - now))
  run_backup
done
