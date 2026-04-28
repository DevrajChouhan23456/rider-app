import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { RiderOrderStatus } from '../store/orderStore';

export const STATUS_FLOW: Record<RiderOrderStatus, RiderOrderStatus | null> = {
  placed: 'accepted',
  accepted: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: null,
  cancelled: null,
};

export const STATUS_LABELS: Record<RiderOrderStatus, string> = {
  placed: 'Accept Order',
  accepted: 'Mark as Preparing',
  preparing: 'Mark as Picked Up',
  out_for_delivery: 'Mark as Delivered',
  delivered: 'Delivered ✓',
  cancelled: 'Cancelled',
};

export const STATUS_ICONS: Record<RiderOrderStatus, string> = {
  placed: 'checkmark-circle-outline',
  accepted: 'restaurant-outline',
  preparing: 'bicycle-outline',
  out_for_delivery: 'checkmark-done-circle-outline',
  delivered: 'checkmark-done-circle',
  cancelled: 'close-circle-outline',
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: RiderOrderStatus
): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
}
