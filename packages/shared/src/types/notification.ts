export type NotificationType =
  | 'message_received'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'payment_completed'
  | 'listing_expiring_soon'
  | 'listing_expired'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  payload: Record<string, string>
  readAt: string | null
  createdAt: string
}

export type OfferStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'withdrawn'

export interface Offer {
  id: string
  listingId: string
  threadId: string
  buyerId: string
  sellerId: string
  amountCents: number
  status: OfferStatus
  expiresAt: string
  createdAt: string
  respondedAt: string | null
}
