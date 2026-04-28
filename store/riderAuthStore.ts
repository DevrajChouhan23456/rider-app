import { create } from 'zustand';
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export interface RiderProfile {
  uid: string;
  phone: string;
  name: string;
  vehicleType: string; // 'bike' | 'scooter' | 'cycle'
  vehicleNumber: string;
  isActive: boolean;
  totalEarnings: number;
  expoPushToken?: string;
}

interface RiderAuthState {
  rider: RiderProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  verificationId: string | null;

  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  updateProfile: (data: Partial<RiderProfile>) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const RIDERS_COL = 'riders';

export const useRiderAuthStore = create<RiderAuthState>((set, get) => ({
  rider: null,
  firebaseUser: null,
  loading: false,
  error: null,
  verificationId: null,

  sendOtp: async (phone) => {
    set({ loading: true, error: null });
    try {
      // phone must be in +91XXXXXXXXXX format
      const confirmation = await signInWithPhoneNumber(auth, phone);
      set({ verificationId: confirmation.verificationId, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  verifyOtp: async (code) => {
    const { verificationId } = get();
    if (!verificationId) return;
    set({ loading: true, error: null });
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      // Fetch or create rider profile in Firestore
      const ref = doc(db, RIDERS_COL, user.uid);
      const snap = await getDoc(ref);
      let profile: RiderProfile;

      if (snap.exists()) {
        profile = snap.data() as RiderProfile;
      } else {
        profile = {
          uid: user.uid,
          phone: user.phoneNumber ?? '',
          name: '',
          vehicleType: 'bike',
          vehicleNumber: '',
          isActive: false,
          totalEarnings: 0,
        };
        await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
      }

      set({ firebaseUser: user, rider: profile, loading: false, verificationId: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateProfile: async (data) => {
    const { rider } = get();
    if (!rider) return;
    set({ loading: true });
    try {
      await setDoc(doc(db, RIDERS_COL, rider.uid), data, { merge: true });
      set({ rider: { ...rider, ...data }, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ rider: null, firebaseUser: null });
  },

  clearError: () => set({ error: null }),
}));
