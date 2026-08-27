// POST /api/contact — formulaire de contact → email GSA (SMTP OVH, Resend en secours)
import { defineEventHandler, readBody, createError } from 'h3'
import { sendEmail } from '../services/email'
import { premiumShell } from '../services/email-templates'

// Boîte support OVH (adresse de destination unique du formulaire de contact).
const CONTACT_EMAIL = process.env.GSA_CONTACT_EMAIL || 'support-gsa@gsa-store.fr'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const { name, email, subject, message, website } = body

  // Honeypot anti-spam : un robot remplit ce champ caché
  if (website) {
    return { ok: true, delivered: true }
  }

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Veuillez remplir tous les champs obligatoires.' })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Adresse email invalide.' })
  }
  if (typeof message !== 'string' || message.length > 5000) {
    throw createError({ statusCode: 400, statusMessage: 'Message trop long.' })
  }
  const cleanName = String(name).slice(0, 120)
  const cleanSubject = String(subject || 'Demande via le formulaire de contact').slice(0, 200)
  const cleanMessage = message.slice(0, 5000)

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="margin:0 0 16px;color:#11171f">Nouveau message de contact</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155">
        <tr><td style="padding:6px 0;color:#64748b;width:90px">Nom</td><td style="padding:6px 0;font-weight:600">${esc(cleanName)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0;font-weight:600">${esc(email)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Sujet</td><td style="padding:6px 0;font-weight:600">${esc(cleanSubject)}</td></tr>
      </table>
      <div style="margin-top:14px;padding:14px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;white-space:pre-wrap;font-size:14px;line-height:1.6;color:#334155">${esc(cleanMessage)}</div>
      <p style="margin-top:16px;color:#94a3b8;font-size:12px">Envoyé depuis le formulaire de contact GSA Store — répondez directement à cet email pour joindre l'expéditeur.</p>
    </div>
  `

  // 1) Message au support (répondre directement = répondre au visiteur)
  const delivered = await sendEmail(CONTACT_EMAIL, `[Contact GSA] ${cleanSubject}`, html, { replyTo: email })

  // 2) Accusé de réception au visiteur (ne bloque jamais la réponse)
  if (delivered) {
    const ackContent = `
      <p class="text-sub" style="font-size:14px;color:#5a6478;line-height:1.7;margin:0 0 14px;">Bonjour ${esc(cleanName)},</p>
      <p class="text-sub" style="font-size:14px;color:#5a6478;line-height:1.7;margin:0 0 16px;">Nous avons bien reçu votre message et nous vous répondons sous <strong>24 à 48 h</strong> (jours ouvrés). Voici une copie de votre demande :</p>
      <div class="soft-bg" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 18px;font-size:13.5px;color:#334155;line-height:1.6;">
        <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;">Sujet : ${esc(cleanSubject)}</div>
        <div style="white-space:pre-wrap;">${esc(cleanMessage)}</div>
      </div>
      <p class="text-sub" style="font-size:12.5px;color:#98a2b3;margin:16px 0 0;">Besoin d'une réponse plus rapide ? Notre Discord : <a href="https://discord.gg/KDsEzGRnKs" style="color:#2f7df6;text-decoration:none;font-weight:700;">discord.gg/KDsEzGRnKs</a></p>
    `
    await sendEmail(email, 'Nous avons reçu votre message — GSA Store', premiumShell(ackContent, {
      heroTitle: 'Message bien reçu ✅',
      heroSub: 'Notre équipe vous répond sous 24-48 h.',
      preheader: 'Accusé de réception — GSA Store',
    }))
  }

  return { ok: true, delivered }
})

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
