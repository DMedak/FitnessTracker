import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { loginUser } from '../services/authService';

export const LoginScreen = () => {
  const [korisnickoIme, setKorisnickoIme] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!korisnickoIme || !lozinka) {
      setError('Please enter username and password');
      return;
    }

    try {
      setIsLoading(true);

      const data = await loginUser({
        korisnickoIme,
        lozinka,
      });

      if (!data?.korisnik && !data?.user) {
        setError('Invalid username or password');
        return;
      }

      await AsyncStorage.setItem('korisnickoIme', korisnickoIme);
      await AsyncStorage.setItem('isLoggedIn', 'true');

      await AsyncStorage.setItem(
        'user',
        JSON.stringify(data.korisnik || data.user)
      );

      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'There was an error logging in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#ecfeff', '#eff6ff', '#ecfdf5']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/FitnessTrackerLogo.png')}
                style={styles.logo}
              />

              <Text style={styles.title}>FitnessTracker</Text>
              <Text style={styles.subtitle}>Track your fitness journey</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>Sign in to continue</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={22}
                    color="#94a3b8"
                    style={styles.icon}
                  />

                  <TextInput
                    value={korisnickoIme}
                    onChangeText={setKorisnickoIme}
                    placeholder="Enter username"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={22}
                    color="#94a3b8"
                    style={styles.icon}
                  />

                  <TextInput
                    value={lozinka}
                    onChangeText={setLozinka}
                    placeholder="Enter password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />

                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#94a3b8"
                    />
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={20}
                    color="#ef4444"
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable onPress={handleLogin} disabled={isLoading}>
                <LinearGradient
                  colors={['#06b6d4', '#10b981']}
                  style={[
                    styles.button,
                    isLoading ? styles.buttonDisabled : null,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>

                <Pressable onPress={() => router.push('/register')}>
                  <Text style={styles.link}>Sign up</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  gradient: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },

  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    width: 260,
    height: 260,
    resizeMode: 'contain',
    marginBottom: -72,
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },

  cardHeader: {
    marginBottom: 24,
  },

  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 5,
  },

  cardSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },

  inputGroup: {
    marginBottom: 17,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },

  icon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 15,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f8fafc',
  },

  eyeIcon: {
    position: 'absolute',
    right: 15,
    zIndex: 1,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    padding: 13,
    borderRadius: 14,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  button: {
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#10b981',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.75,
  },

  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },

  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },

  link: {
    color: '#0891b2',
    fontSize: 14,
    fontWeight: '800',
  },
});