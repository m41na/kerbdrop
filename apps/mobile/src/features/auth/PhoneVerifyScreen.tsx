import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, typography, spacing } from '../../shared/theme/tokens'

export function PhoneVerifyScreen() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.placeholder}>PhoneVerifyScreen</Text>
      <Text style={styles.note}>// TODO: implement</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  placeholder: { fontSize: typography.xl, fontWeight: typography.semibold, color: colors.ink },
  note: { fontSize: typography.sm, color: colors.inkFaint, marginTop: spacing[2] },
})
