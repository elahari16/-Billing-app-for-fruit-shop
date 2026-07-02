// Shared design tokens, lifted from the bill preview screen, so every
// screen in the app (header, forms, cart, receipt) reads as one theme
// instead of each component inventing its own greens.
export const colors = {
  bgGradient: ['#E9F8EE', '#F7FDF9'],
  primary: '#159A4E',
  primaryDark: '#0E7A3C',
  primaryDeep: '#12813F',
  heading: '#10331F',
  bodyText: '#2A3A31',
  muted: '#4C5C52',
  mutedLight: '#5C6B61',
  // Darkened from the original design's #7E8D83/#8CA093 — those only hit
  // ~3.5:1 contrast against white, which fails WCAG AA for text this
  // small. These match `muted`/`mutedLight`'s ~7:1 contrast instead.
  label: '#4C5C52',
  labelLight: '#5C6B61',
  border: '#E1F1E6',
  divider: '#CFE6D8',
  rowDivider: '#E7F1EA',
  surfaceTint: '#F1FAF3',
  chipTint: '#EAF7EE',
  avatarTint: '#DBF0E1',
  disabled: '#d1d5db',
  disabledText: '#6b7280',
  danger: '#dc2626',
  dangerText: '#b91c1c',
  white: '#fff',
  // Gold accent for the wordmark's "FRUITS" lockup and rule lines —
  // recolored from the source logo's dark-background gold to sit on
  // our light green theme.
  accentGold: '#B8860B',
}

export const gradients = {
  background: ['#E9F8EE', '#F7FDF9'],
  button: ['#17A94F', '#0E7A3C'],
  total: ['#12813F', '#1FA65A'],
}

export const shadow = {
  card: {
    shadowColor: '#10502C',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  soft: {
    shadowColor: '#10502C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#0E7A3C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
}

export const radius = {
  card: 20,
  field: 16,
  pill: 999,
}
