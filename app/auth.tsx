import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRiderAuthStore } from '../store/riderAuthStore';

export default function AuthScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const { sendOtp, verifyOtp, loading, error, clearError } = useRiderAuthStore();

  const handleSendOtp = async () => {
    clearError();
    const formatted = phone.startsWith('+91') ? phone : `+91${phone}`;
    if (formatted.length !== 13) { Alert.alert('Enter a valid 10-digit phone number'); return; }
    await sendOtp(formatted);
    if (!useRiderAuthStore.getState().error) setStep('otp');
  };

  const handleVerifyOtp = async () => {
    clearError();
    if (otp.length !== 6) { Alert.alert('Enter the 6-digit OTP'); return; }
    await verifyOtp(otp);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Ionicons name="bicycle" size={56} color="#0f766e" />
            <Text style={styles.brand}>Dal Bhaffle</Text>
            <Text style={styles.subtitle}>Rider App</Text>
          </View>

          {step === 'phone' ? (
            <>
              <Text style={styles.heading}>Enter your phone number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}><Text style={styles.countryCodeText}>+91</Text></View>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="10-digit number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Enter OTP</Text>
              <Text style={styles.otpHint}>Sent to +91 {phone}</Text>
              <TextInput
                style={[styles.phoneInput, styles.otpInput]}
                value={otp}
                onChangeText={setOtp}
                placeholder="— — — — — —"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                maxLength={6}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleVerifyOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={() => setStep('phone')}>
                <Text style={styles.backLinkText}>← Change number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 48 },
  brand: { fontSize: 28, fontWeight: '900', color: '#0f766e', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', fontWeight: '600', marginTop: 2 },
  heading: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16 },
  otpHint: { fontSize: 13, color: '#6b7280', marginBottom: 12, marginTop: -8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  countryCode: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 14 },
  countryCodeText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  phoneInput: { flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 14, fontSize: 18, color: '#111827', letterSpacing: 2 },
  otpInput: { marginBottom: 12, textAlign: 'center', fontSize: 24, letterSpacing: 8, flex: 0 },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  btn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  backLink: { alignItems: 'center', marginTop: 16 },
  backLinkText: { color: '#0f766e', fontWeight: '600', fontSize: 13 },
});
