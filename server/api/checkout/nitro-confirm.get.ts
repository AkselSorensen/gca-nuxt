import { defineEventHandler, getQuery, createError } from 'h3'
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.session_id as string

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'session_id requis' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

  try {
    // Call the existing confirm-session API on gsa-tresingo
    const response = await fetch(
      'https://gsa-tresingo.vercel.app/api/checkout/confirm-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }
    )
    const data = await response.json()
    return data
  } catch (e: any) {
    console.error('Nitro confirm error:', e)
    throw createError({ statusCode: 500, statusMessage: e.message || 'Erreur' })
  }
})
