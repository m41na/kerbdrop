import React, { Component, ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { NetworkProvider } from './shared/context/NetworkContext'
import { LocationProvider } from './shared/context/LocationContext'
import { AuthProvider } from './shared/context/AuthContext'
import { RootNavigator } from './navigation/RootNavigator'
import { colors, typography } from './shared/theme/tokens'

// Hold splash screen until auth + location are resolved
SplashScreen.preventAutoHideAsync()

// ── Error boundary ────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong.</Text>
          <Text style={styles.errorMessage}>
            {__DEV__ ? this.state.error?.message : 'Please restart the app.'}
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}

// ── Root ──────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <NetworkProvider>
            <LocationProvider>
              <AuthProvider>
                <StatusBar style="dark" backgroundColor={colors.surface} />
                <RootNavigator />
              </AuthProvider>
            </LocationProvider>
          </NetworkProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.semibold,
    color: colors.ink,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: typography.base,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  errorButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
})
