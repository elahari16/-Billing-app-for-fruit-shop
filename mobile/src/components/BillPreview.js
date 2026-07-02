import { useRef, useState } from 'react'
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'
import ShopWordmark from './ShopWordmark'
import { useLanguage } from '../hooks/useLanguage'

const DOT_COLORS = ['#EF4444', '#F59E0B', '#8B5CF6', '#0EA5E9', '#F97316']
const SCALLOPS = new Array(14).fill(0)

const showAlert = (title, message) =>
  new Promise((resolve) => Alert.alert(title, message, [{ text: 'OK', onPress: resolve }]))

const confirm = (title, message, confirmLabel, cancelLabel) =>
  new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'default', onPress: () => resolve(true) },
    ])
  )

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export default function BillPreview({
  visible,
  onClose,
  customerName,
  customerPhone,
  cart,
  invoiceNumber,
  onFinalize,
}) {
  const { t } = useLanguage()
  const billRef = useRef(null)
  const [isSharing, setIsSharing] = useState(false)
  // Lets the cashier bump receipt text size up/down for readability —
  // mirrors the accessibility "A-/Aa/A+" stepper in the design.
  const [fontScale, setFontScale] = useState(1)

  const grandTotal = cart.reduce((sum, item) => sum + item.rate * item.qty, 0)
  const invoiceLabel = String(invoiceNumber).padStart(4, '0')
  const phoneDigits = (customerPhone || '').replace(/[^0-9]/g, '')
  const hasPhone = phoneDigits.length === 10
  const displayName = customerName || t('walkInCustomer')
  const canShareBill = cart.length > 0 && !isSharing

  const bumpFontScale = (delta) =>
    setFontScale((prev) => Math.min(1.3, Math.max(0.85, +(prev + delta).toFixed(2))))

  // Falls back to the generic OS share sheet (pick WhatsApp/any app, then
  // pick the contact manually) — used whenever we can't hand the cashier
  // a pre-filled WhatsApp chat.
  const shareGeneric = async (uri) => {
    const canShare = await Sharing.isAvailableAsync()
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `P.R.E Fruits Invoice ${invoiceLabel}`,
      })
    }
  }

  // Captures the on-screen receipt view as a PNG (react-native-view-shot).
  // WhatsApp's chat-link API (whatsapp://send?phone=...) can open a chat
  // with a specific number pre-filled, but no public API lets any app
  // auto-attach an image to that chat — so we save the image to the
  // gallery first, then open the chat, and the cashier attaches the
  // just-saved photo manually. Without a phone number (or if saving/
  // WhatsApp isn't available) we fall back to the generic share sheet.
  // Either way, advances the persisted invoice counter and clears the
  // cart once the bill has been handed off.
  const handleShare = async () => {
    if (!billRef.current || cart.length === 0) return

    // This clears the cart and advances the invoice counter — not
    // undoable — so a stray tap shouldn't be able to trigger it silently.
    const confirmed = await confirm(
      t('confirmFinishTitle'),
      t('confirmFinishMessage'),
      t('confirmFinishButton'),
      t('cancel')
    )
    if (!confirmed) return

    setIsSharing(true)
    try {
      const uri = await captureRef(billRef, { format: 'png', quality: 1 })

      let saved = false
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync()
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(uri)
          saved = true
        }
      } catch {
        saved = false
      }

      if (hasPhone && saved) {
        const whatsappUrl = `whatsapp://send?phone=91${phoneDigits}`
        const canOpen = await Linking.canOpenURL(whatsappUrl)
        if (canOpen) {
          await showAlert(t('savedNotifyTitle'), t('savedNotifyWhatsapp'))
          await Linking.openURL(whatsappUrl)
        } else {
          await showAlert(t('savedNotifyTitle'), t('whatsappNotInstalled'))
          await shareGeneric(uri)
        }
      } else {
        if (hasPhone && !saved) {
          await showAlert(t('savedNotifyTitle'), t('galleryPermissionDenied'))
        }
        await shareGeneric(uri)
      }

      onFinalize()
      onClose()
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <LinearGradient colors={['#E9F8EE', '#F7FDF9']} style={styles.flex}>
        <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {t('billPreview')}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {t('billPreviewSubtitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonIcon}>✕</Text>
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.cardShadow}>
              <View ref={billRef} collapsable={false} style={styles.card}>
                <View style={styles.brandRow}>
                  <ShopWordmark />
                  <Text style={[styles.brandSubtitle, { fontSize: 13 * fontScale }]}>
                    {t('freshFruitsDaily')}
                  </Text>
                </View>

                <View style={styles.dashedDivider} />

                <View style={styles.metaRow}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>{t('invoiceNo')}</Text>
                    <Text style={[styles.metaValue, { fontSize: 18 * fontScale }]}>
                      #{invoiceLabel}
                    </Text>
                  </View>
                  <View style={[styles.metaCol, styles.metaColRight]}>
                    <Text style={styles.metaLabel}>{t('date')}</Text>
                    <Text style={[styles.metaValue, { fontSize: 18 * fontScale }]}>
                      {todayLabel()}
                    </Text>
                  </View>
                </View>

                <View style={styles.customerBadge}>
                  <View style={styles.customerAvatar}>
                    <Text style={styles.customerAvatarText}>
                      {displayName.trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.customerTextBlock}>
                    <Text style={styles.customerLabel}>{t('customer')}</Text>
                    <Text
                      style={[styles.customerName, { fontSize: 15 * fontScale }]}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    {hasPhone && (
                      <Text style={styles.customerPhone}>
                        {t('phoneLabel')}: {phoneDigits}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, styles.colItem]}>{t('item')}</Text>
                  <Text style={[styles.th, styles.colNum]}>{t('rateCol')}</Text>
                  <Text style={[styles.th, styles.colQty]}>{t('qtyCol')}</Text>
                  <Text style={[styles.th, styles.colNum]}>{t('totalCol')}</Text>
                </View>

                {cart.length === 0 ? (
                  <Text style={styles.noItems}>{t('noItemsAdded')}</Text>
                ) : (
                  cart.map((item, index) => (
                    <View key={item.id} style={styles.tableRow}>
                      <View style={[styles.colItem, styles.itemNameRow]}>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: DOT_COLORS[index % DOT_COLORS.length] },
                          ]}
                        />
                        <Text
                          style={[styles.tdName, { fontSize: 15 * fontScale }]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </View>
                      <Text style={[styles.td, styles.colNum, { fontSize: 14 * fontScale }]}>
                        ₹{item.rate.toFixed(2)}
                      </Text>
                      <Text style={[styles.td, styles.colQty, { fontSize: 14 * fontScale }]}>
                        {item.qty}
                      </Text>
                      <Text
                        style={[styles.tdTotal, styles.colNum, { fontSize: 14 * fontScale }]}
                      >
                        ₹{(item.rate * item.qty).toFixed(2)}
                      </Text>
                    </View>
                  ))
                )}

                <LinearGradient
                  colors={['#12813F', '#1FA65A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.grandTotalCard}
                >
                  <View style={styles.grandTotalDecorA} />
                  <View style={styles.grandTotalDecorB} />
                  <View>
                    <Text style={styles.grandTotalLabel}>{t('grandTotal')}</Text>
                    <Text style={styles.grandTotalCount}>
                      {cart.length} {t('itemsCount')}
                    </Text>
                  </View>
                  <Text style={[styles.grandTotalValue, { fontSize: 30 * fontScale }]}>
                    ₹{grandTotal.toFixed(2)}
                  </Text>
                </LinearGradient>

                <View style={styles.dashedDivider} />

                <View style={styles.footerRow}>
                  <View style={styles.footerIconBox}>
                    <Text style={styles.footerIcon}>📞</Text>
                  </View>
                  <Text style={styles.footerText}>{t('contact')}: 9952538355</Text>
                </View>
                <View style={styles.footerRow}>
                  <View style={styles.footerIconBox}>
                    <Text style={styles.footerIconG}>G</Text>
                  </View>
                  <Text style={styles.footerText}>{t('gpay')}: 6382464670</Text>
                </View>
                <View style={[styles.footerRow, styles.footerRowTop]}>
                  <View style={styles.footerIconBox}>
                    <Text style={styles.footerIcon}>📍</Text>
                  </View>
                  <Text style={styles.footerAddress}>
                    R.இளங்கோவன் பழக்கடை, (கிருஷ்ணா ஸ்வீட் அருகில்) 1337, தெற்கு
                    அலங்கம், பழைய பஸ்ஸ்டாண்ட் அருகில், தஞ்சாவூர்.
                  </Text>
                </View>

                <Text style={styles.thankYou}>{t('thankYou')}</Text>

                <View style={styles.scallopRow}>
                  {SCALLOPS.map((_, index) => (
                    <View key={index} style={styles.scallop} />
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <View style={styles.fontStepperRow}>
              <View style={styles.fontStepper}>
                <TouchableOpacity
                  onPress={() => bumpFontScale(-0.1)}
                  style={styles.stepperButtonMinus}
                >
                  <Text style={styles.stepperButtonMinusText}>A−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperLabel}>Aa</Text>
                <TouchableOpacity
                  onPress={() => bumpFontScale(0.1)}
                  style={styles.stepperButtonPlus}
                >
                  <Text style={styles.stepperButtonPlusText}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleShare} disabled={!canShareBill} activeOpacity={0.85}>
              <LinearGradient
                colors={canShareBill ? ['#17A94F', '#0E7A3C'] : ['#d1d5db', '#d1d5db']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shareButton}
              >
                <View style={styles.shareIconCircle}>
                  <Text style={styles.shareIconText}>↑</Text>
                </View>
                <Text style={styles.shareButtonText}>
                  {isSharing
                    ? t('preparing')
                    : hasPhone
                    ? t('sendWhatsapp')
                    : t('shareFinish')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTextBlock: {
    flexShrink: 1,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 24,
    color: '#10331F',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#159A4E',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 2,
    borderColor: '#159A4E',
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  closeButtonIcon: {
    fontSize: 13,
    color: '#159A4E',
    fontWeight: '800',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#159A4E',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cardShadow: {
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#10502C',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingTop: 22,
    paddingHorizontal: 22,
  },
  brandRow: {
    alignItems: 'center',
  },
  brandSubtitle: {
    marginTop: 8,
    fontWeight: '700',
    color: '#159A4E',
  },
  dashedDivider: {
    marginVertical: 16,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CFE6D8',
  },
  metaRow: {
    flexDirection: 'row',
  },
  metaCol: {
    flex: 1,
  },
  metaColRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#4C5C52',
  },
  metaValue: {
    marginTop: 3,
    fontWeight: '800',
    color: '#10331F',
  },
  customerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E1F1E6',
    borderRadius: 16,
    backgroundColor: '#F1FAF3',
  },
  customerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DBF0E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    fontWeight: '800',
    fontSize: 15,
    color: '#159A4E',
  },
  customerTextBlock: {
    flexShrink: 1,
  },
  customerLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#5C6B61',
  },
  customerName: {
    fontWeight: '700',
    color: '#2A3A31',
  },
  customerPhone: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    color: '#5C6B61',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderColor: '#EDF5EF',
  },
  th: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#159A4E',
  },
  colItem: {
    flex: 1.5,
    minWidth: 0,
  },
  colNum: {
    flex: 1,
    textAlign: 'right',
  },
  colQty: {
    flex: 0.7,
    textAlign: 'right',
  },
  noItems: {
    marginTop: 12,
    textAlign: 'center',
    color: '#9ca3af',
    paddingVertical: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E7F1EA',
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    flexShrink: 0,
  },
  tdName: {
    flexShrink: 1,
    fontWeight: '800',
    color: '#1B2C22',
  },
  td: {
    fontWeight: '600',
    color: '#4C5C52',
  },
  tdTotal: {
    fontWeight: '800',
    color: '#10331F',
  },
  grandTotalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#12813F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  grandTotalDecorA: {
    position: 'absolute',
    right: -14,
    top: -22,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  grandTotalDecorB: {
    position: 'absolute',
    right: 36,
    bottom: -30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
  },
  grandTotalCount: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
  },
  grandTotalValue: {
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  footerRowTop: {
    alignItems: 'flex-start',
  },
  footerIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#F1FAF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerIcon: {
    fontSize: 14,
  },
  footerIconG: {
    fontSize: 14,
    fontWeight: '900',
    color: '#159A4E',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3C4A41',
  },
  footerAddress: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    color: '#5C6B61',
  },
  thankYou: {
    marginTop: 18,
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#159A4E',
  },
  scallopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -22,
    marginBottom: -7,
  },
  scallop: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F7FDF9',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  fontStepperRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  fontStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderWidth: 1.5,
    borderColor: '#EAF3EC',
    borderRadius: 999,
    backgroundColor: '#fff',
    shadowColor: '#10502C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  stepperButtonMinus: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonMinusText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#0E7A3C',
  },
  stepperLabel: {
    minWidth: 32,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
    color: '#5C6B61',
  },
  stepperButtonPlus: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#159A4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonPlusText: {
    fontWeight: '700',
    fontSize: 15,
    color: '#fff',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: 20,
  },
  shareIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  shareIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
})
