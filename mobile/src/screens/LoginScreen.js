import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!email || !password) return setError('Email and password are required');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (username.trim().length < 3) throw new Error('Username must be at least 3 characters');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await signup(email, password, username.trim());
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.wrap}>
      <View style={s.card}>
        <View style={s.brandRow}>
          <View style={s.brandMark}><Text style={s.brandMarkText}>Q</Text></View>
          <Text style={s.brandName}>questlog</Text>
        </View>
        <Text style={s.title}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text>
        <Text style={s.sub}>{mode === 'login' ? 'Log in to track your games.' : 'Start tracking your game life today.'}</Text>

        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab, mode === 'login' && s.tabActive]} onPress={() => setMode('login')}>
            <Text style={[s.tabText, mode === 'login' && s.tabTextActive]}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, mode === 'signup' && s.tabActive]} onPress={() => setMode('signup')}>
            <Text style={[s.tabText, mode === 'signup' && s.tabTextActive]}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {mode === 'signup' && (
          <View style={s.field}>
            <Text style={s.label}>Username</Text>
            <TextInput style={s.input} value={username} onChangeText={setUsername} placeholder="3+ characters" placeholderTextColor="#6b6f93" />
          </View>
        )}
        <View style={s.field}>
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#6b6f93" />
        </View>
        <View style={s.field}>
          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="6+ characters" placeholderTextColor="#6b6f93" />
        </View>

        {!!error && <Text style={s.error}>{error}</Text>}
        <TouchableOpacity style={[s.btn, busy && s.btnDisabled]} onPress={submit} disabled={busy}>
          <Text style={s.btnText}>{mode === 'login' ? 'Log in' : 'Create account'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0e0f1a', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#1c1f33', borderRadius: 20, padding: 30, borderWidth: 1, borderColor: '#2c3050' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  brandMark: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#7c5cff', alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  brandName: { color: '#eef0ff', fontWeight: '800', fontSize: 20 },
  title: { color: '#eef0ff', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  sub: { color: '#9ea3c7', fontSize: 15, marginBottom: 22 },
  tabs: { flexDirection: 'row', backgroundColor: '#161827', borderRadius: 12, padding: 5, marginBottom: 20, gap: 6 },
  tab: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#7c5cff' },
  tabText: { color: '#9ea3c7', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  field: { marginBottom: 16 },
  label: { color: '#9ea3c7', fontSize: 13, fontWeight: '600', marginBottom: 7 },
  input: { backgroundColor: '#161827', borderWidth: 1, borderColor: '#2c3050', borderRadius: 10, padding: 12, color: '#eef0ff', fontSize: 15 },
  error: { color: '#f87171', fontSize: 14, marginBottom: 12 },
  btn: { backgroundColor: '#7c5cff', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
