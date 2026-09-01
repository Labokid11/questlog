import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const THEMES = [
  { id: 'default', name: 'Questlog', premium: false },
  { id: 'daylight', name: 'Daylight', premium: false },
  { id: 'slate', name: 'Slate', premium: false },
  { id: 'ocean', name: 'Ocean', premium: false },
  { id: 'neon', name: 'Neon', premium: true },
  { id: 'cyberpunk', name: 'Cyberpunk', premium: true },
  { id: 'midnight', name: 'Midnight', premium: true },
  { id: 'sunset', name: 'Sunset', premium: true },
  { id: 'pixel', name: 'Pixel', premium: true },
];

export default function SettingsScreen() {
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const isPro = user?.premiumTier === 'pro' || user?.role === 'admin';

  const unlock = async () => {
    setMsg('');
    if (!code.trim()) return setMsg('Please enter a code');
    setBusy(true);
    try {
      const res = await api.unlockPremium(code.trim());
      await refreshUser(res.user);
      setMsg(res.message || 'Premium unlocked!');
      setCode('');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleDev = async (val) => {
    try {
      const res = await api.togglePremium();
      await refreshUser(res.user);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const pickTheme = async (theme) => {
    if (theme.premium && !isPro) {
      Alert.alert('Premium', 'This is a Premium theme. Unlock Premium to use it.');
      return;
    }
    try {
      const res = await api.saveTheme(theme.id);
      await refreshUser(res.user);
    } catch {}
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={s.h1}>Settings</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>Questlog Premium</Text>
        <View style={[s.statusRow, isPro ? s.statusPro : s.statusFree]}>
          <Text style={s.statusIcon}>{isPro ? '★' : '🔒'}</Text>
          <View>
            <Text style={s.statusTitle}>{isPro ? 'Premium Active' : 'Free Tier'}</Text>
            <Text style={s.statusSub}>{isPro ? 'All features unlocked.' : 'Unlock advanced stats, themes & more.'}</Text>
          </View>
        </View>

        <Text style={s.label}>Premium Code</Text>
        <View style={s.codeRow}>
          <TextInput style={s.codeInput} value={code} onChangeText={setCode} placeholder="QUESTLOG-PRO" placeholderTextColor="#6b6f93" autoCapitalize="characters" />
          <TouchableOpacity style={[s.btn, busy && s.btnDisabled]} onPress={unlock} disabled={busy}>
            <Text style={s.btnText}>Unlock</Text>
          </TouchableOpacity>
        </View>
        {!!msg && <Text style={s.msg}>{msg}</Text>}

        <View style={s.devRow}>
          <View>
            <Text style={s.devTitle}>Developer Mode</Text>
            <Text style={s.devSub}>Toggle Premium for testing</Text>
          </View>
          <Switch value={isPro} onValueChange={toggleDev} trackColor={{ false: '#2c3050', true: '#7c5cff' }} />
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Themes</Text>
        <View style={s.themeGrid}>
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[s.themeChip, user?.theme === t.id && s.themeChipActive]}
              onPress={() => pickTheme(t)}
            >
              <Text style={s.themeChipText}>
                {t.name} {t.premium ? '★' : ''} {t.premium && !isPro ? '🔒' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Early Access</Text>
        {['AI Recommendations', 'Yearly Wrapped', 'Social Leaderboards'].map((f) => (
          <View key={f} style={s.eaRow}>
            <Text style={s.eaText}>{f}</Text>
            <Text style={s.eaLock}>{isPro ? '✓' : '🔒'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0f1a', paddingTop: 54, paddingHorizontal: 18 },
  h1: { color: '#eef0ff', fontSize: 26, fontWeight: '700', marginBottom: 18 },
  card: { backgroundColor: '#1c1f33', borderRadius: 16, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: '#2c3050' },
  cardTitle: { color: '#eef0ff', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 12, marginBottom: 16 },
  statusPro: { backgroundColor: 'rgba(124,92,255,0.12)', borderWidth: 1, borderColor: '#7c5cff' },
  statusFree: { backgroundColor: '#161827', borderWidth: 1, borderColor: '#2c3050' },
  statusIcon: { fontSize: 28 },
  statusTitle: { color: '#eef0ff', fontSize: 16, fontWeight: '700' },
  statusSub: { color: '#9ea3c7', fontSize: 13, marginTop: 2 },
  label: { color: '#9ea3c7', fontSize: 13, fontWeight: '600', marginBottom: 7 },
  codeRow: { flexDirection: 'row', gap: 10 },
  codeInput: { flex: 1, backgroundColor: '#161827', borderWidth: 1, borderColor: '#2c3050', borderRadius: 10, padding: 12, color: '#eef0ff', fontSize: 15 },
  btn: { backgroundColor: '#7c5cff', borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700' },
  msg: { color: '#4ade80', fontSize: 14, marginTop: 10 },
  devRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#161827', borderRadius: 10, borderWidth: 1, borderColor: '#2c3050', marginTop: 16 },
  devTitle: { color: '#eef0ff', fontWeight: '600' },
  devSub: { color: '#6b6f93', fontSize: 13, marginTop: 2 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#161827', borderWidth: 1, borderColor: '#2c3050' },
  themeChipActive: { borderColor: '#7c5cff', backgroundColor: 'rgba(124,92,255,0.14)' },
  themeChipText: { color: '#eef0ff', fontSize: 13, fontWeight: '600' },
  eaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2c3050' },
  eaText: { color: '#eef0ff', fontSize: 15 },
  eaLock: { fontSize: 16 },
});
