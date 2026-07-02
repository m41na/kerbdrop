import rateLimit from 'express-rate-limit'
import { RATE_LIMITS } from '@kerbdrop/shared'

const makeLimit = (config: { max: number; windowSeconds: number }, message: string) =>
  rateLimit({
    windowMs: config.windowSeconds * 1000,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message } },
  })

export const rateLimits = {
  phoneRequest: makeLimit(RATE_LIMITS.phoneRequest, 'Too many verification requests. Try again in an hour.'),
  listingCreate: makeLimit(RATE_LIMITS.listingCreate, 'Too many listings created. Try again in an hour.'),
  threadCreate: makeLimit(RATE_LIMITS.threadCreate, 'Too many messages sent. Try again in an hour.'),
  messageSend: makeLimit(RATE_LIMITS.messageSend, 'Sending too fast. Slow down.'),
  offerCreate: makeLimit(RATE_LIMITS.offerCreate, 'Too many offers submitted. Try again in an hour.'),
  photoUpload: makeLimit(RATE_LIMITS.photoUpload, 'Too many photo uploads. Try again in an hour.'),
}
