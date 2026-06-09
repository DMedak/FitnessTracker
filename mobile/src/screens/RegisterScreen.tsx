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

import { registerUser } from '../services/authService';

export const RegisterScreen: React.FC = () => {
  const [korisnickoIme, setKorisnickoIme] = useState('');
  const [ime, setIme] = useState('');
  const [prezime, setPrezime] = useState('');
  const [mail, setMail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [confirmLozinka, setConfirmLozinka] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!korisnickoIme || !ime || !prezime || !mail || !lozinka || !confirmLozinka) {
      setError('Please fill in all fields');
      return;
    }

    if (lozinka !== confirmLozinka) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    if (!passwordRegex.test(lozinka)) {
      setError(
        'Password must be at least 6 characters and include one letter and one number'
      );
      return;
    }

    try {
      setIsLoading(true);

      const result = await registerUser({
        korisnickoIme,
        ime,
        prezime,
        mail,
        lozinka,
      });

      await AsyncStorage.setItem('korisnickoIme', korisnickoIme);

      if (result?.token) {
        await AsyncStorage.setItem('token', result.token);
      }

      if (result?.user || result?.korisnik) {
        await AsyncStorage.setItem(
          'user',
          JSON.stringify(result.user || result.korisnik)
        );
      }

      router.replace('/onboarding');
    } catch (err: any) {
      setError(err.message || 'There was an error during registration. Please try again.');
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
              <Text style={styles.subtitle}>Start your fitness journey</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Create Account</Text>
                <Text style={styles.cardSubtitle}>Sign up to get started</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="account-circle-outline"
                    size={22}
                    color="#94a3b8"
                    style={styles.icon}
                  />

                  <TextInput
                    value={korisnickoIme}
                    onChangeText={setKorisnickoIme}
                    placeholder="JohnDoe"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <Text style={styles.label}>First Name</Text>

                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={22}
                      color="#94a3b8"
                      style={styles.icon}
                    />

                    <TextInput
                      value={ime}
                      onChangeText={setIme}
                      placeholder="John"
                      placeholderTextColor="#94a3b8"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.nameInput}>
                  <Text style={styles.label}>Last Name</Text>

                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={22}
                      color="#94a3b8"
                      style={styles.icon}
                    />

                    <TextInput
                      value={prezime}
                      onChangeText={setPrezime}
                      placeholder="Doe"
                      placeholderTextColor="#94a3b8"
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={22}
                    color="#94a3b8"
                    style={styles.icon}
                  />

                  <TextInput
                    value={mail}
                    onChangeText={setMail}
                    placeholder="your@email.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
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
                    placeholder="Create password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
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

                <Text style={styles.hintText}>
                  Password must be at least 6 characters and include one letter and one number.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="lock-check-outline"
                    size={22}
                    color="#94a3b8"
                    style={styles.icon}
                  />

                  <TextInput
                    value={confirmLozinka}
                    onChangeText={setConfirmLozinka}
                    placeholder="Repeat password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    style={[styles.input, styles.passwordInput]}
                  />

                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <MaterialCommunityIcons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
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

              <Pressable onPress={handleRegister} disabled={isLoading}>
                <LinearGradient
                  colors={['#06b6d4', '#10b981']}
                  style={[
                    styles.button,
                    isLoading ? styles.buttonDisabled : null,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>

                <Pressable onPress={() => router.replace('/')}>
                  <Text style={styles.link}>Sign in</Text>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 34,
  },

  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 18,
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: -25,
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
    marginBottom: 22,
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
    marginBottom: 16,
  },

  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  nameInput: {
    flex: 1,
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
    paddingRight: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f8fafc',
  },

  passwordInput: {
    paddingRight: 48,
  },

  eyeIcon: {
    position: 'absolute',
    right: 15,
    zIndex: 1,
  },

  hintText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 7,
    lineHeight: 17,
    fontWeight: '500',
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