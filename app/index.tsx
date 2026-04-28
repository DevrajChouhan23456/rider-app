import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)');
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>Dal Baffla Rider App</Text>
        <Text style={styles.sub}>Redirecting to Orders...</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.link}>Go now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  sub: { fontSize: 14, color: '#666' },
  link: { marginTop: 16, color: '#0f766e', fontWeight: '700' },
});
