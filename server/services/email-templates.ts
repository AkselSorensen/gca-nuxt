// Template email premium GSA Store — responsive (mobile) + dark mode (Gmail/Apple/Outlook)
// Shell partagé : logo + hero + contenu + CTA + footer. Styles inline + media queries.

const APP_URL = process.env.APP_BASE_URL || 'https://gsa-store.fr'
export const BRAND = { blue: '#2f7df6', violet: '#6c5ce7', dark: '#0f172a' }

export function currency(n: number): string {
  return Number(n).toFixed(2).replace('.', ',') + ' €'
}

export function premiumShell(content: string, opts: { heroTitle?: string; heroSub?: string; ctaLabel?: string; ctaUrl?: string; preheader?: string } = {}): string {
  const { heroTitle, heroSub, ctaLabel, ctaUrl, preheader } = opts
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>GSA Store</title>
  <style>
    @media (prefers-color-scheme: dark) {
      .body-bg { background: #0b1220 !important; }
      .card-bg { background: #111827 !important; }
      .card-line { border-color: #1f2937 !important; }
      .text-main { color: #f3f4f6 !important; }
      .text-sub { color: #9ca3af !important; }
      .text-soft { color: #6b7280 !important; }
      .soft-bg { background: #1f2937 !important; }
    }
    @media screen and (max-width: 600px) {
      .stack { display: block !important; width: 100% !important; }
      .stack-pad { padding: 0 0 10px 0 !important; }
      .hero-pad { padding: 36px 22px !important; }
      .body-pad { padding: 24px 18px !important; }
      .hero-title { font-size: 24px !important; }
      .btn { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#eef1f7;font-family:Inter,Arial,Helvetica,sans-serif;">
  <div class="body-bg" style="background:#eef1f7;padding:20px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e6eaf2;box-shadow:0 12px 40px rgba(15,23,42,.08);">
      <!-- HEADER : logo -->
      <tr>
        <td style="padding:24px 32px 16px;text-align:center;">
          <img src="${APP_URL}/logo.png" alt="GSA Store" width="150" style="width:150px;max-width:150px;display:inline-block;" />
        </td>
      </tr>

      <!-- HERO -->
      <tr>
        <td class="hero-pad" style="background:linear-gradient(135deg,#2f7df6 0%,#6c5ce7 100%);padding:40px 36px;text-align:center;">
          <div style="display:inline-block;padding:5px 14px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px;">GSA Store</div>
          ${heroTitle ? `<h1 class="hero-title" style="margin:0 0 10px;color:#ffffff;font-size:27px;line-height:1.28;font-weight:800;letter-spacing:-.01em;">${heroTitle}</h1>` : ''}
          ${heroSub ? `<p style="margin:0 auto 22px;color:rgba(255,255,255,.88);font-size:14px;line-height:1.6;max-width:400px;">${heroSub}</p>` : ''}
          ${ctaLabel && ctaUrl ? `<a class="btn" href="${ctaUrl}" style="display:inline-block;padding:13px 30px;border-radius:12px;background:#ffffff;color:#2f7df6;font-size:14px;font-weight:800;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.18);">${ctaLabel} →</a>` : ''}
        </td>
      </tr>

      <!-- CONTENU -->
      <tr>
        <td class="body-pad card-bg" style="padding:26px 32px;background:#ffffff;">
          ${content}
        </td>
      </tr>

      <!-- CTA FINAL -->
      <tr>
        <td class="body-pad" style="padding:6px 32px 26px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;padding:24px 20px;text-align:center;">
            <tr>
              <td>
                <div class="text-main" style="font-size:17px;font-weight:800;color:#ffffff;margin-bottom:6px;">Prêt à créer votre serveur ?</div>
                <div class="text-sub" style="font-size:12.5px;color:#94a3b8;margin-bottom:16px;">Des promotions sur les packs les plus populaires, chaque semaine.</div>
                <a class="btn" href="${APP_URL}/catalogue?sort=discount" style="display:inline-block;padding:12px 26px;border-radius:12px;background:linear-gradient(135deg,#2f7df6,#6c5ce7);color:#fff;font-size:13.5px;font-weight:800;text-decoration:none;">Voir les promotions →</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td class="card-bg" style="padding:22px 32px 28px;text-align:center;border-top:1px solid #eef2f9;background:#ffffff;">
          <img src="${APP_URL}/logo.png" alt="GSA" width="80" style="width:80px;max-width:80px;opacity:.8;display:inline-block;margin-bottom:10px;" />
          <div class="text-main" style="font-size:12.5px;color:#111827;font-weight:700;">GSA Store — Pas une boutique. Un standard.</div>
          <div class="text-soft" style="font-size:11.5px;color:#9ca3af;margin-top:6px;line-height:1.8;">
            <a href="${APP_URL}/catalogue" style="color:#2f7df6;text-decoration:none;">Catalogue</a> &nbsp;·&nbsp;
            <a href="${APP_URL}/prestation" style="color:#2f7df6;text-decoration:none;">Prestations</a> &nbsp;·&nbsp;
            <a href="https://discord.gg/KDsEzGRnKs" style="color:#2f7df6;text-decoration:none;">Discord</a> &nbsp;·&nbsp;
            <a href="${APP_URL}/contact" style="color:#2f7df6;text-decoration:none;">Contact</a>
          </div>
          <div class="text-soft" style="font-size:10.5px;color:#b6bfce;margin-top:10px;">© 2026 GSA Store — SIREN 105982003</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`
}

// Carte produit réutilisable (liste de commandes, à la une…)
export function productRowHtml(it: { title: string; slug?: string; price: number; quantity?: number; oldPrice?: number; letter?: string }, showQty = true): string {
  const letter = it.letter || (it.title || '?').charAt(0).toUpperCase()
  const lineTotal = Number(it.price) * Number(it.quantity || 1)
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card-line" style="border:1px solid #eef2f9;border-radius:12px;overflow:hidden;margin-bottom:10px;">
    <tr>
      <td width="58" style="padding:12px 14px;">
        <div style="width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#2f7df6,#6c5ce7);display:inline-block;text-align:center;line-height:40px;font-size:18px;font-weight:800;color:#fff;">${letter}</div>
      </td>
      <td style="padding:12px 0;vertical-align:middle;">
        <div class="text-main" style="font-weight:700;font-size:13.5px;color:#111827;">${it.title}</div>
        ${showQty && it.quantity && it.quantity > 1 ? `<div class="text-sub" style="font-size:11.5px;color:#6b7280;">Quantité : ${it.quantity}</div>` : ''}
      </td>
      <td width="120" style="padding:12px 14px;text-align:right;vertical-align:middle;">
        <div class="text-main" style="font-weight:800;font-size:15px;color:#111827;">${currency(lineTotal)}</div>
        ${it.oldPrice && Number(it.oldPrice) > Number(it.price) ? `<div class="text-soft" style="font-size:10.5px;color:#9ca3af;text-decoration:line-through;">${currency(it.oldPrice)}</div>` : ''}
      </td>
    </tr>
  </table>`
}

export function buttonRowHtml(label: string, url: string, primary = true): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0;">
    <tr>
      <td align="center">
        <a class="btn" href="${url}" style="display:inline-block;padding:13px 34px;border-radius:12px;${primary ? 'background:linear-gradient(135deg,#2f7df6,#6c5ce7);color:#ffffff;' : 'background:#f1f5f9;color:#2f7df6;'}font-size:14px;font-weight:800;text-decoration:none;">${label} →</a>
      </td>
    </tr>
  </table>`
}
