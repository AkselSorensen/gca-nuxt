// Service : envoi d'emails via Resend (désactivé si RESEND_API_KEY absent)
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY absent — email non envoyé à', to)
    return false
  }
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

export function verificationEmailHtml(code: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="margin:0 0 12px;color:#11171f">Vérification de votre email</h2>
      <p style="color:#5a6478;font-size:14px;line-height:1.6">Bienvenue sur GSA Store ! Voici votre code de validation :</p>
      <div style="text-align:center;margin:20px 0;padding:14px;border-radius:8px;background:#f1f5f9;font-size:26px;font-weight:800;letter-spacing:6px;color:#2f7df6">${code}</div>
      <p style="color:#5a6478;font-size:13px">Ce code est valable 30 minutes. Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
  `
}
