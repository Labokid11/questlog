import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';

const ICONS = {
  added_game: '➕',
  started_game: '▶',
  updated_progress: '📊',
  finished_game: '✓',
  rated_game: '★',
  removed_game: '🗑',
};
const LABELS = {
  added_game: 'Added a game',
  started_game: 'Started playing',
  updated_progress: 'Updated progress',
  finished_game: 'Finished a game',
  rated_game: 'Rated a game',
  removed_game: 'Removed a game',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function FeedScreen() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setActivities(await api.activities()); } catch {} finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <View style={s.container}>
      <View style={s.head}>
        <Text style={s.h1}>Activity Feed</Text>
        <Text style={s.sub}>Your recent Questlog activity.</Text>
      </View>
      <FlatList
        data={activities}
        keyExtractor={(a) => a._id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor="#7c5cff" />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<View style={s.center}><Text style={s.emptyIcon}>✦</Text><Text style={s.emptyTitle}>No activity yet</Text><Text style={s.muted}>Add or update games to see activity here.</Text></View>}
        renderItem={({ item }) => (
          <View style={s.item}>
            <View style={[s.icon, s[`icon_${item.type}`]]}><Text style={s.iconText}>{ICONS[item.type] || '•'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.text}><Text style={s.textBold}>{LABELS[item.type] || item.type}</Text> {item.description ? item.description : (item.gameTitle ? '— ' + item.gameTitle : '')}</Text>
              <Text style={s.meta}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0f1a', paddingTop: 54, paddingHorizontal: 18 },
  head: { marginBottom: 18 },
  h1: { color: '#eef0ff', fontSize: 26, fontWeight: '700' },
  sub: { color: '#9ea3c7', fontSize: 14, marginTop: 2 },
  center: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, opacity: 0.3 },
  emptyTitle: { color: '#eef0ff', fontSize: 18, fontWeight: '600', marginTop: 10 },
  muted: { color: '#9ea3c7', marginTop: 6 },
  item: { flexDirection: 'row', gap: 14, backgroundColor: '#1c1f33', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2c3050' },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon_added_game: { backgroundColor: 'rgba(124,92,255,0.18)' },
  icon_started_game: { backgroundColor: 'rgba(76,201,240,0.18)' },
  icon_updated_progress: { backgroundColor: 'rgba(251,191,36,0.18)' },
  icon_finished_game: { backgroundColor: 'rgba(74,222,128,0.18)' },
  icon_rated_game: { backgroundColor: 'rgba(251,191,36,0.18)' },
  icon_removed_game: { backgroundColor: 'rgba(248,113,113,0.18)' },
  iconText: { fontSize: 18 },
  text: { color: '#eef0ff', fontSize: 15 },
  textBold: { fontWeight: '700' },
  meta: { color: '#6b6f93', fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
});
