import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const AVATARS = ['🎮', '🕹️', '👾', '🎯', '🏆', '⚡', '🔥', '🐉'];
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'Retro'];

export default function OnboardingScreen() {
  const { user, completeOnboarding } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || AVATARS[0]);
  const [platform, setPlatform] = useState(user?.favouritePlatform || PLATFORMS[0]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (username.trim().length < 3) return setError('Username must be at least 3 characters');
    setBusy(true);
    try {
      await completeOnboarding({ username: username.trim(), avatar, favouritePlatform: platform });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        <Text style={s.title}>Set up your profile</Text>
        <Text style={s.sub}>Let's personalize your Questlog experience.</Text>

        <Text style={s.label}>Username</Text>
        <TextInput style={s.input} value={username} onChangeText={setUsername} placeholder="3+ characters" placeholderTextColor="#6b6f93" />

        <Text style={s.label}>Pick your avatar</Text>
        <View style={s.avatarRow}>
          {AVATARS.map((a) => (
            <TouchableOpacity key={a} style={[s.avatar, avatar === a && s.avatarSelected]} onPress={() => setAvatar(a)}>
              <Text style={s.avatarText}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.label}>Favourite platform</Text>
        <View style={s.platformGrid}>
          {PLATFORMS.map((p) => (
            <TouchableOpacity key={p} style={[s.platform, platform === p && s.platformSelected]} onPress={() => setPlatform(p)}>
              <Text style={[s.platformText, platform === p && s.platformTextSelected]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!error && <Text style={s.error}>{error}</Text>}
        <TouchableOpacity style={[s.btn, busy && s.btnDisabled]} onPress={submit} disabled={busy}>
          <Text style={s.btnText}>Finish setup</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, backgroundColor: '#0e0f1a', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#1c1f33', borderRadius: 20, padding: 30, borderWidth: 1, borderColor: '#2c3050' },
  title: { color: '#eef0ff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  sub: { color: '#9ea3c7', fontSize: 15, marginBottom: 22 },
  label: { color: '#9ea3c7', fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 8 },
  input: { backgroundColor: '#161827', borderWidth: 1, borderColor: '#2c3050', borderRadius: 10, padding: 12, color: '#eef0ff', fontSize: 15 },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#161827', borderWidth: 2, borderColor: '#2c3050', alignItems: 'center', justifyContent: 'center' },
  avatarSelected: { borderColor: '#7c5cff' },
  avatarText: { fontSize: 24 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platform: { padding: 14, borderRadius: 10, backgroundColor: '#161827', borderWidth: 2, borderColor: '#2c3050' },
  platformSelected: { borderColor: '#7c5cff', backgroundColor: 'rgba(124,92,255,0.14)' },
  platformText: { color: '#9ea3c7', fontWeight: '600' },
  platformTextSelected: { color: '#eef0ff' },
  error: { color: '#f87171', fontSize: 14, marginTop: 12 },
  btn: { backgroundColor: '#7c5cff', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 22 },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
