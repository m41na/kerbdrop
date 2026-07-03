/**
 * Auth routes — phone verification only.
 *
 * Authentication on KerbDrop is phone OTP → handle selection.
 * That is the complete auth flow. There is no Stripe Connect step here.
 *
 * Stripe Connect (optional payment capability) lives at:
 *   GET  /api/v1/payments/connect/url
 *   GET  /api/v1/payments/connect/callback
 * Those routes are in misc.ts under the paymentsRouter.
 * They are reached from Account settings, never from the auth flow.
 */
import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate'
import { rateLimits } from '../middleware/rateLimit'
import { requireAuth } from '../middleware/auth'
import { PhoneSchema, HandleSchema } from '@kerbdrop/shared'
import { supabase } from '../lib/clients'

export const authRouter = Router()

// Request SMS OTP
authRouter.post(
  '/phone/request',
  rateLimits.phoneRequest,
  validate(z.object({ phone: PhoneSchema })),
  async (req, res) => {
    const { phone } = req.body
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) {
      return res.status(400).json({ success: false, error: { code: 'OTP_FAILED', message: error.message } })
    }
    res.json({ success: true, data: { expiresIn: 600 } })
  }
)

// Verify OTP
authRouter.post(
  '/phone/verify',
  validate(z.object({ phone: PhoneSchema, token: z.string().length(6) })),
  async (req, res) => {
    const { phone, token } = req.body
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    if (error || !data.session) {
      return res.status(400).json({ success: false, error: { code: 'OTP_INVALID', message: 'Invalid or expired code.' } })
    }

    // Check if user record exists
    const { data: user } = await supabase
      .from('users')
      .select('id, handle')
      .eq('id', data.session.user.id)
      .single()

    res.json({
      success: true,
      data: {
        session: data.session,
        isNewUser: !user,
      },
    })
  }
)

// Set handle (new users only)
authRouter.post(
  '/handle',
  requireAuth,
  validate(z.object({ handle: HandleSchema })),
  async (req, res) => {
    const { handle } = req.body

    // Check uniqueness
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('handle', handle)
      .single()

    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'HANDLE_TAKEN', message: 'That handle is already taken.' } })
    }

    const { error } = await supabase
      .from('users')
      .upsert({ id: req.userId, handle, phone_verified: true })

    if (error) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to set handle.' } })
    }

    res.json({ success: true })
  }
)

// Sign out
authRouter.delete('/session', requireAuth, async (req, res) => {
  await supabase.auth.signOut()
  res.json({ success: true })
})
