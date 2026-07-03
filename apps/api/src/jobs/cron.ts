import cron from 'node-cron'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { supabase, r2, listingsIndex } from '../lib/clients'
import { env } from '../lib/env'
import { logger } from '../lib/logger'

/**
 * Listing expiry job — runs every 15 minutes.
 * Finds active listings past their expires_at and marks them expired.
 * Removes them from Meilisearch.
 */
export function startListingExpiryJob() {
  cron.schedule('*/15 * * * *', async () => {
    logger.info('[cron] Running listing expiry check')
    try {
      const { data: expired, error } = await supabase
        .from('listings')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lte('expires_at', new Date().toISOString())
        .select('id')

      if (error) throw error
      if (!expired?.length) return

      logger.info(`[cron] Expired ${expired.length} listings`)

      // Remove from Meilisearch
      await listingsIndex.deleteDocuments(expired.map((l) => l.id))

      // Notify sellers (fire and forget)
      for (const listing of expired) {
        await supabase.from('notifications').insert({
          listing_id: listing.id,
          type: 'listing_expired',
          payload: { listing_id: listing.id },
        })
      }
    } catch (err) {
      logger.error('[cron] Listing expiry error', { err })
    }
  })
}

/**
 * Photo deletion job — runs every hour.
 * Physically deletes photos from R2 where delete_at has passed.
 */
export function startPhotoDeletionJob() {
  cron.schedule('0 * * * *', async () => {
    logger.info('[cron] Running photo deletion')
    try {
      const { data: photos, error } = await supabase
        .from('photos')
        .select('id, r2_key, r2_thumb_key')
        .lte('delete_at', new Date().toISOString())
        .is('deleted_at', null)
        .limit(500)

      if (error) throw error
      if (!photos?.length) return

      logger.info(`[cron] Deleting ${photos.length} photos from R2`)

      for (const photo of photos) {
        await Promise.allSettled([
          r2.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: `full/${photo.r2_key}` })),
          r2.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: `thumbs/${photo.r2_thumb_key}` })),
        ])

        await supabase
          .from('photos')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', photo.id)
      }

      logger.info(`[cron] Photo deletion complete`)
    } catch (err) {
      logger.error('[cron] Photo deletion error', { err })
    }
  })
}

/**
 * Offer expiry job — runs every 30 minutes.
 * Marks pending offers past expires_at as expired.
 */
export function startOfferExpiryJob() {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const { data: expired } = await supabase
        .from('offers')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lte('expires_at', new Date().toISOString())
        .select('id, buyer_id')

      if (expired?.length) {
        logger.info(`[cron] Expired ${expired.length} offers`)
      }
    } catch (err) {
      logger.error('[cron] Offer expiry error', { err })
    }
  })
}

export function startAllJobs() {
  startListingExpiryJob()
  startPhotoDeletionJob()
  startOfferExpiryJob()
  logger.info('[cron] All scheduled jobs started')
}
