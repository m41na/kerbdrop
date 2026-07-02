import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './lib/env'
import { logger } from './lib/logger'
import { authRouter } from './routes/auth'
import { listingsRouter } from './routes/listings'
import {
  photosRouter,
  messagesRouter,
  offersRouter,
  paymentsRouter,
  notificationsRouter,
  webhooksRouter,
} from './routes/misc'
import { startAllJobs } from './jobs/cron'

const app = express()

// ── Security & logging ────────────────────────────────────────────────────
app.use(helmet())
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  })
)

// ── Body parsing ──────────────────────────────────────────────────────────
// Raw body needed for Stripe webhook signature verification
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '1mb' }))

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/listings', listingsRouter)
app.use('/api/v1/photos', photosRouter)
app.use('/api/v1/messages', messagesRouter)
app.use('/api/v1/offers', offersRouter)
app.use('/api/v1/payments', paymentsRouter)
app.use('/api/v1/notifications', notificationsRouter)
app.use('/api/v1/webhooks', webhooksRouter)

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found.' } })
})

// ── Global error handler ──────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { err: err.message, stack: err.stack })
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred.' } })
})

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  logger.info(`🚀 KerbDrop API running on port ${env.PORT} [${env.NODE_ENV}]`)
  startAllJobs()
})

export default app
