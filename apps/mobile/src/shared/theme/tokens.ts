import { StyleSheet } from 'react-native'

// ── Color palette ─────────────────────────────────────────────────────────

export const colors = {
  // Surface
  surface:     '#F7F5F0',
  surfaceAlt:  '#EDEAE3',
  border:      '#D4D0C8',

  // Ink
  ink:         '#1A1916',
  inkMuted:    '#6B6760',
  inkFaint:    '#A8A49C',

  // Accent — burnt orange
  accent:      '#E85D26',
  accentLight: '#FDF0EB',
  accentDark:  '#C44A1A',

  // Semantic
  success:      '#2D7D46',
  successLight: '#EBF5EF',
  warning:      '#B45309',
  warningLight: '#FEF3C7',
  error:        '#C0392B',
  errorLight:   '#FDECEA',

  // Utility
  white:       '#FFFFFF',
  transparent: 'transparent',
} as const

// ── Typography ────────────────────────────────────────────────────────────

export const typography = {
  // Font families
  display: 'Georgia',     // Fraunces not available in RN without custom font loading
  body:    'System',      // System font (SF Pro on iOS, Roboto on Android)

  // Size scale
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 30,

  // Weights
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,

  // Line heights
  tight:    1.25,
  normal:   1.5,
  relaxed:  1.65,
} as const

// ── Spacing (8pt grid) ────────────────────────────────────────────────────

export const spacing = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
} as const

// ── Border radius ─────────────────────────────────────────────────────────

export const radius = {
  sm:   4,
  base: 6,
  lg:   10,
  full: 9999,
} as const

// ── Shadows ───────────────────────────────────────────────────────────────

export const shadows = StyleSheet.create({
  sm: {
    shadowColor: '#1A1916',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#1A1916',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1916',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
})

// ── Hit slop (minimum 44pt touch targets) ─────────────────────────────────

export const hitSlop = { top: 12, bottom: 12, left: 12, right: 12 }
