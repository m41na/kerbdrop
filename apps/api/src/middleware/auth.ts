import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import { env } from '../lib/env'

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      userId?: string
      userHandle?: string
    }
  }
}

/**
 * requireAuth — hard gate. Returns 401 if no valid session.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } })
  }

  const token = authHeader.slice(7)

  // Create a per-request Supabase client that validates the JWT
  const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error } = await supabaseClient.auth.getUser()

  if (error || !user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session.' } })
  }

  req.userId = user.id
  next()
}

/**
 * optionalAuth — soft gate. Attaches userId if token present and valid,
 * but does not block unauthenticated requests. Used on public routes
 * (browse, listing detail) that behave differently when authenticated.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return next()

  const token = authHeader.slice(7)
  const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user } } = await supabaseClient.auth.getUser()
  if (user) req.userId = user.id
  next()
}
