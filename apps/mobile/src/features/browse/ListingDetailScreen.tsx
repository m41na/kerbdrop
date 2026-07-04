import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { Image } from 'expo-image'
import { BrowseStackParamList } from '../../navigation/RootNavigator'
import { colors, typography, spacing, radius, shadows } from '../../shared/theme/tokens'
import { formatCents, timeAgo, CONDITION_LABELS, CATEGORY_LABELS } from '@kerbdrop/shared'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
const { width: SCREEN_WIDTH } = Dimensions.get('window')

type DetailRouteProp = RouteProp<BrowseStackParamList, 'ListingDetail'>

interface ListingDetail {
  id: string
  title: string
  description: string | null
  price_cents: number
  category: string
  condition: string | null
  location_label: string
  status: string
  photo_count: number
  view_count: number
  created_at: string
  expires_at: string
  photos?: Array<{ id: string; cdn_url: string; thumb_url: string; sort_order: number }>
  users: {
    handle: string
    phone_verified: boolean
    payment_verified: boolean
  }
}

export function ListingDetailScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute<DetailRouteProp>()
  const { listingId } = route.params

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    fetchListing()
  }, [listingId])

  async function fetchListing() {
    try {
      const res = await fetch(`${API_URL}/api/v1/listings/${listingId}`)
      const json = await res.json()
      if (json.success) {
        setListing(json.data)
      } else {
        setError('This listing is no longer available.')
      }
    } catch {
      setError('Could not load listing. Check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `${listing?.title} — ${formatCents(listing?.price_cents ?? 0)} on KerbDrop`,
        url: `https://kerbdrop.com/listing/${listingId}`,
      })
    } catch {}
  }

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  if (error || !listing) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error ?? 'Listing not found.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonFallback}>
          <Text style={styles.backButtonFallbackText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const seller = listing.users
  const photos = listing.photos ?? []
  const hasPhotos = photos.length > 0

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo area */}
        <View style={styles.photoArea}>
          {hasPhotos ? (
            <>
              <Image
                source={{ uri: photos[photoIndex]?.cdn_url }}
                style={styles.mainPhoto}
                contentFit="cover"
              />
              {photos.length > 1 && (
                <View style={styles.photoDots}>
                  {photos.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                      <View style={[styles.dot, i === photoIndex && styles.dotActive]} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noPhoto}>
              <Text style={styles.noPhotoText}>No photos</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Price and title */}
          <Text style={styles.price}>{formatCents(listing.price_cents)}</Text>
          <Text style={styles.title}>{listing.title}</Text>

          {/* Seller badges */}
          <View style={styles.badges}>
            {seller.phone_verified && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Phone verified</Text>
              </View>
            )}
            {seller.payment_verified && (
              <View style={[styles.badge, styles.paymentBadge]}>
                <Text style={[styles.badgeText, styles.paymentBadgeText]}>✓ Accepts payments</Text>
              </View>
            )}
          </View>

          {/* Meta */}
          <View style={styles.metaRow}>
            {listing.condition && (
              <Text style={styles.metaText}>
                {CONDITION_LABELS[listing.condition] ?? listing.condition}
              </Text>
            )}
            <Text style={styles.metaDivider}>·</Text>
            <Text style={styles.metaText}>{CATEGORY_LABELS[listing.category] ?? listing.category}</Text>
            <Text style={styles.metaDivider}>·</Text>
            <Text style={styles.metaText}>{listing.location_label}</Text>
          </View>
          <Text style={styles.timeAgo}>Listed {timeAgo(listing.created_at)}</Text>

          {/* Description */}
          {listing.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}

          {/* Seller info */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionLabel}>Seller</Text>
            <Text style={styles.sellerHandle}>@{seller.handle}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing[2] }]}>
        <TouchableOpacity style={styles.messageButton}>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        {seller.payment_verified && (
          <TouchableOpacity style={styles.offerButton}>
            <Text style={styles.offerButtonText}>Make an offer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
    backgroundColor: colors.surface,
  },
  headerButton: { padding: spacing[2] },
  headerButtonText: { fontSize: typography.base, color: colors.accent, fontWeight: typography.medium },
  photoArea: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75, backgroundColor: colors.surfaceAlt },
  mainPhoto: { width: '100%', height: '100%' },
  noPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noPhotoText: { fontSize: typography.base, color: colors.inkFaint },
  photoDots: { position: 'absolute', bottom: spacing[3], left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: spacing[1] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white, opacity: 0.5 },
  dotActive: { opacity: 1 },
  body: { padding: spacing[5], gap: spacing[3] },
  price: { fontSize: typography['3xl'], fontWeight: typography.bold, color: colors.ink },
  title: { fontSize: typography.xl, fontWeight: typography.medium, color: colors.ink, lineHeight: typography.xl * 1.3 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  badge: { backgroundColor: colors.successLight, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full },
  badgeText: { fontSize: typography.xs, fontWeight: typography.medium, color: colors.success },
  paymentBadge: { backgroundColor: colors.accentLight },
  paymentBadgeText: { color: colors.accentDark },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing[1] },
  metaText: { fontSize: typography.sm, color: colors.inkMuted },
  metaDivider: { fontSize: typography.sm, color: colors.inkFaint },
  timeAgo: { fontSize: typography.sm, color: colors.inkFaint },
  descriptionSection: { gap: spacing[2], paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.border },
  sectionLabel: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: typography.base, color: colors.ink, lineHeight: typography.base * 1.6 },
  sellerSection: { gap: spacing[2], paddingTop: spacing[2], borderTopWidth: 1, borderTopColor: colors.border },
  sellerHandle: { fontSize: typography.base, fontWeight: typography.medium, color: colors.ink },
  actionBar: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  messageButton: { flex: 1, backgroundColor: colors.ink, padding: spacing[4], borderRadius: radius.base, alignItems: 'center' },
  messageButtonText: { color: colors.white, fontSize: typography.base, fontWeight: typography.semibold },
  offerButton: { flex: 1, backgroundColor: colors.accent, padding: spacing[4], borderRadius: radius.base, alignItems: 'center' },
  offerButtonText: { color: colors.white, fontSize: typography.base, fontWeight: typography.semibold },
  errorText: { fontSize: typography.base, color: colors.inkMuted, textAlign: 'center', marginBottom: spacing[4] },
  backButtonFallback: { padding: spacing[4] },
  backButtonFallbackText: { fontSize: typography.base, color: colors.accent },
})
