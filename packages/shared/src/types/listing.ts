export type ListingStatus = 'draft' | 'active' | 'sold' | 'expired' | 'removed'
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'parts'
export type ListingCategory =
  | 'furniture'
  | 'electronics'
  | 'clothing_and_accessories'
  | 'bicycles'
  | 'tools_and_hardware'
  | 'appliances'
  | 'sporting_goods'
  | 'baby_and_kids'
  | 'books_and_media'
  | 'musical_instruments'
  | 'art_and_collectibles'
  | 'garden_and_outdoor'
  | 'pet_supplies'
  | 'services'
  | 'other'

export interface ListingPhoto {
  id: string
  cdnUrl: string
  thumbUrl: string
  sortOrder: number
}

export interface Listing {
  id: string
  sellerId: string
  sellerHandle: string
  sellerPhoneVerified: boolean
  sellerPaymentVerified: boolean
  title: string
  description: string | null
  priceCents: number
  category: ListingCategory
  condition: ListingCondition | null
  locationLat: number
  locationLng: number
  locationLabel: string
  locationRadiusMiles: number
  status: ListingStatus
  photos: ListingPhoto[]
  aiGenerated: boolean
  viewCount: number
  distanceMiles?: number
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface ListingDraft {
  title: string
  description: string
  category: ListingCategory
  condition: ListingCondition
}
