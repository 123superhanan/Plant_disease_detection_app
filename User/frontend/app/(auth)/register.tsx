import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { Apple, ArrowRight, Facebook, Github, Leaf, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const API_URL = 'http://192.168.10.5:5001/api/auth';
const storage = {
  setToken: (token: string) => {
    localStorage.setItem('userToken', token);
  },

  getToken: () => {
    return localStorage.getItem('userToken');
  },

  removeToken: () => {
    localStorage.removeItem('userToken');
  },
};
const Register = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const resetErrors = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
  };

  const storeToken = async (token: string) => {
    storage.setToken(token);
    console.log('✅ Token stored');
  };

  // Get token
  const getToken = async () => {
    return storage.getToken();
  };

  // Handle Login
  const handleLogin = async () => {
    resetErrors();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (data.success) {
        await storeToken(data.token);
        console.log('✅ Login successful, token stored');
        router.replace('/(drawer)/Home');
      } else {
        setEmailError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setPasswordError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async () => {
    resetErrors();

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await storeToken(data.token);
        console.log('✅ Registration successful, token stored');
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(drawer)/Home') },
        ]);
      } else {
        if (data.error.includes('already exists')) {
          setEmailError('Email already registered. Please login.');
        } else {
          setEmailError(data.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Register error:', error);
      setPasswordError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  // Test auth (for debugging)
  const testAuth = async () => {
    const token = await getToken();
    console.log('Stored token:', token ? 'exists' : 'missing');

    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    console.log('Auth debug:', data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AGROVISION AI</Text>
            </View>
            <Text style={styles.title}>{isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</Text>
          </View>

          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['rgba(29, 185, 84, 0.2)', 'transparent']}
              style={styles.glow}
            />
            <View style={styles.iconCircle}>
              <Leaf color="#1DB954" size={60} strokeWidth={1.5} />
            </View>
          </View>

          <View style={styles.form}>
            <View>
              {!isLogin && (
                <>
                  <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                    <User color="#666" size={20} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Full Name (optional)"
                      placeholderTextColor="#666"
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </>
              )}

              <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                <Mail color="#666" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#666"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                <Lock color="#666" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              {!isLogin && (
                <>
                  <View style={[styles.inputWrapper, confirmError && styles.inputError]}>
                    <Lock color="#666" size={20} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Confirm Password"
                      placeholderTextColor="#666"
                      secureTextEntry
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                  {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
                </>
              )}

              <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <View style={styles.btnRow}>
                    <Text style={styles.mainBtnText}>{isLogin ? 'LOGIN' : 'SIGN UP'}</Text>
                    <ArrowRight color="black" size={20} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
                <Text style={styles.smallTextCenter}>
                  {isLogin ? 'New here? Create Account' : 'Already have an account? Login'}
                </Text>
              </TouchableOpacity>

              {/* Debug button - remove in production */}
              <TouchableOpacity onPress={testAuth} style={styles.debugBtn}>
                <Text style={styles.debugText}>🔧 Debug Auth</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Quick Access</Text>
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialIcon}>
                <Facebook color="white" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Apple color="white" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Github color="white" size={22} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  flex: { flex: 1 },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', marginTop: 10 },
  badge: {
    backgroundColor: '#1DB95420',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: { color: '#1DB954', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroContainer: { height: 120, justifyContent: 'center', alignItems: 'center' },
  glow: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    marginBottom: 5,
    paddingHorizontal: 18,
    height: 55,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: { borderColor: '#ff4d4f' },
  errorText: { color: '#ff4d4f', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: 'white', fontSize: 16 },
  mainBtn: {
    backgroundColor: '#1DB954',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mainBtnText: { color: 'black', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  switchBtn: { marginTop: 20 },
  smallTextCenter: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 10 },
  debugBtn: { marginTop: 10, alignSelf: 'center' },
  debugText: { color: '#555', fontSize: 12 },
  footer: { alignItems: 'center', marginBottom: 10 },
  footerText: {
    color: '#444',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1,
  },
  socialRow: { flexDirection: 'row', gap: 15 },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
});

export default Register;
