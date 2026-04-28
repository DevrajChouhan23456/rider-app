import { create } from 'zustand';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../services/firebase';

export type RiderOrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface RiderOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addons?: { name: string; price: number }[];
}

export interface RiderOrder {
  id: string;
  userId: string;
  status: RiderOrderStatus;
  items: RiderOrderItem[];
  total: number;
  address: string;
  paymentMethod: 'cod' | 'online';
  estimatedTime?: string;
  createdAt: string;
  driverId?: string;
}

interface RiderOrderState {
  orders: RiderOrder[];
  loading: boolean;
  error: string | null;
  _unsubscribe: Unsubscribe | null;

  subscribeToOrders: (driverId?: string) => void;
  unsubscribe: () => void;
  getOrder: (id: string) => RiderOrder | undefined;
}

const ACTIVE_STATUSES: RiderOrderStatus[] = [
  'placed',
  'accepted',
  'preparing',
  'out_for_delivery',
];

export const useRiderOrderStore = create<RiderOrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  _unsubscribe: null,

  subscribeToOrders: (driverId) => {
    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe();

    set({ loading: true, error: null });

    try {
      const baseRef = collection(db, 'orders');

      const q = driverId
        ? query(
            baseRef,
            where('driverId', '==', driverId),
            where('status', 'in', ACTIVE_STATUSES),
            orderBy('createdAt', 'desc')
          )
        : query(
            baseRef,
            where('status', 'in', ACTIVE_STATUSES),
            orderBy('createdAt', 'desc')
          );

      const unsub = onSnapshot(
        q,
        (snap) => {
          const orders: RiderOrder[] = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
              ...data,
              id: d.id,
              createdAt:
                data.createdAt?.toDate?.()?.toISOString?.() ||
                new Date().toISOString(),
            } as RiderOrder;
          });
          set({ orders, loading: false });
        },
        (err) => {
          console.error('subscribeToOrders error:', err);
          set({ error: err.message, loading: false });
        }
      );

      set({ _unsubscribe: unsub });
    } catch (err: any) {
      console.error('subscribeToOrders setup error:', err);
      set({ error: err.message, loading: false });
    }
  },

  unsubscribe: () => {
    const { _unsubscribe } = get();
    if (_unsubscribe) {
      _unsubscribe();
      set({ _unsubscribe: null });
    }
  },

  getOrder: (id) => get().orders.find((o) => o.id === id),
}));
