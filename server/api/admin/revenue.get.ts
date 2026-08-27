// GET /api/admin/revenue — dashboard Stripe (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { pool, query } from '../../services/db'
import { stripe, STRIPE_SECRET_KEY } from '../../services/stripe'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const out: any = {
      stripeMode: 'inconnu',
      accountId: null,
      accountEmail: null,
      balance: { available: [], pending: [] },
      stats: { chargesTotal: 0, transfersTotal: 0, feesTotal: 0, netTotal: 0 },
      charges: [],
      transfers: [],
      orders: [],
      sellersList: [],
    }

    if (stripe) {
      out.stripeMode = STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST'
      const account = await stripe.account.retrieve()
      out.accountId = account.id
      out.accountEmail = account.email || null

      const [balance, charges, transfers] = await Promise.all([
        stripe.balance.retrieve(),
        stripe.charges.list({ limit: 50 }),
        stripe.transfers.list({ limit: 50 }),
      ])

      out.balance = {
        available: (balance.available || []).map((b) => ({ currency: b.currency, amount: b.amount / 100 })),
        pending: (balance.pending || []).map((b) => ({ currency: b.currency, amount: b.amount / 100 })),
      }

      out.charges = (charges.data || []).map((c: any) => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        status: c.status,
        email: c.receipt_email || c.billing_details?.email || null,
        created: c.created * 1000,
        description: c.description || null,
        transferDestination: c.transfer_data?.destination || null,
        transferredAmount: c.transfer_data?.destination
          ? (c.amount - Number(c.application_fee_amount || 0)) / 100
          : null,
        applicationFee: c.application_fee_amount ? c.application_fee_amount / 100 : null,
      }))

      const manualTransfers = (transfers.data || []).filter((t: any) => t.status === 'paid')
      const destCharges = (charges.data || []).filter((c: any) => c.transfer_data?.destination)
      out.transfers = [
        ...manualTransfers.map((t: any) => ({
          id: t.id,
          amount: t.amount / 100,
          currency: t.currency,
          status: t.status,
          destination: t.destination,
          created: t.created * 1000,
          mode: 'transfer',
        })),
        ...destCharges.map((c: any) => ({
          id: c.id,
          amount: (c.amount - Number(c.application_fee_amount || 0)) / 100,
          currency: c.currency,
          status: c.status,
          destination: c.transfer_data.destination,
          created: c.created * 1000,
          mode: 'destination',
        })),
      ]

      out.stats.chargesTotal = out.charges.reduce((s: number, c: any) => s + (c.status === 'succeeded' ? c.amount : 0), 0)
      out.stats.transfersTotal = out.transfers.reduce((s: number, t: any) => s + (t.status === 'paid' || t.status === 'succeeded' ? t.amount : 0), 0)

      // Vendeur affilié de chaque charge (destination charge → nom en DB)
      try {
        const destIds = [...new Set(out.charges.map((c: any) => c.transferDestination).filter(Boolean))]
        if (destIds.length) {
          const sellersMap = await query(
            'SELECT id, stripe_account_id, display_name, commission_percent FROM users WHERE stripe_account_id = ANY($1)',
            [destIds]
          )
          const nameByAccount = new Map(sellersMap.rows.map((r: any) => [r.stripe_account_id, r.display_name]))
          const pctByAccount = new Map(sellersMap.rows.map((r: any) => [r.stripe_account_id, Number(r.commission_percent)]))
          const idByAccount = new Map(sellersMap.rows.map((r: any) => [r.stripe_account_id, r.id]))
          out.charges.forEach((c: any) => {
            c.sellerName = c.transferDestination ? (nameByAccount.get(c.transferDestination) || null) : null
            c.sellerPercent = c.transferDestination ? (pctByAccount.get(c.transferDestination) || null) : null
            c.sellerUserId = c.transferDestination ? (idByAccount.get(c.transferDestination) || null) : null
          })
        }
      } catch { /* non bloquant */ }

      // Frais Stripe réels
      try {
        const bts = await stripe.balanceTransactions.list({ limit: 100, type: 'charge' })
        out.stats.feesTotal = (bts.data || []).reduce((s: number, bt: any) => s + bt.fee / 100, 0)
      } catch { /* non bloquant */ }

      out.stats.netTotal = out.stats.chargesTotal - out.stats.transfersTotal
    }

    // Stats commandes depuis la DB
    const orders = await query(
      `
        SELECT
          o.id, o.total_amount, o.created_at, o.stripe_session_id,
          COALESCE(o.stripe_fee_amount, 0) AS stripe_fee_amount,
          COALESCE(SUM(oi.platform_fee_amount), 0) AS platform_fee,
          COALESCE(SUM(oi.seller_net_amount), 0) AS seller_net,
          COUNT(DISTINCT oi.id) AS items,
          u.email AS buyer_email,
          u.display_name AS buyer_name,
          COALESCE(string_agg(DISTINCT s.display_name || ' (' || oi.platform_fee_percent::text || '%)', ', '), '') AS sellers,
          COALESCE(array_agg(DISTINCT s.id) FILTER (WHERE s.id IS NOT NULL), '{}') AS seller_ids
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN users u ON u.id = o.user_id
        LEFT JOIN users s ON s.id = oi.seller_id
        WHERE o.status = 'completed'
        GROUP BY o.id, u.email, u.display_name
        ORDER BY o.created_at DESC
        LIMIT 50
      `
    )

    // Backfill des frais Stripe manquants
    if (stripe) {
      const missingFee = orders.rows.filter((r: any) => !Number(r.stripe_fee_amount) && r.stripe_session_id)
      for (const o of missingFee.slice(0, 10)) {
        try {
          const s = await stripe.checkout.sessions.retrieve(o.stripe_session_id)
          const piId = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id
          if (piId) {
            const pi = await stripe.paymentIntents.retrieve(piId, { expand: ['latest_charge.balance_transaction'] })
            let fee = Number((pi.latest_charge as any)?.balance_transaction?.fee || 0) / 100
            if (!fee && pi.latest_charge) {
              const cid = typeof pi.latest_charge === 'string' ? pi.latest_charge : (pi.latest_charge as any).id
              const ch = await stripe.charges.retrieve(cid, { expand: ['balance_transaction'] })
              fee = Number((ch as any).balance_transaction?.fee || 0) / 100
            }
            if (fee > 0) {
              await query('UPDATE orders SET stripe_fee_amount = $1 WHERE id = $2', [fee, o.id])
              o.stripe_fee_amount = fee
            }
          }
        } catch { /* non bloquant */ }
      }
    }
    out.orders = orders.rows.map((r: any) => ({
      id: r.id,
      total: Number(r.total_amount),
      fee: Number(r.stripe_fee_amount),
      platformFee: Number(r.platform_fee),
      sellerNet: Number(r.seller_net),
      items: Number(r.items),
      buyerEmail: r.buyer_email,
      buyerName: r.buyer_name,
      sellers: r.sellers,
      sellerIds: Array.isArray(r.seller_ids) ? r.seller_ids.map(Number) : [],
      createdAt: r.created_at,
    }))

    // Liste des vendeurs pour le filtre admin
    try {
      const sellersListRes = await query(
        "SELECT id, display_name FROM users WHERE role IN ('seller','admin') ORDER BY display_name"
      )
      out.sellersList = sellersListRes.rows.map((r: any) => ({
        id: r.id,
        name: r.display_name,
      }))
    } catch { out.sellersList = [] }

    return out
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin revenue error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch revenue data' })
  }
})
