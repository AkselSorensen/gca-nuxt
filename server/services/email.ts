// Service : envoi d'emails — SMTP OVH (Zimbra) en priorité, Resend en secours.
// Désactivé silencieusement si aucun transport n'est configuré (mode démo).
import nodemailer from 'nodemailer'
import { premiumShell } from './email-templates'

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  // 1) SMTP (OVH Zimbra / ssl0.ovh.net) — transport principal
  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'ssl0.ovh.net',
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    })
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || `GSA Store <${smtpUser}>`,
        to,
        subject,
        html,
      })
      console.log('[email] SMTP envoyé à', to)
      return true
    } catch (error) {
      console.error('[email] SMTP error:', error)
      return false
    }
  }

  // 2) Resend — secours
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'GSA Store <onboarding@resend.dev>',
          to,
          subject,
          html,
        }),
      })
      if (!res.ok) {
        console.error('[email] Resend error:', res.status, await res.text().catch(() => ''))
        return false
      }
      return true
    } catch (error) {
      console.error('[email] sendEmail error:', error)
      return false
    }
  }

  console.warn('[email] aucun transport configuré (SMTP_USER/SMTP_PASS ou RESEND_API_KEY) — email non envoyé à', to)
  return false
}

export function verificationEmailHtml(code: string): string {
  const content = `
    <p class="text-sub" style="font-size:14px;color:#5a6478;line-height:1.7;margin:0 0 18px;">Bienvenue sur GSA Store ! Voici votre code de validation :</p>
    <div style="text-align:center;margin:8px 0 20px;padding:16px;border-radius:12px;background:#f1f5f9;font-size:30px;font-weight:800;letter-spacing:8px;color:#2f7df6;">${code}</div>
    <p class="text-sub" style="font-size:12.5px;color:#98a2b3;margin:0;">Ce code est valable 30 minutes. Si vous n'avez pas créé de compte, ignorez cet email.</p>
  `
  return premiumShell(content, {
    heroTitle: 'Vérifiez votre email 🔐',
    heroSub: 'Une dernière étape avant de rejoindre GSA Store.',
    preheader: 'Votre code de validation GSA Store',
  })
}
