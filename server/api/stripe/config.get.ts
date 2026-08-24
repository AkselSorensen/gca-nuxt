// GET /api/stripe/config — clé publique Stripe (réplique du monolithe)
import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  const stripeKey = process.env.STRIPE_SECRET_KEY || ''
  const publicKey = process.env.STRIPE_PUBLIC_KEY || ''
  return {
    enabled: Boolean(stripeKey && publicKey),
    publishableKey: publicKey || null,
  }
})
