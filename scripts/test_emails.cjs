// Test email : facture + avis + vente (templates identiques à la source)
const nodemailer = require('nodemailer');

const items = [
  { title: 'HUD Opérationnel GSA', slug: 'hud-operationnel-gsa', price: 49, quantity: 1 },
  { title: 'Pack Bâtiments Industriels', slug: 'pack-batiments', price: 30, quantity: 2 },
];

const cur = (n) => Number(n).toFixed(2).replace('.', ',') + ' €';

const invoice = (items, total) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
  <h2 style="margin:0 0 4px;color:#11171f">Merci pour votre achat ! 🎉</h2>
  <p style="color:#5a6478;font-size:14px;margin:0 0 18px">Récapitulatif de votre commande GSA Store — facture d'achat.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr style="background:#f8fafc"><th style="padding:8px 12px;text-align:left;color:#5a6478;font-size:12px">Produit</th><th style="padding:8px 12px;color:#5a6478;font-size:12px">Qté</th><th style="padding:8px 12px;text-align:right;color:#5a6478;font-size:12px">Prix</th></tr>
    ${items.map((it) => `<tr><td style="padding:10px 12px;border-bottom:1px solid #eef2f7;color:#11171f">${it.title}</td><td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:center;color:#5a6478">${it.quantity}</td><td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:right;color:#11171f;font-weight:700">${cur(it.price * it.quantity)}</td></tr>`).join('')}
  </table>
  <div style="padding:12px;text-align:right"><p style="margin:2px 0;font-size:16px;font-weight:800;color:#11171f">Total : ${cur(total)}</p></div>
  <p style="color:#5a6478;font-size:13px;line-height:1.6">Vos téléchargements : <a href="https://gsa-store.fr/downloads" style="color:#2f7df6">Mes téléchargements</a></p>
</div>`;

const review = (items) => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
  <h2 style="margin:0 0 12px;color:#11171f">Votre avis compte !</h2>
  <p style="color:#5a6478;font-size:14px;line-height:1.6">Vous avez récemment acheté sur GSA Store. Un avis aide les créateurs :</p>
  <div style="text-align:center;margin:16px 0">${items.map((it) => `<a href="https://gsa-store.fr/product/${it.slug}" style="display:inline-block;margin:6px 6px 0 0;padding:9px 16px;border-radius:8px;background:#f1f5f9;color:#2f7df6;text-decoration:none;font-size:13px;font-weight:600">${it.title} ⭐</a>`).join('')}</div>
  <p style="color:#98a2b3;font-size:12px;margin-top:20px">GSA Store — L'équipe</p>
</div>`;

const sold = (title, qty, price, buyer) => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
  <h2 style="margin:0 0 12px;color:#11171f">🎉 Une vente sur GSA Store !</h2>
  <p style="color:#5a6478;font-size:14px;line-height:1.6">Votre création <strong style="color:#11171f">${title}</strong> vient d'être vendue${qty > 1 ? ` (x${qty})` : ''} pour <strong style="color:#22c55e">${cur(price)}</strong>.</p>
  <p style="color:#5a6478;font-size:13px;line-height:1.6">Acheteur : ${buyer}<br/>Le montant net (après commission GSA) sera reversé via Stripe Connect.</p>
  <p style="color:#98a2b3;font-size:12px;margin-top:20px">GSA Store — L'équipe</p>
</div>`;

(async () => {
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465), secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const from = process.env.MAIL_FROM;
  const to = 'gsa.storee@yahoo.com';
  await t.sendMail({ from, to, subject: '[TEST 1/3] Votre facture GSA Store — 109,00 €', html: invoice(items, 109) });
  await t.sendMail({ from, to, subject: '[TEST 2/3] Votre avis compte sur GSA Store ⭐', html: review(items) });
  await t.sendMail({ from, to, subject: '[TEST 3/3] 🎉 Vente sur GSA Store — HUD Opérationnel', html: sold('HUD Opérationnel GSA', 1, 49, 'client@exemple.com') });
  console.log('3 EMAILS ENVOYÉS ✓');
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
