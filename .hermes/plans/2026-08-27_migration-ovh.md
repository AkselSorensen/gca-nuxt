# Migration GSA Store — Vercel → OVHcloud

> **Pour Hermes :** exécuter ce plan par étapes (une phase = une fournée de commits), validation de prod à chaque phase. Ne pas basculer le DNS avant la Phase 7.

**Goal:** Migrer la plateforme GSA Store (Nuxt 3 + Express monolithe) de Vercel vers un VPS OVHcloud, sans perte de fonctionnalité ni de perf, avec CDN conservé (Cloudflare) et déploiement CI automatique.

**Architecture cible :**
```
Utilisateur → Cloudflare (CDN + cache SWR + SSL) → VPS OVH (Docker : app Nuxt + monolithe)
                                                      ├── Neon Postgres (inchangé, puis OVH Managed DB en option)
                                                      ├── Cloudflare R2 (inchangé)
                                                      ├── Stripe / Discord / Resend (externes, inchangés)
```

**Tech Stack:** Nuxt 3 (nitro node-server), Express monolithe (lazy-loaded), Docker + Docker Compose, GitHub Actions, Cloudflare (free), OVH VPS Linux (Debian 12), Node 20+, Caddy ou Nginx (reverse proxy).

---

## Contexte actuel (assumptions vérifiées)

- Frontend + API : `https://gca-nuxt.vercel.app` — auto-deploy Vercel sur push `main`
- Build : `npm run build` → `.output/` (nitro `node-server` — contient l'app + le monolithe lazy)
- DB : Postgres externe (`DATABASE_URL`) — sessions `connect-pg-simple`, images base64 servies via `/api/media/:id`
- R2 : fichiers produits + images (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`)
- Externes : Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, webhook `/api/stripe/webhook`), Discord OAuth (`DISCORD_*`, guild check `1364909003800580096`), Resend (`RESEND_API_KEY`), `APP_BASE_URL`
- Perf actuelle : catalogue 0,74 s warm, bootstrap 48 ms (CDN Vercel/edge), images cache 7 j
- Variables d'env : listées par nom uniquement — valeurs [REDACTED], à copier via le dashboard Vercel → Settings → Environment Variables

## Stratégie globale

**Parallélisme + bascule douce :**
1. Le VPS tourne en **parallèle** de Vercel (même DB, même R2) — zéro risque données
2. Validation complète sur le domaine de test (`https://vps.gsa-store.fr` ou IP:port via Caddy)
3. Bascule DNS uniquement quand tout est vert
4. Vercel conservé comme filet jusqu'à J+7 après bascule

---

## PHASE 1 — Provisioning OVH (hors code, côté user)

### Tâche 1.1 : Commander le VPS
- OVHcloud → VPS → **VPS "Value" ou "Essential" : 2 vCPU / 4 Go RAM / 80 Go NVMe** (~10-15 €/mois)
- OS : **Debian 12** (minimum)
- Option : backup quotidien (OVH, ~2 €/mo) — **recommandé**

### Tâche 1.2 : Sécuriser le VPS (SSH)
- `ssh root@<IP>` puis :
```bash
adduser gsa && usermod -aG sudo gsa
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" && cat ~/.ssh/id_ed25519.pub
# copier la clé publique dans /home/gsa/.ssh/authorized_keys
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
# UFW :
sudo apt update && sudo apt install -y ufw fail2ban
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw enable
```

### Tâche 1.3 : Installer Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker gsa
sudo systemctl enable docker
```

### Tâche 1.4 : (Prérequis) Avoir un domaine
- Ex. `gsa-store.fr` (~8 €/an chez OVH ou ailleurs)
- Le DNS sera géré par OVH (ou Cloudflare en autorité DNS — recommandé)

---

## PHASE 2 — Conteneuriser l'app (code)

### Tâche 2.1 : Créer `Dockerfile` (racine du repo)
**Files:** Create `Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output .output
COPY --from=build /app/node_modules node_modules
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

> ⚠️ **Pitfall connu** : `.dockerignore` obligatoire (`.output`, `node_modules`, `.git`, `content/legal` si non nécessaire au runtime — le `?raw` import les compile DANS le bundle, pas besoin à runtime).

### Tâche 2.2 : Créer `.dockerignore`
**Files:** Create `.dockerignore`
```
node_modules
.output
.nuxt
.git
.env
```

### Tâche 2.3 : Créer `docker-compose.yml`
**Files:** Create `docker-compose.yml`

```yaml
services:
  app:
    build: .
    restart: always
    env_file: .env
    ports:
      - "127.0.0.1:3000:3000"   # exposé seulement localement (Caddy proxy en façade)
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/", "||", "exit", "1"]
      interval: 30s
      timeout: 5s
      retries: 3
```

### Tâche 2.4 : Vérifier le build Docker en local
```bash
docker build -t gsa-app . && docker run --rm -p 3000:3000 --env-file .env gsa-app
curl -s http://localhost:3000/api/bootstrap | head -c 100   # → JSON OK
```

---

## PHASE 3 — Reverse proxy + HTTPS (Caddy)

### Tâche 3.1 : Installer Caddy sur le VPS
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

### Tâche 3.2 : Configurer Caddy (`/etc/caddy/Caddyfile`)
```
gsa-store.fr, www.gsa-store.fr {
    reverse_proxy 127.0.0.1:3000
    encode gzip
}
```
- Caddy gère **automatiquement** les certs Let's Encrypt (renouvellement inclus)
- `sudo systemctl enable --now caddy`

### Tâche 3.3 : Vérifier
- `curl -s https://gsa-store.fr/api/bootstrap` → 200 JSON (après bascule DNS ou test via `/etc/hosts`)

---

## PHASE 4 — Déploiement automatique (GitHub Actions)

### Tâche 4.1 : Créer le workflow `.github/workflows/deploy-ovh.yml`
**Files:** Create `.github/workflows/deploy-ovh.yml`

```yaml
name: Deploy OVH
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.OVH_HOST }}
          username: gsa
          key: ${{ secrets.OVH_SSH_KEY }}
          script: |
            cd /opt/gsa && git pull origin main
            cp .env .env.bak
            docker compose up -d --build --force-recreate
            docker image prune -f
```

### Tâche 4.2 : Préparer le VPS (une fois)
```bash
sudo mkdir -p /opt/gsa && sudo chown gsa:gsa /opt/gsa
cd /opt/gsa && git clone <repo> .
# copier le .env (cf. Tâche 4.3)
```

### Tâche 4.3 : Variables d'environnement (secrets GitHub)
- Ajouter dans GitHub → Settings → Secrets and variables → Actions :
  - `OVH_HOST`, `OVH_SSH_KEY` (clé privée)
- Le `.env` du VPS = copie EXACTE des variables Vercel (dashboard Vercel → Settings → Environment Variables) :
  - `APP_BASE_URL` → **`https://gsa-store.fr`** (⚠️ changer !)
  - `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI` → **`https://gsa-store.fr/auth/discord/callback`** (⚠️ changer !)
  - `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
  - `RESEND_API_KEY`, `RESEND_FROM`
- ⚠️ `SESSION_SECRET` : garder la MÊME valeur que Vercel (sinon toutes les sessions existantes sont invalidées)

### Tâche 4.4 : Vérifier le déploiement auto
- Pousser un commit anodin → le workflow se lance → `docker compose up -d --build` → `curl https://gsa-store.fr` OK

---

## PHASE 5 — Mises à jour externes (configs)

### Tâche 5.1 : Webhook Stripe
- Stripe Dashboard → Webhooks → remplacer l'endpoint :
  - `https://gca-nuxt.vercel.app/api/stripe/webhook` → `https://gsa-store.fr/api/stripe/webhook`
- ⚠️ Ne supprimer l'ancien endpoint qu'**après la bascule** (le webhook doit répondre pendant la transition)

### Tâche 5.2 : Discord OAuth
- Discord Developers → Application → OAuth2 → Redirects :
  - Ajouter `https://gsa-store.fr/auth/discord/callback` (garder l'ancien jusqu'à bascule)

### Tâche 5.3 : Discord guild check
- `DISCORD_GUILD_ID` : inchangé (`1364909003800580096`) — le serveur ne bouge pas

### Tâche 5.4 : Emails Resend
- `RESEND_FROM` : vérifier que le domaine d'envoi est validé (ou garder l'adresse actuelle)

---

## PHASE 6 — Cloudflare devant (CDN + cache)

### Tâche 6.1 : Zone Cloudflare (free)
- Ajouter `gsa-store.fr` → Cloudflare devient l'autorité DNS
- Enregistrement A : `gsa-store.fr` → IP du VPS (proxy orange = ON)
- Enregistrement A : `www` → IP du VPS (proxy ON)
- SSL/TLS → Full (strict)

### Tâche 6.2 : Règles de cache (équivalent des routeRules SWR)
- Cloudflare → Caching → Cache Rules (2 règles gratuites) :
  1. **Pages** : `gsa-store.fr/`, `/catalogue`, `/product/*`, `/about`, `/prestation` → Cache Everything, TTL 1 h, Stale-while-revalidate
  2. **API** : `/api/bootstrap`, `/api/products*`, `/api/categories`, `/api/search` → Cache Everything, TTL 5 min, SWR 1 h
- ⚠️ Ne PAS cacher : `/api/me`, `/api/cart*`, `/api/checkout*`, `/auth/*` (données utilisateur) — le code renvoie déjà `Cache-Control: private` sur ces routes

### Tâche 6.3 : Vérifier la perf
- `curl -sI https://gsa-store.fr/api/bootstrap` → `cf-cache-status: HIT` au 2e appel
- Objectif : bootstrap < 100 ms, catalogue ~0,7 s (comme aujourd'hui)

---

## PHASE 7 — Bascule DNS (jour J)

### Tâche 7.1 : Pré-vol (checklist)
- [ ] Toutes les pages répondent sur `https://gsa-store.fr` (test via `/etc/hosts` pointé vers l'IP VPS)
- [ ] Login Discord complet (OAuth + guild check) fonctionne sur le nouveau domaine
- [ ] Stripe : session de test (mode test) sur le nouveau domaine
- [ ] Webhook Stripe réceptif (envoyer un événement de test depuis le dashboard)
- [ ] Téléchargement d'un fichier R2 OK
- [ ] Paiement de test OK (Stripe test mode)

### Tâche 7.2 : Bascule
- Cloudflare → TTL court (300 s) sur l'enregistrement A si pas déjà fait
- Vercel : ajouter un **redirect 301** `gca-nuxt.vercel.app → gsa-store.fr` (ou garder tel quel en attendant)

### Tâche 7.3 : Post-bascule (J+1)
- [ ] Vérifier les emails de notification (approbation vendeur, contact) partent du nouveau domaine
- [ ] Vérifier le webhook Stripe reçoit les événements réels (dashboard → Logs)
- [ ] Vérifier les sessions : un user connecté avant bascule reste connecté (même SESSION_SECRET + même DB)
- [ ] `curl https://gsa-store.fr/api/bootstrap` → cf-cache-status HIT

### Tâche 7.4 : Filet de sécurité
- **Ne PAS supprimer le projet Vercel avant J+7** sans incidents
- Après validation : supprimer l'endpoint webhook Stripe Vercel + le redirect Discord Vercel

---

## PHASE 8 — Hygiène & monitoring

### Tâche 8.1 : Backups
- Activer les backups OVH (VPS) — restauration point dans le temps
- La DB reste sur Neon (backups inclus) — rien à faire ; si migration OVH Managed DB plus tard : activer leurs snapshots

### Tâche 8.2 : Monitoring simple (gratuit)
- **UptimeRobot** (free) : check `https://gsa-store.fr` toutes les 5 min → alerte Discord/email
- **Caddy** : logs access dans `/var/log/caddy/` (rotation auto)
- **Docker** : `docker compose logs -f app` pour le débogage

### Tâche 8.3 : Sécurité récurrente
- `sudo apt update && sudo apt upgrade` mensuel (cron ou rappel)
- `docker compose pull && docker compose up -d` après chaque `npm audit` notable
- fail2ban actif (déjà installé Phase 1)

---

## PHASE 9 — Optionnel : tout héberger chez OVH

### Tâche 9.1 : PostgreSQL managé OVH (au lieu de Neon)
- OVHcloud → Public Cloud → Databases → PostgreSQL 15 (starter ~10 €/mo)
- Migrer : `pg_dump` Neon → `psql` OVH (une nuit, downtime court à prévoir — prévoir une fenêtre de maintenance)
- ⚠️ Sessions connect-pg-simple + toutes les requêtes SQL = compatibles (standard Postgres)

### Tâche 9.2 : Object Storage OVH (au lieu de R2)
- S3-compatible → changer `R2_ENDPOINT` + clés (même code `@aws-sdk/client-s3`)
- ⚠️ Le `storage_path` des images en base reste valide (mêmes clés objets) — seule l'endpoint change
- Pas urgent : R2 gratuit/peu cher actuellement

### Tâche 9.3 : Supprimer gsa-tresingo (legacy)
- Projet Vercel `gsa-tresingo` supprimable une fois la migration validée (webhook Stripe vérifié sur le nouveau domaine)

---

## Fichiers modifiés/créés (résumé)

| Fichier | Action |
|---|---|
| `Dockerfile` | Créer |
| `.dockerignore` | Créer |
| `docker-compose.yml` | Créer |
| `.github/workflows/deploy-ovh.yml` | Créer |
| `.env` (VPS, hors repo) | Créer (copie des env Vercel, `APP_BASE_URL` + `DISCORD_REDIRECT_URI` changés) |
| `/etc/caddy/Caddyfile` (VPS) | Créer |
| Stripe webhook + Discord redirect | Modifier (dashboards) |
| Cloudflare zone | Créer |

Aucun changement de code applicatif attendu (l'app tourne déjà en `node-server`).

## Risques & mitigations

| Risque | Mitigation |
|---|---|
| Build Docker gourmand (4 Go RAM) | VPS 4 Go minimum ; runner GitHub Actions fait le build (pas le VPS) |
| Perte de perf sans Vercel edge | Cloudflare cache rules (SWR) — testé Phase 6 |
| Sessions invalidées | Même `SESSION_SECRET` + même DB → sessions survivent |
| Webhook Stripe pendant transition | Garder les 2 endpoints jusqu'à J+7 |
| Cold start monolithe | Disparaît (process permanent) — perf améliorée |
| Oubli de maintenance | Monitoring UptimeRobot + rappel mensuel |

## Questions ouvertes

1. **Domaine** : tu en as un ? (`gsa-store.fr` ?) — sinon je recommande de l'acheter chez OVH (~8 €/an)
2. **DB** : garder Neon au début (recommandé) ou migrer direct vers OVH Managed Postgres ?
3. **Budget** : VPS 10-15 €/mo + Cloudflare gratuit + Neon free → ~12 €/mo — OK ?
4. **Le redirect** `gca-nuxt.vercel.app` → nouveau domaine : souhaité ou abandon du domaine Vercel ?
5. **Vercel** : garder comme staging (recommandé) ou tout couper après J+7 ?
