import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRiderOrderStore } from '../../store/orderStore';
import {
  updateOrderStatus,
  STATUS_FLOW,
  STATUS_LABELS,
  STATUS_ICONS,
} from '../../services/orderActions';

const STATUS_COLORS: Record<string, string> = {
  placed: '#F59E0B',
  accepted: '#3B82F6',
  preparing: '#8B5CF6',
  out_for_delivery: '#10B981',
  delivered: '#22C55E',
  cancelled: '#EF4444',
};

const STEPS = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];

function StatusStepper({ current }: { current: string }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <View style={styles.stepperWrap}>
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const isActive = idx === currentIdx;
        return (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  isActive && styles.stepDotActive,
                ]}
              >
                {done && (
                  <Ionicons
                    name={isActive ? 'ellipse' : 'checkmark'}
                    size={12}
                    color="#fff"
                  />
                )}
              </View>
              {idx < STEPS.length - 1 && (
                <View
                  style={[styles.stepLine, idx < currentIdx && styles.stepLineDone]}
                />
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                isActive && styles.stepLabelActive,
                idx < currentIdx && styles.stepLabelDone,
              ]}
            >
              {step.replace(/_/g, ' ')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const order = useRiderOrderStore((s) => (id ? s.getOrder(id) : undefined));
  const [loading, setLoading] = useState(false);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Order not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const nextStatus = STATUS_FLOW[order.status];
  const statusColor = STATUS_COLORS[order.status] || '#0f766e';

  const handleStatusUpdate = () => {
    if (!nextStatus) return;
    Alert.alert(
      STATUS_LABELS[order.status],
      `Update order #${order.id.slice(-6).toUpperCase()} to "${nextStatus.replace(/_/g, ' ')}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              await updateOrderStatus(order.id, nextStatus);
              if (nextStatus === 'delivered') {
                Alert.alert('🎉 Delivered!', 'Order marked as delivered.', [
                  { text: 'Back to Orders', onPress: () => router.back() },
                ]);
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to update status. Check your connection.');
              console.error(err);
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.headerBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.headerBadgeText, { color: statusColor }]}>
            {order.status.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Status Stepper */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Progress</Text>
          <StatusStepper current={order.status} />
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deliver to</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color="#0f766e" />
            <Text style={styles.address}>{order.address}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.qty}>{item.quantity}×</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.addons && item.addons.length > 0 && (
                  <Text style={styles.addons}>
                    + {item.addons.map((a) => a.name).join(', ')}
                  </Text>
                )}
              </View>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Ionicons
              name={order.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'}
              size={20}
              color="#0f766e"
            />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.paymentText}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online — Already paid'}
              </Text>
              {order.paymentMethod === 'cod' && (
                <Text style={styles.collectNote}>
                  Collect ₹{order.total} from customer at doorstep.
                </Text>
              )}
            </View>
            <Text style={styles.totalBig}>
              ₹{order.paymentMethod === 'cod' ? order.total : 0}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Action Button */}
      {nextStatus && order.status !== 'cancelled' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              order.status === 'out_for_delivery' && styles.actionBtnGreen,
              loading && styles.actionBtnDisabled,
            ]}
            onPress={handleStatusUpdate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={STATUS_ICONS[order.status] as any}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.actionBtnText}>{STATUS_LABELS[order.status]}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'delivered' && (
        <View style={styles.footer}>
          <View style={styles.deliveredBadge}>
            <Ionicons name="checkmark-done-circle" size={22} color="#22C55E" />
            <Text style={styles.deliveredText}>Order Delivered ✓</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  back: { fontSize: 14, color: '#0f766e', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: { marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111827' },
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  scroll: { padding: 16, paddingBottom: 32 },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepperWrap: { gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepLeft: { alignItems: 'center', width: 24, marginRight: 10 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: '#10B981' },
  stepDotActive: { backgroundColor: '#0f766e' },
  stepLine: { width: 2, height: 24, backgroundColor: '#e5e7eb', marginVertical: 2 },
  stepLineDone: { backgroundColor: '#10B981' },
  stepLabel: { fontSize: 13, color: '#9ca3af', paddingTop: 4, marginBottom: 18, textTransform: 'capitalize' },
  stepLabelActive: { color: '#0f766e', fontWeight: '700' },
  stepLabelDone: { color: '#111827' },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  address: { flex: 1, fontSize: 14, color: '#4b5563', marginLeft: 6, lineHeight: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#f3f4f6' },
  qty: { width: 24, fontSize: 14, fontWeight: '700', color: '#0f766e' },
  itemName: { fontSize: 14, color: '#111827' },
  addons: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#111827' },
  paymentRow: { flexDirection: 'row', alignItems: 'flex-start' },
  paymentText: { fontSize: 14, color: '#111827', fontWeight: '600' },
  collectNote: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  totalBig: { fontSize: 18, fontWeight: '800', color: '#111827' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0f766e',
    borderRadius: 14,
    paddingVertical: 14,
  },
  actionBtnGreen: { backgroundColor: '#16a34a' },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  deliveredBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deliveredText: { fontSize: 16, fontWeight: '800', color: '#22C55E' },
});
