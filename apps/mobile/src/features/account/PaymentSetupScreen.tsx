import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../../shared/context/AuthContext'
import { colors, typography, spacing } from '../../shared/theme/tokens'

/**
 * PaymentSetupScreen
 *
 * Voluntary Stripe Connect onboarding. This screen is reached only through
 * Account → Payment Setup. It is never shown automatically. It is never
 * part of the auth flow. Users can leave at any time with no consequence.
 *
 * Role note: any user can connect Stripe regardless of whether they
 * primarily list items or primarily contact other listers. The platform
 * has no buyer/seller account distinction.
 */
export function PaymentSetupScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle')

  useEffect(() => {
    if (user?.paymentVerified) setStatus('connected')
  }, [user])

  async function handleConnect() {
    setIsLoading(true)
    try {
      // TODO: call GET /api/v1/payments/connect/url
      // Open result in expo-web-browser (required by App Store guidelines —
      // must use ASWebAuthenticationSession, not in-app WebView)
      // On return, refresh user profile to pick up payment_verified = true
    } catch {
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDisconnect() {
    setIsLoading(true)
    try {
      // TODO: call DELETE /api/v1/payments/connect
      // Refresh user profile
    } catch {
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>In-app payments</Text>
      </View>

      <View style={styles.content}>
        {status === 'connected' ? (
          // Connected state
          <>
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedBadgeText}>✓ Payments connected</Text>
            </View>
            <Text style={styles.body}>
              Your listings show the payment verified badge. People contacting you
              can pay through the app before pickup.
            </Text>
            <Text style={styles.feeNote}>
              KerbDrop takes $1.00 on sales under $20, or 5% on sales of $20 and above.
              Stripe fees are included.
            </Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
              disabled={isLoading}
            >
              <Text style={styles.disconnectButtonText}>Disconnect Stripe account</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Not connected state
          <>
            <Text style={styles.heading}>Accept payments before meetup</Text>
            <Text style={styles.body}>
              Connect a bank account through Stripe to accept in-app payments.
              People contacting you see a payment verified badge on your listings,
              which builds trust and speeds up transactions.
            </Text>
            <Text style={styles.body}>
              Cash at pickup always works too — connecting Stripe is optional.
            </Text>
            <Text style={styles.feeNote}>
              KerbDrop takes $1.00 on sales under $20, or 5% on sales of $20 and above.
              Stripe fees are included. You only pay when you receive payment.
            </Text>
            {status === 'error' && (
              <Text style={styles.errorText}>
                Something went wrong. Please try again.
              </Text>
            )}
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.connectButtonText}>Connect bank account via Stripe</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.skipButton}>
              <Text style={styles.skipText}>Not now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing[4],
  },
  backButton: {
    paddingVertical: spacing[2],
  },
  backText: {
    fontSize: typography.base,
    color: colors.accent,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.ink,
  },
  content: {
    flex: 1,
    padding: spacing[6],
    gap: spacing[4],
  },
  connectedBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  connectedBadgeText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.success,
  },
  heading: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.ink,
  },
  body: {
    fontSize: typography.base,
    color: colors.inkMuted,
    lineHeight: typography.base * 1.6,
  },
  feeNote: {
    fontSize: typography.sm,
    color: colors.inkFaint,
    lineHeight: typography.sm * 1.6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[4],
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.error,
  },
  connectButton: {
    backgroundColor: colors.accent,
    padding: spacing[4],
    borderRadius: 6,
    alignItems: 'center',
    marginTop: spacing[2],
  },
  connectButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  skipButton: {
    padding: spacing[4],
    alignItems: 'center',
  },
  skipText: {
    fontSize: typography.base,
    color: colors.inkMuted,
  },
  disconnectButton: {
    padding: spacing[4],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: spacing[4],
  },
  disconnectButtonText: {
    fontSize: typography.base,
    color: colors.inkMuted,
  },
})
