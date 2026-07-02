export type MessageType =
  | 'text'
  | 'offer'
  | 'offer_accepted'
  | 'offer_declined'
  | 'system'

export type ThreadStatus = 'active' | 'archived' | 'blocked'

export interface Message {
  id: string
  threadId: string
  senderId: string
  senderHandle: string
  body: string
  type: MessageType
  offerCents: number | null
  readAt: string | null
  createdAt: string
}

export interface MessageThread {
  id: string
  listingId: string
  listingTitle: string
  listingThumbUrl: string | null
  listingPriceCents: number
  buyerId: string
  buyerHandle: string
  sellerId: string
  sellerHandle: string
  status: ThreadStatus
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  expiresAt: string
  createdAt: string
}
