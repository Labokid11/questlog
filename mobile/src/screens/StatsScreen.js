import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

function fmtHours(min) {
  return `${Math.round((min / 60) * 10) / 10}h`;
}

export default function StatsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const isPro = user?.premiumTier === 'pro' || user?.role === 'admin';

  const load = async () => { try { setStats(await api.stats()); } catch {} };
  useFocusEffect(useCallback(() => { load(); }, []));

  if (!stats) return <View style={s.center}><Text style={s.muted}>Loading…</Text></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={s.h1}>Stats & Analytics</Text>

      <View style={s.statCards}>
        <View style={s.statCard}><Text style={s.statIcon}>⏱</Text><Text style={s.statNum}>{stats.totalHours}h</Text><Text style={s.statLabel}>Hours</Text></View>
        <View style={s.statCard}><Text style={s.statIcon}>✓</Text><Text style={s.statNum}>{stats.completed}</Text><Text style={s.statLabel}>Completed</Text></View>
        <View style={s.statCard}><Text style={s.statIcon}>🎮</Text><Text style={s.statNum}>{stats.platformsUsed}</Text><Text style={s.statLabel}>Platforms</Text></View>
        <View style={s.statCard}><Text style={s.statIcon}>🏷</Text><Text style={s.statNum}>{stats.genresPlayed}</Text><Text style={s.statLabel}>Genres</Text></View>
        <View style={[s.statCard, !isPro && s.lockedStat]}><Text style={s.statIcon}>🔥</Text><Text style={s.statNum}>{isPro ? stats.currentStreak : '—'}</Text><Text style={s.statLabel}>Streak {isPro ? '' : '🔒'}</Text></View>
        <View style={[s.statCard, !isPro && s.lockedStat]}><Text style={s.statIcon}>🏆</Text><Text style={s.statNum}>{isPro ? stats.longestStreak : '—'}</Text><Text style={s.statLabel}>Best {isPro ? '' : '🔒'}</Text></View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Hours by platform</Text>
        {stats.platforms.length ? stats.platforms.map((p, i) => (
          <View key={i} style={s.barRow}>
            <Text style={s.barLabel}>{p.name}</Text>
            <View style={s.barTrack}><View style={[s.barFill, { width: `${(p.minutes / Math.max(1, ...stats.platforms.map((x) => x.minutes))) * 100}%` }]} /></View>
            <Text style={s.barVal}>{fmtHours(p.minutes)}</Text>
          </View>
        )) : <Text style={s.muted}>No data yet.</Text>}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Hours by genre {isPro ? '' : '🔒'}</Text>
        {isPro ? (
          stats.genres.length ? stats.genres.map((g, i) => (
            <View key={i} style={s.barRow}>
              <Text style={s.barLabel}>{g.name}</Text>
              <View style={s.barTrack}><View style={[s.barFill, { width: `${(g.minutes / Math.max(1, ...stats.genres.map((x) => x.minutes))) * 100}%` }]} /></View>
              <Text style={s.barVal}>{fmtHours(g.minutes)}</Text>
            </View>
          )) : <Text style={s.muted}>No data yet.</Text>
        ) : (
          <Text style={s.muted}>Premium feature — unlock in Settings.</Text>
        )}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Activity Heatmap {isPro ? '' : '🔒'}</Text>
        {isPro ? (
          <Text style={s.muted}>Heatmap available on web — open Questlog in your browser for the full heatmap view.</Text>
        ) : (
          <Text style={s.muted}>Premium feature — unlock in Settings.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0f1a', paddingTop: 54, paddingHorizontal: 18 },
  center: { flex: 1, backgroundColor: '#0e0f1a', alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#9ea3c7' },
  h1: { color: '#eef0ff', fontSize: 26, fontWeight: '700', marginBottom: 18 },
  statCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  statCard: { width: '31%', backgroundColor: '#1c1f33', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2c3050' },
  lockedStat: { opacity: 0.5 },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statNum: { color: '#eef0ff', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#9ea3c7', fontSize: 11, marginTop: 2 },
  card: { backgroundColor: '#1c1f33', borderRadius: 14, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#2c3050' },
  cardTitle: { color: '#eef0ff', fontSize: 15, fontWeight: '700', marginBottom: 14 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { width: 80, color: '#9ea3c7', fontSize: 13 },
  barTrack: { flex: 1, height: 10, backgroundColor: '#232640', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#7c5cff', borderRadius: 6 },
  barVal: { width: 50, textAlign: 'right', color: '#9ea3c7', fontSize: 13, fontFamily: 'monospace' },
});
