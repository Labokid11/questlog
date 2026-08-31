import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';

const STATUS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'playing', label: 'Playing' },
  { key: 'completed', label: 'Completed' },
  { key: 'abandoned', label: 'Abandoned' },
];

export default function LibraryScreen() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {game?}

  const load = async () => {
    try {
      setGames(await api.games());
    } catch {} finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async (data, id) => {
    if (id) await api.updateGame(id, data);
    else await api.addGame(data);
    setModal(null);
    load();
  };

  const remove = async (id) => {
    await api.deleteGame(id);
    load();
  };

  if (loading) return <View style={s.center}><Text style={s.muted}>Loading…</Text></View>;

  return (
    <View style={s.container}>
      <View style={s.head}>
        <View>
          <Text style={s.h1}>My Library</Text>
          <Text style={s.sub}>{games.length} game{games.length === 1 ? '' : 's'}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModal({})}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={games}
        keyExtractor={(g) => g._id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor="#7c5cff" />}
        ListEmptyComponent={
          <View style={s.center}><Text style={s.emptyIcon}>🎮</Text><Text style={s.emptyTitle}>Your library is empty</Text><Text style={s.muted}>Add your first game to get started.</Text></View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.poster}>
              {item.posterUrl ? (
                <View style={s.posterFallback}><Text style={s.posterText}>{item.title[0]}</Text></View>
              ) : (
                <View style={s.posterFallback}><Text style={s.posterText}>🎮</Text></View>
              )}
              <View style={[s.badge, s[`badge_${item.status}`]]}><Text style={s.badgeText}>{STATUS.find((x) => x.key === item.status)?.label}</Text></View>
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.cardPlatform} numberOfLines={1}>{item.platform || '—'}</Text>
              {item.progress > 0 && <Text style={s.cardProgress}>{item.progress}%</Text>}
            </View>
            <View style={s.cardActions}>
              <TouchableOpacity onPress={() => setModal({ game: item })}><Text style={s.actionBtn}>✎</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item._id)}><Text style={s.actionBtn}>🗑</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />

      {modal && <GameModal modal={modal} onClose={() => setModal(null)} onSave={save} />}
    </View>
  );
}

function GameModal({ modal, onClose, onSave }) {
  const editing = modal.game;
  const [title, setTitle] = useState(editing?.title || '');
  const [platform, setPlatform] = useState(editing?.platform || '');
  const [status, setStatus] = useState(editing?.status || 'backlog');
  const [progress, setProgress] = useState(String(editing?.progress || 0));
  const [rating, setRating] = useState(String(editing?.rating || 0));
  const [posterUrl, setPosterUrl] = useState(editing?.posterUrl && !editing.posterUrl.startsWith('/uploads/') ? editing.posterUrl : '');
  const [error, setError] = useState('');

  const submit = () => {
    if (!title.trim()) return setError('Title is required');
    onSave({
      title: title.trim(), platform, status,
      progress: Number(progress) || 0, rating: Number(rating) || 0,
      posterUrl: posterUrl.trim(), notes: '',
    }, editing?._id);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>{editing ? 'Edit game' : 'Add game'}</Text>
          <Text style={s.label}>Title</Text>
          <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Game title" placeholderTextColor="#6b6f93" />
          <Text style={s.label}>Platform</Text>
          <TextInput style={s.input} value={platform} onChangeText={setPlatform} placeholder="PC, PS5, etc." placeholderTextColor="#6b6f93" />
          <Text style={s.label}>Status</Text>
          <View style={s.statusRow}>
            {STATUS.map((s2) => (
              <TouchableOpacity key={s2.key} style={[s.statusPill, status === s2.key && s.statusPillActive]} onPress={() => setStatus(s2.key)}>
                <Text style={[s.statusPillText, status === s2.key && s.statusPillTextActive]}>{s2.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.label}>Progress %</Text>
              <TextInput style={s.input} value={progress} onChangeText={setProgress} keyboardType="numeric" placeholderTextColor="#6b6f93" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Rating</Text>
              <TextInput style={s.input} value={rating} onChangeText={setRating} keyboardType="numeric" placeholderTextColor="#6b6f93" />
            </View>
          </View>
          <Text style={s.label}>Poster URL</Text>
          <TextInput style={s.input} value={posterUrl} onChangeText={setPosterUrl} placeholder="https://…" placeholderTextColor="#6b6f93" />
          {!!error && <Text style={s.error}>{error}</Text>}
          <View style={s.modalFooter}>
            <TouchableOpacity onPress={onClose} style={s.cancelBtn}><Text style={s.cancelBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={submit} style={s.saveBtn}><Text style={s.saveBtnText}>{editing ? 'Save' : 'Add'}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0f1a', paddingTop: 54, paddingHorizontal: 18 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  h1: { color: '#eef0ff', fontSize: 26, fontWeight: '700' },
  sub: { color: '#9ea3c7', fontSize: 14, marginTop: 2 },
  addBtn: { backgroundColor: '#7c5cff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, backgroundColor: '#0e0f1a', alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#9ea3c7', marginTop: 6 },
  emptyIcon: { fontSize: 48, opacity: 0.3 },
  emptyTitle: { color: '#eef0ff', fontSize: 18, fontWeight: '600', marginTop: 10 },
  card: { flex: 1, margin: 6, backgroundColor: '#1c1f33', borderRadius: 14, borderWidth: 1, borderColor: '#2c3050', overflow: 'hidden' },
  poster: { aspectRatio: 3 / 4, backgroundColor: '#232640', position: 'relative' },
  posterFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  posterText: { fontSize: 32, opacity: 0.3 },
  badge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badge_backlog: { backgroundColor: '#6b6f93' },
  badge_playing: { backgroundColor: '#4cc9f0' },
  badge_completed: { backgroundColor: '#4ade80' },
  badge_abandoned: { backgroundColor: '#f87171' },
  badgeText: { color: '#06283d', fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 12 },
  cardTitle: { color: '#eef0ff', fontSize: 14, fontWeight: '600' },
  cardPlatform: { color: '#6b6f93', fontSize: 12, marginTop: 2 },
  cardProgress: { color: '#9ea3c7', fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  cardActions: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 6 },
  actionBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(14,15,26,0.85)', textAlign: 'center', lineHeight: 26, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(8,9,18,0.7)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#1c1f33', borderRadius: 18, padding: 24, borderWidth: 1, borderColor: '#2c3050' },
  modalTitle: { color: '#eef0ff', fontSize: 20, fontWeight: '700', marginBottom: 18 },
  label: { color: '#9ea3c7', fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#161827', borderWidth: 1, borderColor: '#2c3050', borderRadius: 10, padding: 12, color: '#eef0ff', fontSize: 15 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#161827', borderWidth: 1, borderColor: '#2c3050' },
  statusPillActive: { borderColor: '#7c5cff', backgroundColor: 'rgba(124,92,255,0.14)' },
  statusPillText: { color: '#9ea3c7', fontWeight: '600', fontSize: 13 },
  statusPillTextActive: { color: '#eef0ff' },
  row: { flexDirection: 'row' },
  error: { color: '#f87171', marginTop: 10 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2c3050' },
  cancelBtnText: { color: '#9ea3c7', fontWeight: '600' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#7c5cff' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
