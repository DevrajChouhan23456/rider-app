import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRiderAuthStore } from '../../store/riderAuthStore';

const VEHICLE_OPTIONS = ['bike', 'scooter', 'cycle'];

export default function ProfileScreen() {
  const { rider, loading, updateProfile, logout } = useRiderAuthStore();
  const [name, setName] = useState(rider?.name ?? '');
  const [vehicleType, setVehicleType] = useState(rider?.vehicleType ?? 'bike');
  const [vehicleNumber, setVehicleNumber] = useState(rider?.vehicleNumber ?? '');
  const [isActive, setIsActive] = useState(rider?.isActive ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name is required'); return; }
    setSaving(true);
    await updateProfile({ name: name.trim(), vehicleType, vehicleNumber: vehicleNumber.trim(), isActive });
    setSaving(false);
    Alert.alert('✅ Saved', 'Profile updated successfully.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#0f766e" />
          </View>
          <Text style={styles.phone}>{rider?.phone}</Text>
        </View>

        {/* Online toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Available for Orders</Text>
            <Text style={styles.toggleSub}>{isActive ? 'You are online' : 'You are offline'}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, isActive && styles.toggleOn]}
            onPress={() => setIsActive(!isActive)}
          >
            <View style={[styles.toggleThumb, isActive && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Vehicle type */}
        <View style={styles.field}>
          <Text style={styles.label}>Vehicle Type</Text>
          <View style={styles.vehicleRow}>
            {VEHICLE_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.vehicleBtn, vehicleType === v && styles.vehicleBtnActive]}
                onPress={() => setVehicleType(v)}
              >
                <Text style={[styles.vehicleBtnText, vehicleType === v && styles.vehicleBtnTextActive]}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Vehicle number */}
        <View style={styles.field}>
          <Text style={styles.label}>Vehicle Number</Text>
          <TextInput
            style={styles.input}
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            placeholder="MP09XX1234"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
          />
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
  scroll: { padding: 20, paddingBottom: 48 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#ccfbf1', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  phone: { fontSize: 15, fontWeight: '700', color: '#0f766e' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  toggleSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: '#0f766e' },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 12, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },
  vehicleRow: { flexDirection: 'row', gap: 8 },
  vehicleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', backgroundColor: '#fff' },
  vehicleBtnActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  vehicleBtnText: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
  vehicleBtnTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#0f766e', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, padding: 12 },
  logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
});
