import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from '../src/screens/LoginScreen';

export default function Index() {
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

    if (isLoggedIn === 'true' && korisnickoIme) {
      router.replace('/dashboard');
      return;
    }

    setCheckingLogin(false);
  };

  if (checkingLogin) {
    return (
      <View style={styles.loadingRoot}>
        <Image
          source={require('../assets/images/FitnessTrackerLogo.png')}
          style={styles.loadingLogo}
        />

        <ActivityIndicator size="large" color="#10b981" />

        <Text style={styles.loadingText}>Loading FitTrack...</Text>
      </View>
    );
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfeff',
  },
  loadingLogo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: -30,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
});