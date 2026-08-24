// POST /api/contact — formulaire de contact → email GSA (Resend)
import { defineEventHandler, readBody, createError } from 'h3'
import { sendEmail } from '../services/email'

const CONTACT_EMAIL = process.env.GSA_CONTACT_EMAIL || 'gsa.storee@yahoo.com'

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
      <p style="margin-top:16px;color:#94a3b8;font-size:12px">Envoyé depuis le formulaire de contact GSA Store.</p>
    </div>
  `

  const delivered = await sendEmail(CONTACT_EMAIL, `[Contact GSA] ${cleanSubject}`, html)
  return { ok: true, delivered }
})

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
