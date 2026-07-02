import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import FruitAutocomplete from './FruitAutocomplete'
import { useLanguage } from '../hooks/useLanguage'
import { colors, gradients, shadow, radius } from '../theme'

const emptyDraft = { name: '', rate: '', qty: '' }
const DOT_COLORS = ['#EF4444', '#F59E0B', '#8B5CF6', '#0EA5E9', '#F97316']

export default function BillingForm({
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  cart,
  onAddItem,
  onRemoveItem,
}) {
  const { language, t } = useLanguage()

  // Draft state for the item currently being keyed in. Kept separate from
  // the cart so preset taps, manual typing, and "Add to Bill" can all
  // mutate it before it becomes a committed line item.
  const [draft, setDraft] = useState(emptyDraft)
  const [showAdded, setShowAdded] = useState(false)
  const addedTimer = useRef(null)

  useEffect(() => () => clearTimeout(addedTimer.current), [])

  const handleSelectFruit = (fruit) => {
    setDraft({ name: language === 'ta' ? fruit.nameTa : fruit.nameEn, rate: '', qty: '' })
  }

  const canAdd =
    draft.name.trim() !== '' && Number(draft.rate) > 0 && Number(draft.qty) > 0

  const handleAddToBill = () => {
    if (!canAdd) return
    onAddItem({
      id: `${Date.now()}-${Math.random()}`,
      name: draft.name.trim(),
      rate: Number(draft.rate),
      qty: Number(draft.qty),
    })
    setDraft(emptyDraft)

    // Brief confirmation so the cashier knows the tap registered before
    // moving on to the next item.
    setShowAdded(true)
    clearTimeout(addedTimer.current)
    addedTimer.current = setTimeout(() => setShowAdded(false), 1800)
  }

  // Confirms before removing — a stray tap shouldn't silently delete a
  // line item with no way back.
  const handleRemove = (id) => {
    Alert.alert(t('confirmRemoveTitle'), t('confirmRemoveMessage'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('remove').replace('✕', '').trim(), style: 'destructive', onPress: () => onRemoveItem(id) },
    ])
  }

  return (
    <View style={{ gap: 20 }}>
      <View style={styles.fieldCard}>
        <Text style={styles.label}>{t('customerName')}</Text>
        <TextInput
          value={customerName}
          onChangeText={onCustomerNameChange}
          placeholder={t('customerNamePlaceholder')}
          placeholderTextColor="#9ca3af"
          style={styles.input}
        />
      </View>

      <View style={styles.fieldCard}>
        <Text style={styles.label}>{t('customerPhone')}</Text>
        <TextInput
          value={customerPhone}
          onChangeText={(text) => onCustomerPhoneChange(text.replace(/[^0-9]/g, ''))}
          placeholder={t('customerPhonePlaceholder')}
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          maxLength={10}
          style={styles.input}
        />
      </View>

      <View style={styles.addItemBox}>
        <Text style={styles.boxHeading}>{t('addItem')}</Text>

        <Text style={styles.fieldLabel}>{t('fruitName')}</Text>
        <FruitAutocomplete
          value={draft.name}
          onChangeText={(text) => setDraft((prev) => ({ ...prev, name: text }))}
          onSelectFruit={handleSelectFruit}
          placeholder={t('fruitNamePlaceholder')}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>{t('rateLabel')}</Text>
            <TextInput
              value={draft.rate}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, rate: text }))}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>{t('qtyLabel')}</Text>
            <TextInput
              value={draft.qty}
              onChangeText={(text) => setDraft((prev) => ({ ...prev, qty: text }))}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>
        </View>

        <TouchableOpacity onPress={handleAddToBill} disabled={!canAdd} activeOpacity={0.85}>
          <LinearGradient
            colors={canAdd ? gradients.button : [colors.disabled, colors.disabled]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>{t('addToBill')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!canAdd && draft.name.trim() !== '' && (
          <Text style={styles.addItemHint}>{t('addItemHint')}</Text>
        )}

        {showAdded && (
          <View style={styles.addedBanner}>
            <Text style={styles.addedBannerText}>✓ {t('itemAdded')}</Text>
          </View>
        )}
      </View>

      <View>
        <Text style={styles.boxHeading}>{t('currentCart')}</Text>
        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>{t('noItemsYet')}</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {cart.map((item, index) => (
              <View key={item.id} style={styles.cartRow}>
                <View
                  style={[styles.dot, { backgroundColor: DOT_COLORS[index % DOT_COLORS.length] }]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemMeta}>
                    ₹{item.rate.toFixed(2)} × {item.qty} kg = ₹
                    {(item.rate * item.qty).toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>{t('remove')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fieldCard: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 16,
    ...shadow.soft,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.label,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.label,
    marginBottom: 6,
    marginTop: 12,
  },
  boxHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.heading,
    marginBottom: 10,
  },
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
  addItemBox: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 18,
    ...shadow.soft,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    marginTop: 18,
    borderRadius: radius.field,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow.button,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  addItemHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: colors.mutedLight,
  },
  addedBanner: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    backgroundColor: colors.surfaceTint,
  },
  addedBannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  emptyCart: {
    borderWidth: 1.5,
    borderColor: colors.divider,
    borderStyle: 'dashed',
    borderRadius: radius.card,
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  emptyCartText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.disabledText,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 14,
    ...shadow.soft,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.heading,
  },
  cartItemMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.mutedLight,
    marginTop: 2,
  },
  removeButton: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  removeButtonText: {
    color: colors.dangerText,
    fontSize: 13,
    fontWeight: '800',
  },
})
