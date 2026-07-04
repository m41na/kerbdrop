import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { useLocation } from '../../shared/context/LocationContext'
import { colors, typography, spacing, radius } from '../../shared/theme/tokens'

export function LocationSetupScreen() {
  const insets = useSafeAreaInsets()
  const { requestPermission, setManualLocation } = useLocation()

  // Track loading state locally — not from context
  // so the button only spins when the user has tapped it
  const [isRequestingGPS, setIsRequestingGPS] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleGrantPermission() {
    setError(null)
    setIsRequestingGPS(true)
    try {
      const granted = await requestPermission()
      if (granted) {
        await SplashScreen.hideAsync()
      } else {
        // Permission denied — drop into manual entry
        setShowManual(true)
      }
    } finally {
      setIsRequestingGPS(false)
    }
  }

  async function handleManualEntry() {
    if (!cityInput.trim()) return
    setIsGeocoding(true)
    setError(null)
    try {
      const query = encodeURIComponent(cityInput.trim())
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { 'User-Agent': 'KerbDrop/1.0' } }
      )
      const results = await res.json()

      if (!results || results.length === 0) {
        setError('Location not found. Try a city name or zip code.')
        return
      }

      const { lat, lon, display_name } = results[0]
      const label = display_name.split(',').slice(0, 2).join(',').trim()
      await setManualLocation(label, parseFloat(lat), parseFloat(lon))
      await SplashScreen.hideAsync()
    } catch {
      setError('Could not look up that location. Check your connection.')
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[
        styles.container,
        { paddingTop: insets.top + spacing[8], paddingBottom: insets.bottom + spacing[6] }
      ]}>
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulseOuter} />
            <View style={styles.pulseInner} />
          </View>
          <Text style={styles.title}>What's near you?</Text>
          <Text style={styles.body}>
            KerbDrop shows you listings within a few miles. Share your location or type in your neighborhood.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!showManual ? (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleGrantPermission}
                disabled={isRequestingGPS}
              >
                {isRequestingGPS ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Use my location</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowManual(true)}
              >
                <Text style={styles.secondaryButtonText}>Type in my neighborhood</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>City, neighborhood, or zip code</Text>
              <TextInput
                style={styles.input}
                value={cityInput}
                onChangeText={setCityInput}
                placeholder="e.g. Brooklyn, NY"
                placeholderTextColor={colors.inkFaint}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleManualEntry}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.primaryButton, !cityInput.trim() && styles.primaryButtonDisabled]}
                onPress={handleManualEntry}
                disabled={!cityInput.trim() || isGeocoding}
              >
                {isGeocoding ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Find listings nearby</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => { setShowManual(false); setError(null) }}
              >
                <Text style={styles.secondaryButtonText}>← Use my location instead</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing[6],
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[4],
  },
  pulseContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  pulseOuter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentLight,
  },
  pulseInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.ink,
  },
  body: {
    fontSize: typography.lg,
    color: colors.inkMuted,
    lineHeight: typography.lg * 1.6,
  },
  actions: {
    gap: spacing[3],
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.inkMuted,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    padding: spacing[4],
    fontSize: typography.base,
    color: colors.ink,
  },
  errorText: {
    fontSize: typography.sm,
    color: colors.error,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    padding: spacing[4],
    borderRadius: radius.base,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: colors.inkFaint,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
  secondaryButton: {
    padding: spacing[4],
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.inkMuted,
    fontSize: typography.base,
  },
})
