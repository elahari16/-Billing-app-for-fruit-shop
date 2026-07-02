import { useMemo, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { FRUIT_PRESETS } from '../data/fruits'
import { useLanguage } from '../hooks/useLanguage'
import { colors, shadow, radius } from '../theme'

// Tapping the field opens a dropdown listing every stocked fruit; typing
// filters that list to names starting with what's been typed so far
// (e.g. "A" -> Apple). Picking a row fills the name in the active
// language. Closing on blur is delayed slightly so a row's onPress has
// time to register before the list disappears.
export default function FruitAutocomplete({ value, onChangeText, onSelectFruit, placeholder }) {
  const { language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const closeTimer = useRef(null)

  // Matches against both languages' names — not just the active one — so
  // leftover text typed before a language switch (e.g. "App" in English)
  // doesn't filter out every fruit once the display language changes to
  // Tamil and the query no longer matches any Tamil name.
  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (query === '') return FRUIT_PRESETS
    return FRUIT_PRESETS.filter(
      (fruit) =>
        fruit.nameEn.toLowerCase().startsWith(query) ||
        fruit.nameTa.toLowerCase().startsWith(query)
    )
  }, [value])

  const handleBlur = () => {
    closeTimer.current = setTimeout(() => setIsOpen(false), 150)
  }

  const handleSelect = (fruit) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    onSelectFruit(fruit)
    setIsOpen(false)
  }

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        style={styles.input}
      />
      {isOpen && (
        <View style={styles.dropdown}>
          {suggestions.length === 0 ? (
            <Text style={styles.emptyText}>—</Text>
          ) : (
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {suggestions.map((fruit) => (
                <TouchableOpacity
                  key={fruit.nameEn}
                  onPress={() => handleSelect(fruit)}
                  style={styles.row}
                >
                  <Text style={styles.emoji}>{fruit.emoji}</Text>
                  <Text style={styles.rowText}>
                    {language === 'ta' ? fruit.nameTa : fruit.nameEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.field,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: '700',
    color: colors.bodyText,
  },
  dropdown: {
    marginTop: 8,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    maxHeight: 280,
    overflow: 'hidden',
    ...shadow.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.rowDivider,
  },
  emoji: {
    fontSize: 22,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.heading,
  },
  emptyText: {
    padding: 14,
    textAlign: 'center',
    color: '#9ca3af',
  },
})
