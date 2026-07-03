import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useAuth } from '../../shared/context/AuthContext'
import { AccountStackParamList } from '../../navigation/RootNavigator'
import { colors, typography, spacing, shadows } from '../../shared/theme/tokens'

type AccountNavProp = NativeStackNavigationProp<AccountStackParamList, 'AccountHome'>

/**
 * AccountHomeScreen
 *
 * Displays user identity (handle, verification badges) and links to
 * account management screens. Stripe Connect is surfaced here as a
 * non-blocking nudge card — never as a gate.
 */
export function AccountHomeScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<AccountNavProp>()
  const { user, signOut } = useAuth()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[8] }
      ]}
    >
      {/* Identity section */}
      <View style={styles.identityCard}>
        <Text style={styles.handle}>@{user?.handle ?? '—'}</Text>
        <View style={styles.badges}>
          {user?.phoneVerified && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓ Phone verified</Text>
            </View>
          )}
          {user?.paymentVerified && (
            <View style={[styles.badge, styles.paymentBadge]}>
              <Text style={[styles.badgeText, styles.paymentBadgeText]}>✓ Payments connected</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stripe Connect nudge — shown only when not yet connected */}
      {/* This is informational only. It does not gate any action. */}
      {!user?.paymentVerified && (
        <TouchableOpacity
          style={styles.nudgeCard}
          onPress={() => navigation.navigate('PaymentSetup')}
          activeOpacity={0.85}
        >
          <View style={styles.nudgeContent}>
            <Text style={styles.nudgeTitle}>Accept in-app payments</Text>
            <Text style={styles.nudgeBody}>
              Connect a bank account so people can pay you before pickup.
              Builds trust and closes deals faster.
            </Text>
            <Text style={styles.nudgeAction}>Set up payments →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Navigation items */}
      <View style={styles.section}>
        <MenuItem
          label="My listings"
          onPress={() => navigation.navigate('MyListings')}
        />
        <MenuItem
          label={user?.paymentVerified ? 'Payment settings' : 'Set up payments'}
          onPress={() => navigation.navigate('PaymentSetup')}
        />
        <MenuItem
          label="Notification preferences"
          onPress={() => navigation.navigate('NotificationPrefs')}
        />
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemLabel}>{label}</Text>
      <Text style={styles.menuItemArrow}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
  },
  identityCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing[5],
    gap: spacing[3],
    ...shadows.base,
  },
  handle: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.ink,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  badge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 999,
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    color: colors.success,
  },
  paymentBadge: {
    backgroundColor: colors.accentLight,
  },
  paymentBadgeText: {
    color: colors.accentDark,
  },
  nudgeCard: {
    backgroundColor: colors.accentLight,
    borderRadius: 10,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.accent,
  },
  nudgeContent: {
    gap: spacing[2],
  },
  nudgeTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.ink,
  },
  nudgeBody: {
    fontSize: typography.sm,
    color: colors.inkMuted,
    lineHeight: typography.sm * 1.5,
  },
  nudgeAction: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.accent,
    marginTop: spacing[1],
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLabel: {
    fontSize: typography.base,
    color: colors.ink,
  },
  menuItemArrow: {
    fontSize: typography.xl,
    color: colors.inkFaint,
  },
  signOutButton: {
    padding: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  signOutText: {
    fontSize: typography.base,
    color: colors.inkMuted,
  },
})
