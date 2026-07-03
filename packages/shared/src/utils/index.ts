import { PLATFORM_FEE_FLAT_CENTS, PLATFORM_FEE_PERCENTAGE, PLATFORM_FEE_THRESHOLD_CENTS } from '../constants'

// ── Currency ──────────────────────────────────────────────────────────────

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatCentsShort(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}

export function calculatePlatformFee(salePriceCents: number): number {
  if (salePriceCents < PLATFORM_FEE_THRESHOLD_CENTS) {
    return PLATFORM_FEE_FLAT_CENTS
  }
  return Math.round(salePriceCents * PLATFORM_FEE_PERCENTAGE)
}

// ── Distance ──────────────────────────────────────────────────────────────

export function formatDistance(miles: number): string {
  if (miles < 0.1) return 'Less than 0.1 mi'
  if (miles < 10) return `${miles.toFixed(1)} mi`
  return `${Math.round(miles)} mi`
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Time ──────────────────────────────────────────────────────────────────

export function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString()
}

export function daysUntil(isoString: string): number {
  return Math.ceil((new Date(isoString).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

// ── Strings ───────────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 1) + '…'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
