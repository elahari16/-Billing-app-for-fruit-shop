import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useLanguage } from '../hooks/useLanguage'
import { colors, radius, shadow } from '../theme'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setLanguage('ta')}
        style={[styles.option, language === 'ta' && styles.optionActive]}
      >
        <Text style={[styles.optionText, language === 'ta' && styles.optionTextActive]}>
          தமிழ்
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setLanguage('en')}
        style={[styles.option, language === 'en' && styles.optionActive]}
      >
        <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>
          English
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    ...shadow.soft,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  optionTextActive: {
    color: colors.white,
  },
})
