import * as Location from 'expo-location';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

let _watchSub: Location.LocationSubscription | null = null;

export async function startLiveTracking(orderId: string): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Location permission denied');
    return false;
  }

  // Stop any existing watcher first
  stopLiveTracking();

  _watchSub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,   // every 5 seconds
      distanceInterval: 10, // or every 10 metres, whichever comes first
    },
    async (location) => {
      const { latitude, longitude } = location.coords;
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          driverLat: latitude,
          driverLng: longitude,
          driverUpdatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to update driver location:', err);
      }
    }
  );

  return true;
}

export function stopLiveTracking() {
  if (_watchSub) {
    _watchSub.remove();
    _watchSub = null;
  }
}
