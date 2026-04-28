import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRiderOrderStore, RiderOrder } from '../../store/orderStore';

const STATUS_COLORS: Record<string, string> = {
  placed: '#F59E0B',
  accepted: '#3B82F6',
  preparing: '#8B5CF6',
  out_for_delivery: '#10B981',
  delivered: '#22C55E',
  cancelled: '#EF4444',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function OrderCard({ order, onPress }: { order: RiderOrder; onPress: () => void }) {
  const color = STATUS_COLORS[order.status] || '#0f766e';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.time}>Today • {formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: color }] }>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{order.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="location" size={16} color="#4b5563" />
        <Text style={styles.address} numberOfLines={2}>{order.address}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.itemsText} numberOfLines={1}>
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ')}
        </Text>
        <Text style={styles.amount}>₹{order.total}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersTabScreen() {
  const router = useRouter();
  const { orders, loading, subscribeToOrders } = useRiderOrderStore();

  useEffect(() => {
    // Later we can pass driverId to only show assigned orders
    subscribeToOrders();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Orders</Text>
        {loading && <ActivityIndicator size="small" color="#0f766e" />}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={
          orders.length === 0
            ? styles.emptyContainer
            : { paddingHorizontal: 16, paddingBottom: 24 }
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push({ pathname: '/order/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛵</Text>
              <Text style={styles.emptyTitle}>No orders assigned</Text>
              <Text style={styles.emptySub}>New delivery tasks will appear here when assigned to you.</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
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
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: { fontSize: 15, fontWeight: '700', color: '#111827' },
  time: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 999, marginRight: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  address: { flex: 1, fontSize: 13, color: '#4b5563', marginLeft: 6 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemsText: { flex: 1, fontSize: 12, color: '#6b7280', marginRight: 8 },
  amount: { fontSize: 15, fontWeight: '800', color: '#111827' },
  emptyContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  empty: { alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
});
