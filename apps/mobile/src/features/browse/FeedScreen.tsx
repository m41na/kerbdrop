import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Image } from 'expo-image'
import { useLocation } from '../../shared/context/LocationContext'
import { useNetwork } from '../../shared/context/NetworkContext'
import { BrowseStackParamList } from '../../navigation/RootNavigator'
import { colors, typography, spacing, shadows, radius } from '../../shared/theme/tokens'
import { formatCentsShort, timeAgo } from '@kerbdrop/shared'

type FeedNavProp = NativeStackNavigationProp<BrowseStackParamList, 'Feed'>

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'furniture', label: 'Furniture' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'bicycles', label: 'Bicycles' },
  { key: 'clothing_and_accessories', label: 'Clothing' },
  { key: 'tools_and_hardware', label: 'Tools' },
  { key: 'appliances', label: 'Appliances' },
  { key: 'sporting_goods', label: 'Sporting Goods' },
  { key: 'baby_and_kids', label: 'Baby & Kids' },
  { key: 'services', label: 'Services' },
  { key: 'other', label: 'Other' },
]

interface Listing {
  id: string
  title: string
  price_cents: number
  category: string
  condition: string
  location_label: string
  thumb_url: string | null
  seller_payment_verified: boolean
  distance_miles: number | null
  created_at: string
}

export function FeedScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<FeedNavProp>()
  const { location } = useLocation()
  const { isConnected } = useNetwork()

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (location) fetchListings()
  }, [location, selectedCategory])

  async function fetchListings(refreshing = false) {
    if (!location) return
    if (refreshing) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const params = new URLSearchParams({
        lat: String(location.lat),
        lng: String(location.lng),
        radiusMiles: String(location.radiusMiles),
        limit: '40',
        page: '0',
      })
      if (selectedCategory !== 'all') params.append('category', selectedCategory)

      const res = await fetch(`${API_URL}/api/v1/listings?${params}`)
      const json = await res.json()
      if (json.success) setListings(json.data)
    } catch (err) {
      console.error('Feed fetch error:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  function renderCard({ item }: { item: Listing }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.photoContainer}>
          {item.thumb_url ? (
            <Image source={{ uri: item.thumb_url }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>No photo</Text>
            </View>
          )}
          {item.seller_payment_verified && (
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.price}>{formatCentsShort(item.price_cents)}</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.distance_miles != null ? `${item.distance_miles} mi · ` : ''}
            {timeAgo(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>No internet connection</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.locationRow}>
          <View style={styles.locationPulse} />
          <Text style={styles.locationLabel}>{location?.label ?? 'Your area'}</Text>
        </View>
      </View>

      <Text style={styles.sortLabel}>
        Sorted by: Nearest first, newest first. Always.
      </Text>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryPill, selectedCategory === item.key && styles.categoryPillActive]}
            onPress={() => setSelectedCategory(item.key)}
          >
            <Text style={[styles.categoryPillText, selectedCategory === item.key && styles.categoryPillTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={listings}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchListings(true)}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing listed nearby yet.</Text>
              <Text style={styles.emptyBody}>Be the first — tap Sell to post something.</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  offlineBanner: { backgroundColor: colors.warning, paddingVertical: spacing[2], alignItems: 'center' },
  offlineBannerText: { fontSize: typography.sm, color: colors.white, fontWeight: typography.medium },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  locationPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  locationLabel: { fontSize: typography.base, fontWeight: typography.medium, color: colors.ink },
  sortLabel: { fontSize: typography.xs, color: colors.inkFaint, paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[1] },
  categoryList: { paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  categoryPill: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, marginRight: spacing[2] },
  categoryPillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  categoryPillText: { fontSize: typography.sm, color: colors.inkMuted, fontWeight: typography.medium },
  categoryPillTextActive: { color: colors.white },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { padding: spacing[3] },
  row: { gap: spacing[3], marginBottom: spacing[3] },
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radius.base, overflow: 'hidden', ...shadows.sm },
  photoContainer: { position: 'relative', aspectRatio: 4 / 3, backgroundColor: colors.surfaceAlt },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { fontSize: typography.xs, color: colors.inkFaint },
  paymentBadge: { position: 'absolute', bottom: spacing[1], right: spacing[1], backgroundColor: colors.success, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  paymentBadgeText: { fontSize: 10, color: colors.white, fontWeight: typography.bold },
  cardInfo: { padding: spacing[2], gap: 2 },
  price: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.ink },
  title: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.ink, lineHeight: typography.sm * 1.4 },
  meta: { fontSize: typography.xs, color: colors.inkFaint, marginTop: 2 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: spacing[8], gap: spacing[2] },
  emptyTitle: { fontSize: typography.xl, fontWeight: typography.semibold, color: colors.ink, textAlign: 'center' },
  emptyBody: { fontSize: typography.base, color: colors.inkMuted, textAlign: 'center', lineHeight: typography.base * 1.5 },
})
