export type UserTier = 'free' | 'plus' | 'pro'

export interface User {
  id: string
  handle: string
  phoneVerified: boolean
  paymentVerified: boolean
  stripeAccountId: string | null
  tier: UserTier
  tierExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: number
}
