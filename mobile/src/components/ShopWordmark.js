import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme'

// Typographic wordmark: "P.R.E" / tracked "FRUITS" with rule lines /
// italic "Nature's Candy" tagline — recolored from the source artwork's
// dark background onto our app's light green theme. `compact` shrinks
// everything for header use; the tagline always shows unless explicitly
// hidden via `showTagline={false}`.
export default function ShopWordmark({ compact = false, showTagline = true }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.brand, compact && styles.brandCompact]}>P.R.E</Text>
      <View style={styles.fruitsRow}>
        <View style={[styles.line, compact && styles.lineCompact]} />
        <Text style={[styles.fruits, compact && styles.fruitsCompact]}>FRUITS</Text>
        <View style={[styles.line, compact && styles.lineCompact]} />
      </View>
      {showTagline && (
        <Text style={[styles.tagline, compact && styles.taglineCompact]}>
          Nature's Candy
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'serif',
    fontWeight: '700',
    fontSize: 30,
    color: colors.heading,
    letterSpacing: 1,
  },
  brandCompact: {
    fontSize: 19,
  },
  fruitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 3,
  },
  line: {
    width: 22,
    height: 1,
    backgroundColor: colors.accentGold,
  },
  lineCompact: {
    width: 12,
  },
  fruits: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3.5,
    color: colors.accentGold,
  },
  fruitsCompact: {
    fontSize: 9,
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 5,
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.mutedLight,
  },
  taglineCompact: {
    marginTop: 3,
    fontSize: 10,
  },
})
