# 🔗 STRIPE_DOC — Documentation complète du paiement GSA Marketplace

> **Projet** : gsa-nuxt — Marketplace Garry's Mod
> **URL prod** : https://gca-nuxt.vercel.app
> **Backend** : `server/express/server.cjs` (monté dans Nitro)
> **Dernière mise à jour** : 20/08/2026

---

## 1. Vue d'ensemble du modèle de paiement

GSA utilise **Stripe Connect** avec le modèle **« Stripe gère les tarifs » (stripe_managed)** :

| Élément | Valeur |
|---|---|
| Type de compte plateforme | Stripe **Standard** (reçoit les paiements clients) |
| Type de compte vendeur | Stripe **Connect Express** (un par vendeur) |
| Commission plateforme | **25 %** (`PLATFORM_COMMISSION_PERCENT=25`) |
| Part vendeur | **75 %** |
| Frais Stripe | **Prélevés sur le vendeur** (la plateforme paie 0 € de frais) |
| Devise | EUR |

### 🧮 Répartition d'une vente (produit à 20 €, vendeur Connect actif)

```
Acheteur paie 20,00 €  ──►  Stripe
                              ├── 5,00 €  → GSA (commission 25 %, application_fee_amount)
                              ├── 14,45 € → Vendeur (75 % − ~0,55 € de frais Stripe)
                              └── 0,55 €  → Stripe (frais, payés par le vendeur)
```

**Mécanisme** : *destination charge* — le paiement part directement chez le vendeur
(`transfer_data.destination`), la commission est retenue par la plateforme
(`application_fee_amount`).

**Sans compte Connect actif** (fallback) : le paiement reste chez GSA et un
**transfert manuel** de 75 % est créé ensuite vers le vendeur (ancien modèle).

**Panier multi-vendeurs** : le panier doit n'appartenir qu'à **UN SEUL vendeur**
pour bénéficier du mode Stripe-managed ; sinon → fallback ancien modèle.

---

## 2. Les comptes Stripe

| Rôle | ID de compte | État |
|---|---|---|
| **PLATEFORME (GSA)** — détenteur des clés test | `acct_1SfQGZ2NvpdS4Qfp` | ✅ Charges/payouts activés — **c'est là qu'est l'argent** |
| Compte séparé / non lié (ne pas utiliser) | `acct_1SflHFPULLNxbhrw` | ❌ Standalone, vide, accès refusé par la plateforme |
| Vendeur test n°1 (onboarding COMPLET) | `acct_1U6SYhRxQIZx9mrN` | ✅ charges ✓ payouts ✓ details ✓ (user 1269 `vendeur@gsa.local`) |
| Vendeur test n°2 (onboarding NON fait) | `acct_1U6Rod2KNG2mFwQn` | ⏳ créé, `charges_enabled: false` |
| Ancien vendeur (modèle précédent) | `acct_1U5mumRqOfnKwBK6` | ⚠️ plus accessible (ancienne plateforme) |
| Ancien Connect admin | `acct_1TwJGTRyNGligP2U` | ⚠️ inactif |

> ⚠️ **Point crucial** : l'argent encaissé (166,18 € disponibles en mode TEST,
> 6+ charges) est visible sur le dashboard du compte **`acct_1SfQGZ2NvpdS4Qfp`**
> — le détenteur des clés `pk_test_51SfQGZ…`. Pas sur `acct_1SflHFPULLNxbhrw`.

---

## 3. Où voir l'argent (dashboard Stripe)

1. Se connecter sur https://dashboard.stripe.com avec le compte qui possède les **clés test** (`pk_test_51SfQGZ…`)
2. **Toggle « Test mode »** en haut à droite (les transactions sont en TEST — en mode Live, rien n'apparaît)
3. L'ID du compte doit être **`acct_1SfQGZ2NvpdS4Qfp`** (visible en bas à gauche)
4. URLs utiles :
   - Paiements : `https://dashboard.stripe.com/test/payments`
   - Solde : `https://dashboard.stripe.com/test/balance`
   - Comptes Connect : `https://dashboard.stripe.com/test/connect/accounts`

---

## 4. Flux d'achat

### 4.1 Achat simple (Buy Now) — vendeur Connect actif
```
POST /api/checkout/buy-now  { slug }
   │
   ├─ Vérifie que l'acheteur ne possède pas déjà le produit
   ├─ resolveTransferMode() : compte Connect du vendeur → charges_enabled ?
   │     ├─ OUI → mode "destination" (Stripe-managed)
   │     │        payment_intent_data.transfer_data.destination = acct_vendeur
   │     │        payment_intent_data.application_fee_amount  = 25 % du prix
   │     └─ NON → mode "manual" (transfert après commande)
   │
   ├─ stripe.checkout.sessions.create(...)  → URL de paiement Stripe
   └─ Acheteur paie → Stripe → webhook → commande en DB → téléchargement
```

### 4.2 Panier (create-session)
Même logique avec `line_items` multiples ; si les items appartiennent à
**plusieurs vendeurs** → fallback manuel (transferts séparés après paiement).

### 4.3 Webhook Stripe
- **Endpoint** : `POST https://gca-nuxt.vercel.app/api/stripe/webhook`
- **Secret** : `STRIPE_WEBHOOK_SECRET` (variable Vercel, jamais commitée)
- **ID webhook** : `we_1U66fW2NvpdS4QfpkzKfQTgm`
- **Événements** : `checkout.session.completed`, `charge.succeeded`,
  `transfer.*`, `payment_intent.*`
- **Rôle** : crée la commande en DB, marque le produit comme possédé,
  enregistre les frais (`recordStripeFee` + backfill automatique dans
  `admin/revenue`).

### 4.4 Facture PDF
Téléchargement direct depuis `GET /api/orders/:id/invoice` — pas de `window.open`
(les popups sont bloquées) ; logo GSA embarqué en base64 (`logo-b64.cjs`).

---

## 5. Onboarding vendeur (lier son compte Stripe)

### Parcours normal
1. Le vendeur va sur `/seller/account` → onglet « Mon compte »
2. Clic **« Lier le compte Stripe »** → `POST /api/stripe/connect`
   - Pas de compte ? → création d'un compte **Connect Express** (metadata `gsa_user_id`)
   - Compte existant (même user/email) ? → **réutilisé** (pas de doublon)
   - Compte déjà activé ? → réponse `connected: true`, **aucune redirection**
3. Sinon → redirection vers **l'onboarding Express** (hébergé par Stripe)
4. Retour sur `seller/account?success=true&account=acct_xxx`
5. Statut : `GET /api/stripe/connect/status`

### Données de test (mode test)
| Champ | Valeur |
|---|---|
| SSN | `000-00-0000` |
| IBAN | `000123456789` |
| Routing | `110000000` |

### Statut du compte (`GET /api/stripe/connect/status`)
| Réponse | Signification |
|---|---|
| `connected: true` | Compte activé → reçoit les paiements |
| `connected: false, hasAccount: true` | Compte créé, onboarding incomplet |
| `connected: false, hasAccount: false` | Aucun compte lié |
| Compte stocké invalide | **Reset automatique** → le bouton « Lier » recrée/réutilise |

---

## 6. Endpoints API Stripe

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/stripe/config` | Clé publique (pk_test) pour le front |
| POST | `/api/stripe/connect` | Créer/réutiliser le compte Connect + lien onboarding |
| GET | `/api/stripe/connect/status` | État du compte (connecté / onboarding / aucun) |
| POST | `/api/stripe/connect/link` | Associer un compte précis (`?account=acct_xxx`) |
| POST | `/api/stripe/dashboard` | Lien vers le dashboard Express du vendeur |
| POST | `/api/stripe/webhook` | Événements Stripe (commandes, frais, transfers) |
| POST | `/api/checkout/buy-now` | Achat direct d'un produit |
| POST | `/api/checkout/create-session` | Panier |
| GET | `/api/seller/revenue` | Revenus du vendeur (solde Connect, transfers, stats, `platformCommissionPercent`) |
| GET | `/api/admin/revenue` | Revenus plateforme (charges, net, frais backfillés) |
| GET | `/api/orders/:id/invoice` | Facture PDF |

---

## 7. Variables d'environnement (Vercel `gca-nuxt`)

| Variable | Rôle |
|---|---|
| `STRIPE_SECRET_KEY` | Clé secrète (TEST) — compte `acct_1SfQGZ2NvpdS4Qfp` |
| `STRIPE_PUBLIC_KEY` | Clé publique (TEST) — servie par `/api/stripe/config` |
| `STRIPE_WEBHOOK_SECRET` | Signature du webhook |
| `PLATFORM_COMMISSION_PERCENT` | **25** (commission GSA) |
| `APP_BASE_URL` | `https://gca-nuxt.vercel.app` |
| `FRONTEND_URL` | `https://gca-nuxt.vercel.app` |
| `NUXT_PUBLIC_API_ORIGIN` | `https://gca-nuxt.vercel.app` (même domaine) |
| `DATABASE_URL` | Postgres Neon (prod) |
| R2 (4 vars) | Stockage des fichiers produits (bucket `gca-files`) |

> 🔒 **Jamais commitées** : clés Stripe, `DATABASE_URL`, `SESSION_SECRET`,
> secrets R2, mot de passe du vendeur test. Le `vercel env pull` ne les
> télécharge pas (vérifié).

---

## 8. Cartes de test Stripe

| Carte | Résultat |
|---|---|
| `4242 4242 4242 4242` | ✅ Paiement réussi |
| `4000 0000 0000 0077` | ❌ Paiement refusé (montant non crédité) |
| `4000 0000 0000 9995` | ⚠️ Refusée — fonds insuffisants |
| `4000 0000 0000 0069` | ⚠️ Expirée |

Toute date future (ex. `12/34`), CVC quelconque (ex. `123`), code postal `42424`.

---

## 9. Bugs résolus (troubleshooting)

| Symptôme | Cause racine | Fix |
|---|---|---|
| 500 sur toutes les routes API locales | 3 causes : `process.exit(1)` si DB absente ; double `app.listen` → EADDRINUSE ; `express is not a function` (namespace Rollup) | `maybeListen()` sans exit ; listen seulement en standalone ; interop `_x.default \|\| _x` |
| Process prod mort (exit 128) — réponses erratiques | `require.main` resté intact dans le bundle ESM (Rollup transforme `typeof require` mais pas `require.main`) → ReferenceError dans `maybeListen` | `maybeListen` réécrit avec `process.mainModule` + try/catch, **zéro référence à `require`** |
| « Stripe Connect: account not connected to your platform » | Compte `stripe_account_id` stocké en DB = compte standalone non lié (`acct_1SflHFPULLNxbhrw`) | Vérification `retrieve()` avant usage ; compte invalide → reset + **création/réutilisation automatique** |
| « Onboarding Stripe incomplet » alors que le compte est activé | Lien DB perdu (reset d'un compte invalide) + `linkStripeAccount()` jamais appelé au retour + crash process qui perdait la réponse | Recherche du compte existant par `gsa_user_id`/email ; si déjà activé → `connected: true` sans redirection |
| Frais Stripe à 0 € | Le webhook créait la commande avant que `balance_transaction` soit disponible | `recordStripeFee` avec fallback charge + **backfill auto** dans `admin/revenue` |
| Facture `about:blank` | `window.open` bloqué par le navigateur | Téléchargement direct (`Content-Disposition: attachment`) |
| Panier inutilisable | JSON localStorage corrompu + quota saturé par les images base64 | Reset panier + stockage léger (slug/titre/prix/vendeur) |
| Achat rapide muet | Destination charge vers compte Connect non onboardé | Validation `charges_enabled` avant destination (sinon fallback manuel) |
| Upload produit « double page » | Double-clic sur le bouton | Guard `saving` + bouton désactivé « Enregistrement… » |
| `pricing_model` rejeté par l'API | Paramètre obsolète en API Stripe 2026 (Express = stripe_managed par défaut) | Paramètre retiré |

---

## 10. Étapes de validation restantes

- [x] Migration backend Express → gsa-nuxt (prod unifiée `gca-nuxt.vercel.app`)
- [x] Modèle Stripe-managed (25/75, frais au vendeur)
- [x] Compte vendeur test activé (`acct_1U6SYhRxQIZx9mrN`)
- [ ] **Vente de test** : acheter le « Pack Test Stripe-Managed » (20 €, produit id 38) avec un compte acheteur → vérifier +5 € GSA / ~14,45 € vendeur
- [ ] Vérifier l'onglet Revenus vendeur (solde Connect)
- [ ] Validation finale → **suppression de l'ancien repo `gsa_tresingo`**

---

## 11. FAQ

**Q : Pourquoi je ne vois pas l'argent sur mon dashboard Stripe ?**
R : Tu regardes probablement le mauvais compte (`acct_1SflHFPULLNxbhrw`, vide) ou le
mode Live. L'argent est sur `acct_1SfQGZ2NvpdS4Qfp`, en **mode TEST** :
`https://dashboard.stripe.com/test/balance`.

**Q : La plateforme paie des frais Stripe ?**
R : Non, plus depuis le modèle Stripe-managed. Les frais visibles dans l'historique
(5,34 €) sont les achats de test réalisés AVANT le passage au nouveau modèle.

**Q : Un vendeur doit-il obligatoirement lier Stripe pour vendre ?**
R : Oui pour recevoir son argent automatiquement. Sans compte Connect actif, la
vente fonctionne mais l'argent reste chez GSA (transfert manuel à organiser).

**Q : Comment tester un paiement ?**
R : Carte `4242 4242 4242 4242`, date `12/34`, CVC `123`, code postal `42424`.
Refus : `4000 0000 0000 0077`.

**Q : Comment réinitialiser un vendeur qui a un compte cassé ?**
R : Le système le fait seul : `connect/status` détecte le compte invalide, le
resette, et le prochain clic sur « Lier le compte Stripe » réutilise ou recrée
un compte propre.
