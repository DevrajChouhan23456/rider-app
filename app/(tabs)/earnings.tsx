import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useRiderAuthStore } from '../../store/riderAuthStore';
import { Order } from '../../store/orderStore';

const DELIVERY_FEE_PER_ORDER = 30; // ₹30 per delivered order

export default function EarningsScreen() {
  const rider = useRiderAuthStore((s) => s.rider);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rider?.uid) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('driverId', '==', rider.uid),
          where('status', '==', 'delivered'),
          orderBy('updatedAt', 'desc')
        );
        const snap = await getDocs(q);
        const orders = snap.docs.map((d) => ({
          ...(d.data() as Omit<Order, 'id'>),
          id: d.id,
        } as Order));
        setDeliveredOrders(orders);
      } catch (err) {
        console.error('fetchEarnings error:', err);
      }
      setLoading(false);
    })();
  }, [rider?.uid]);

  // Compute stats
  const today = new Date().toDateString();
  const todayOrders = deliveredOrders.filter(
    (o) => o.updatedAt && new Date(o.updatedAt).toDateString() === today
  );
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekOrders = deliveredOrders.filter(
    (o) => o.updatedAt && new Date(o.updatedAt) >= weekStart
  );

  const totalEarnings = deliveredOrders.length * DELIVERY_FEE_PER_ORDER;
  const todayEarnings = todayOrders.length * DELIVERY_FEE_PER_ORDER;
  const weekEarnings = weekOrders.length * DELIVERY_FEE_PER_ORDER;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Stats cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statValue}>₹{todayEarnings}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.statValueDark]}>₹{weekEarnings}</Text>
          <Text style={[styles.statLabel, styles.statLabelDark]}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, styles.statValueDark]}>₹{totalEarnings}</Text>
          <Text style={[styles.statLabel, styles.statLabelDark]}>All Time</Text>
        </View>
      </View>

      <View style={styles.rateNote}>
        <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
        <Text style={styles.rateText}>₹{DELIVERY_FEE_PER_ORDER} per delivered order</Text>
      </View>

      <Text style={styles.sectionTitle}>Delivery History</Text>

      {loading ? (
        <ActivityIndicator color="#0f766e" style={{ marginTop: 32 }} />
      ) : deliveredOrders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bicycle-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No deliveries yet</Text>
          <Text style={styles.emptyHint}>Complete deliveries to see earnings here</Text>
        </View>
      ) : (
        <FlatList
          data={deliveredOrders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={styles.orderRow}>
              <View style={styles.orderIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.orderAddr} numberOfLines={1}>{item.address}</Text>
                <Text style={styles.orderDate}>
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
              <Text style={styles.orderEarning}>₹{DELIVERY_FEE_PER_ORDER}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  statCardPrimary: { backgroundColor: '#0f766e' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statValueDark: { color: '#111827' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#99f6e4', marginTop: 2 },
  statLabelDark: { color: '#6b7280' },
  rateNote: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, marginBottom: 12 },
  rateText: { fontSize: 12, color: '#6b7280' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginLeft: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { alignItems: 'center', marginTop: 48, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#9ca3af' },
  emptyHint: { fontSize: 13, color: '#d1d5db' },
  orderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, gap: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  orderIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  orderId: { fontSize: 13, fontWeight: '700', color: '#111827' },
  orderAddr: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  orderDate: { fontSize: 10, color: '#9ca3af', marginTop: 1 },
  orderEarning: { fontSize: 16, fontWeight: '900', color: '#0f766e' },
});
