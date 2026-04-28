import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRiderOrderStore } from '../../store/orderStore';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const order = useRiderOrderStore((s) => (id ? s.getOrder(id) : undefined));

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Order not found</Text>
          <Text style={styles.sub}>Go back to the orders list and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={22}
          color="#111827"
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Order #{order.id.slice(-6).toUpperCase()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery address</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color="#0f766e" />
            <Text style={styles.address}>{order.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.qty}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Ionicons
              name={order.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'}
              size={20}
              color="#0f766e"
            />
            <Text style={styles.paymentText}>
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online payment already received'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total to collect</Text>
            <Text style={styles.totalAmount}>₹{order.paymentMethod === 'cod' ? order.total : 0}</Text>
          </View>
          {order.paymentMethod === 'online' && (
            <Text style={styles.note}>Customer has already paid online. You do not need to collect cash.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6b7280' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  content: { padding: 16, paddingBottom: 32 },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  address: { flex: 1, fontSize: 14, color: '#4b5563', marginLeft: 6 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  qty: { width: 24, fontSize: 14, fontWeight: '700', color: '#0f766e' },
  itemName: { flex: 1, fontSize: 14, color: '#111827' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#111827' },
  paymentRow: { flexDirection: 'row', alignItems: 'center' },
  paymentText: { marginLeft: 8, fontSize: 14, color: '#4b5563' },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  totalAmount: { fontSize: 16, fontWeight: '800', color: '#111827' },
  note: { marginTop: 6, fontSize: 12, color: '#6b7280' },
});
