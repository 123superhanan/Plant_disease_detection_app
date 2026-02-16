import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Apple, Facebook, Github, Leaf, Lock, Mail, ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('window');

const Register = () => {
  const { isLoaded } = useAuth();
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  // NEW: UI error state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [codeError, setCodeError] = useState('');

  const resetErrors = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setCodeError('');
  };

  const handleAuth = async () => {
    if (!isLoaded) return;

    resetErrors();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn.create({
          identifier: email.trim(),
          password,
        });

        await setActiveSignIn({ session: result.createdSessionId });
        router.replace('/infogathering');
      } else {
        if (password !== confirmPassword) {
          setConfirmError('Passwords do not match');
          setLoading(false);
          return;
        }

        await signUp.create({
          emailAddress: email.trim(),
          password,
        });

        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code',
        });

        setPendingVerification(true);
      }
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => {
          if (e.meta?.paramName === 'email_address' || e.code.includes('identifier')) {
            setEmailError(e.longMessage || e.message);
          } else if (e.meta?.paramName === 'password') {
            setPasswordError(e.longMessage || e.message);
          } else {
            setPasswordError(e.longMessage || e.message);
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    resetErrors();
    setLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActiveSignUp({ session: signUpAttempt.createdSessionId });
        router.replace('/infogathering');
      }
    } catch (err: any) {
      setCodeError(err.errors?.[0]?.longMessage || 'Invalid code');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>
              {pendingVerification
                ? 'CHECK YOUR EMAIL'
                : isLogin
                  ? 'WELCOME BACK'
                  : 'GROW WITH CONFIDENCE'}
            </Text>
          </View>

          {!pendingVerification && (
            <View style={styles.heroContainer}>
              <LinearGradient
                colors={['rgba(29, 185, 84, 0.2)', 'transparent']}
                style={styles.glow}
              />
              <View style={styles.iconCircle}>
                <Leaf color="#1DB954" size={60} strokeWidth={1.5} />
              </View>
            </View>
          )}

          <View style={styles.form}>
            {pendingVerification ? (
              <View>
                <Text style={styles.smallTextCenter}>Enter the 6-digit code sent to {email}</Text>

                <View style={[styles.inputWrapper, codeError && styles.inputError]}>
                  <Lock color="#1DB954" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Verification Code"
                    placeholderTextColor="#666"
                    style={styles.input}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                  />
                </View>
                {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}

                <TouchableOpacity style={styles.mainBtn} onPress={onVerifyPress} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Text style={styles.mainBtnText}>VERIFY ACCOUNT</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
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
                      <Text style={styles.mainBtnText}>{isLogin ? 'LOGIN' : 'CONTINUE'}</Text>
                      <ArrowRight color="black" size={20} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
                  <Text style={styles.smallTextCenter}>
                    {isLogin ? 'New here? Sign Up' : 'Already have an account? Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {!pendingVerification && (
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
          )}
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
  heroContainer: { height: 160, justifyContent: 'center', alignItems: 'center' },
  glow: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
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
    height: 60,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: { borderColor: '#ff4d4f' },
  errorText: { color: '#ff4d4f', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: 'white', fontSize: 16 },
  mainBtn: {
    backgroundColor: '#1DB954',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mainBtnText: { color: 'black', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  switchBtn: { marginTop: 20 },
  smallTextCenter: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 10 },
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
});

export default Register;
