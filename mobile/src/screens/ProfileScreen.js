import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [games, setGames] = useState([]);

  const load = async () => { try { setGames(await api.games()); } catch {} };
  useFocusEffect(useCallback(() => { load(); }, []));

  const completed = games.filter((g) => g.status === 'completed').length;
  const playing = games.filter((g) => g.status === 'playing').length;

  return (
    <View style={s.container}>
      <View style={s.head}><Text style={s.h1}>Profile</Text></View>
      <View style={s.card}>
        <View style={s.headRow}>
          <View style={s.avatar}><Text style={s.avatarText}>{user?.avatar || '🎮'}</Text></View>
          <View>
            <Text style={s.name}>{user?.username}</Text>
            <Text style={s.email}>{user?.email}</Text>
            <View style={s.badgeRow}>
              {isPro ? (
                <View style={s.badgePro}><Text style={s.badgeProText}>★ Premium</Text></View>
              ) : (
                <View style={s.badgeFree}><Text style={s.badgeFreeText}>Free</Text></View>
              )}
              {user?.role === 'admin' && (
                <View style={s.badgeAdmin}><Text style={s.badgeAdminText}>🛡 Admin</Text></View>
              )}
            </View>
          </View>
        </View>
        <View style={s.stats}>
          <View style={s.stat}><Text style={s.statNum}>{games.length}</Text><Text style={s.statLabel}>Games</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{playing}</Text><Text style={s.statLabel}>Playing</Text></View>
          <View style={s.stat}><Text style={s.statNum}>{completed}</Text><Text style={s.statLabel}>Completed</Text></View>
        </View>
        <Text style={s.detail}>Favourite platform: <Text style={s.detailVal}>{user?.favouritePlatform || '—'}</Text></Text>
      </View>
      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0f1a', paddingTop: 54, paddingHorizontal: 18 },
  head: { marginBottom: 18 },
  h1: { color: '#eef0ff', fontSize: 26, fontWeight: '700' },
  card: { backgroundColor: '#1c1f33', borderRadius: 18, padding: 24, borderWidth: 1, borderColor: '#2c3050' },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 22 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#7c5cff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28 },
  name: { color: '#eef0ff', fontSize: 20, fontWeight: '700' },
  email: { color: '#9ea3c7', fontSize: 14, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: '#161827', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2c3050' },
  statNum: { color: '#eef0ff', fontSize: 24, fontWeight: '800' },
  statLabel: { color: '#9ea3c7', fontSize: 12, marginTop: 2 },
  detail: { color: '#9ea3c7', fontSize: 14, marginTop: 18 },
  detailVal: { color: '#eef0ff', fontWeight: '600' },
  logoutBtn: { marginTop: 18, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2c3050', alignItems: 'center', backgroundColor: '#1c1f33' },
  logoutText: { color: '#f87171', fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badgePro: { backgroundColor: '#7c5cff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeProText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  badgeFree: { backgroundColor: '#232640', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: '#2c3050' },
  badgeFreeText: { color: '#6b6f93', fontSize: 12, fontWeight: '600' },
  badgeAdmin: { backgroundColor: 'rgba(248,113,113,0.18)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  badgeAdminText: { color: '#f87171', fontSize: 12, fontWeight: '700' },
});
