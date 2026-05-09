import React, { useState } from 'react';
import {
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

    if (lozinka.length < 6) {
      setError('Password must be at least 6 characters long');
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

      if (result?.error) {
        setError(result.error || 'Registration failed');
        return;
      }

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
              <LinearGradient
                colors={['#06b6d4', '#10b981']}
                style={styles.logoBox}
              >
                <MaterialCommunityIcons name="run-fast" size={34} color="white" />
              </LinearGradient>

              <Text style={styles.title}>FitTrack</Text>
              <Text style={styles.subtitle}>Start your fitness journey</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSubtitle}>Sign up to get started</Text>

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
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
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
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
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
                    style={styles.input}
                  />
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
                    placeholder="••••••••"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>
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
                    placeholder="••••••••"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable onPress={handleRegister} disabled={isLoading}>
                <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.button}>
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
  root: { flex: 1 },
  gradient: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingLeft: 46,
    paddingRight: 14,
    fontSize: 16,
    backgroundColor: 'white',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  link: {
    color: '#0891b2',
    fontSize: 14,
    fontWeight: '700',
  },
});