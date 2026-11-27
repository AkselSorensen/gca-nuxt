# Mettre Cloudflare devant gsa-store.fr (gratuit)

Ça se fait dans le tableau de bord Cloudflare, pas dans le code. Compter 15 minutes.

## 1. Ajouter le site
1. cloudflare.com → **Add a site** → `gsa-store.fr` → plan **Free**.
2. Cloudflare copie les enregistrements DNS existants. Vérifier que `gsa-store.fr` et `www` pointent vers l'IP du VPS, avec le nuage **orange** (proxifié).
3. Chez le registrar du domaine, remplacer les serveurs de noms (nameservers) par les deux que Cloudflare indique. La propagation prend de quelques minutes à quelques heures.

## 2. Réglages à activer
- **SSL/TLS → Overview** : mode **Full (strict)** (le VPS a déjà un certificat valide).
- **SSL/TLS → Edge Certificates** : *Always Use HTTPS* activé.
- **Speed → Optimization** : *Brotli* activé, *HTTP/3* activé, *Early Hints* activé.
- **Caching → Configuration** : *Browser Cache TTL* = **Respect Existing Headers**.

## 3. Règles de cache (Caching → Cache Rules)
Créer deux règles, dans cet ordre :

1. **Médias produits** - *Si* l'URI Path commence par `/api/media/` → *Cache eligibility* : **Eligible for cache**, *Edge TTL* : **Use cache-control header if present**.
   Le site envoie déjà `Cache-Control: public, max-age=31536000, immutable` : Cloudflare servira les images sans jamais retoucher le VPS.
2. **Tout le reste de l'API** - *Si* l'URI Path commence par `/api/` (et que ce n'est pas la règle 1) → **Bypass cache**.
   Sessions, panier, paiement et admin ne doivent jamais être mis en cache.

Les fichiers `/_nuxt/*` (JS/CSS) et la vidéo/logos de `/public` sont mis en cache automatiquement.

## 4. Vérifier
```powershell
curl.exe -sI https://gsa-store.fr/hero-poster.jpg | findstr /i "cf-cache-status server"
```
`server: cloudflare` confirme le proxy. `cf-cache-status: HIT` (à la 2e requête) confirme que le fichier vient du cache.

## 5. Important
- Ne pas activer *Rocket Loader* ni *Auto Minify* (ils cassent parfois Vue/Nuxt).
- Si le paiement Stripe ou la connexion Discord/Steam posent problème après le changement, repasser le nuage en gris pour tester.
