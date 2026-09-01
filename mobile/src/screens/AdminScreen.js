import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function AdminScreen() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      setAnalytics(await api.adminAnalytics());
      setUsers(await api.adminUsers());
    } catch {}
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const togglePremium = async (id) => {
    try { await api.adminTogglePremium(id); load(); } catch (e) { Alert.alert('Error', e.message); }
  };
  const resetUser = async (id) => {
    Alert.alert('Reset Data', 'Reset this user\'s games, sessions, and activities?', [
      { text: 'Cancel' },
      { text: 'Reset', onPress: async () => { try { await api.adminResetUser(id); load(); } catch (e) { Alert.alert('Error', e.message); } } },
    ]);
  };
  const deleteUser = async (id) => {
    Alert.alert('Remove User', 'Permanently remove this user?', [
      { text: 'Cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { try { await api.adminDeleteUser(id); load(); } catch (e) { Alert.alert('Error', e.message); } } },
    ]);
  };

  if (user?.role !== 'admin') {
    return <View style={s.center}><Text style={s.muted}>Admin access required.</Text></View>;
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={s.headRow}>
        <Text style={s.h1}>Admin Panel</Text>
        <View style={s.adminBadge}><Text style={s.adminBadgeText}>Admin</Text></View>
      </View>

      {analytics && (
        <View style={s.statsGrid}>
          <View style={s.statBox}><Text style={s.statNum}>{analytics.totalUsers}</Text><Text style={s.statLabel}>Users</Text></View>
          <View style={s.statBox}><Text style={s.statNum}>{analytics.proUsers}</Text><Text style={s.statLabel}>Premium</Text></View>
          <View style={s.statBox}><Text style={s.statNum}>{analytics.totalGames}</Text><Text style={s.statLabel}>Games</Text></View>
          <View style={s.statBox}><Text style={s.statNum}>{analytics.totalSessions}</Text><Text style={s.statLabel}>Sessions</Text></View>
        </View>
      )}

      <Text style={s.sectionTitle}>User Management</Text>
      {users.map((u) => (
        <View key={u._id} style={s.userRow}>
          <View style={s.userAvatar}><Text style={s.userAvatarText}>{u.avatar || '🎮'}</Text></View>
          <View style={s.userInfo}>
            <Text style={s.userName}>{u.username} {u.role === 'admin' ? '🛡' : ''} {u.premiumTier === 'pro' ? '★' : ''}</Text>
            <Text style={s.userMeta}>{u.email} · {u.gameCount} games</Text>
          </View>
          <View style={s.userActions}>
            <TouchableOpacity style={s.actionBtn} onPress={() => togglePremium(u._id)}>
              <Text style={s.actionBtnText}>{u.premiumTier === 'pro' ? 'Remove' : 'Grant'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => resetUser(u._id)}>
              <Text style={s.actionBtnText}>Reset</Text>
            </TouchableOpacity>
            {u._id !== user._id && (
              <TouchableOpacity style={s.actionBtnDanger} onPress={() => deleteUser(u._id)}>
                <Text style={s.actionBtnTextDanger}>Del</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0f1a', paddingTop: 54, paddingHorizontal: 18 },
  center: { flex: 1, backgroundColor: '#0e0f1a', alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#9ea3c7' },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  h1: { color: '#eef0ff', fontSize: 26, fontWeight: '700' },
  adminBadge: { backgroundColor: 'rgba(248,113,113,0.18)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  adminBadgeText: { color: '#f87171', fontWeight: '700', fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  statBox: { flex: 1, backgroundColor: '#1c1f33', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2c3050' },
  statNum: { color: '#eef0ff', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#9ea3c7', fontSize: 11, marginTop: 2 },
  sectionTitle: { color: '#eef0ff', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: '#1c1f33', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2c3050' },
  userAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#7c5cff', alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 16 },
  userInfo: { flex: 1 },
  userName: { color: '#eef0ff', fontSize: 15, fontWeight: '600' },
  userMeta: { color: '#6b6f93', fontSize: 12, marginTop: 2 },
  userActions: { flexDirection: 'row', gap: 6 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: '#161827', borderWidth: 1, borderColor: '#2c3050' },
  actionBtnText: { color: '#9ea3c7', fontSize: 12, fontWeight: '600' },
  actionBtnDanger: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: 'rgba(248,113,113,0.12)' },
  actionBtnTextDanger: { color: '#f87171', fontSize: 12, fontWeight: '600' },
});
