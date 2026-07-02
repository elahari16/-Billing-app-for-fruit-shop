import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import ShopWordmark from './src/components/ShopWordmark'
import BillingForm from './src/components/BillingForm'
import BillPreview from './src/components/BillPreview'
import LanguageToggle from './src/components/LanguageToggle'
import { useInvoiceNumber } from './src/hooks/useInvoiceNumber'
import { LanguageProvider, useLanguage } from './src/hooks/useLanguage'
import { colors, gradients, shadow, radius } from './src/theme'

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SafeAreaProvider>
  )
}

function AppContent() {
  const { t } = useLanguage()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [cart, setCart] = useState([])
  const [invoiceNumber, advanceInvoiceNumber] = useInvoiceNumber()
  const [previewVisible, setPreviewVisible] = useState(false)

  const addItem = (item) => setCart((prev) => [...prev, item])
  const removeItem = (id) => setCart((prev) => prev.filter((item) => item.id !== id))

  const grandTotal = cart.reduce((sum, item) => sum + item.rate * item.qty, 0)
  const canViewBill = cart.length > 0

  // Called after the receipt image has been handed to the share sheet:
  // bump the persisted invoice counter and reset the form so the next
  // customer starts clean.
  const finalizeBill = () => {
    advanceInvoiceNumber()
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
  }

  return (
    <LinearGradient colors={gradients.background} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <StatusBar barStyle="dark-content" backgroundColor="#E9F8EE" />
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <ShopWordmark compact />
            <LanguageToggle />
          </View>
          <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
            {t('appSubtitle')}
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BillingForm
            customerName={customerName}
            onCustomerNameChange={setCustomerName}
            customerPhone={customerPhone}
            onCustomerPhoneChange={setCustomerPhone}
            cart={cart}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />
        </ScrollView>

        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomTotalLabel}>{t('total')}</Text>
            <Text style={styles.bottomTotalValue}>₹{grandTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setPreviewVisible(true)}
            disabled={!canViewBill}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canViewBill ? gradients.button : [colors.disabled, colors.disabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.viewBillButton}
            >
              <Text style={styles.viewBillButtonText}>{t('viewBill')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <BillPreview
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          customerName={customerName}
          customerPhone={customerPhone}
          cart={cart}
          invoiceNumber={invoiceNumber}
          onFinalize={finalizeBill}
        />
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerSubtitle: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...shadow.soft,
  },
  bottomTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.label,
  },
  bottomTotalValue: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: '800',
    color: colors.heading,
  },
  viewBillButton: {
    borderRadius: radius.field,
    paddingHorizontal: 24,
    paddingVertical: 15,
    ...shadow.button,
  },
  viewBillButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
})
