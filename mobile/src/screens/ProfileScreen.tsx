import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  calculateBMI,
  getBMICategory,
  getDailyCalorieGoal,
} from '../utils/calculations';
import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';


type UserData = {
  korisnickoIme: string;
  ime: string;
  prezime: string;
  mail: string;
};

type ProfilData = {
  korisnickoIme: string;
  dob: number;
  spol: 'male' | 'female' | 'other';
  visina: number;
  trenutnaTezina: number;
  cilj: 'loss' | 'gain' | 'maintenance';
};

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [profil, setProfil] = useState<ProfilData | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');
    const storedUser = await AsyncStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (!korisnickoIme) {
      return;
    }

    const response = await fetch(`${API_URL}/profil/${korisnickoIme}`);
    const data = await response.json();

    if (response.ok) {
      setProfil(data);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('korisnickoIme');
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('profil');
          router.replace('/');
        },
      },
    ]);
  };

  const openHelpPdf = async () => {
    try {
      const asset = Asset.fromModule(require('../../assets/images/Help.pdf'));
      await asset.downloadAsync();

      const fromUri = asset.localUri || asset.uri;
      const fileUri = `${FileSystem.cacheDirectory}Help.pdf`;

      await FileSystem.copyAsync({
        from: fromUri,
        to: fileUri,
      });

      const contentUri = await FileSystem.getContentUriAsync(fileUri);

      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: 'application/pdf',
        flags: 1,
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Help document could not be opened.');
    }
  };

  const bmi =
    profil ? calculateBMI(profil.trenutnaTezina, profil.visina) : '--';

  const bmiCategory =
    profil ? getBMICategory(Number(bmi)) : '--';

  const dailyCalories =
    profil
      ? getDailyCalorieGoal(
          profil.dob,
          profil.spol,
          profil.trenutnaTezina,
          profil.visina,
          profil.cilj
        )
      : '--';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-outline" size={36} color="white" />
          </View>

          <View>
            <Text style={styles.nameText}>
              {user ? `${user.ime} ${user.prezime}` : 'User'}
            </Text>
            <Text style={styles.emailText}>
              {user?.mail || user?.korisnickoIme || ''}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          {profil ? (
            <View style={styles.infoGrid}>
              <InfoBox icon="account-outline" label="Age" value={`${profil.dob} years`} />
              <InfoBox icon="account-outline" label="Gender" value={profil.spol} />
              <InfoBox icon="ruler" label="Height" value={`${profil.visina} cm`} />
              <InfoBox icon="scale-bathroom" label="Current" value={`${profil.trenutnaTezina} kg`} />
              <InfoBox
                icon="target"
                label="Goal"
                value={
                  profil.cilj === 'loss'
                    ? 'Weight Loss'
                    : profil.cilj === 'gain'
                      ? 'Weight Gain'
                      : 'Maintain'
                }
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>
              Profile data not found. Complete onboarding first.
            </Text>
          )}
        </View>

        {profil && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Health Metrics</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricCyan}>
                <Text style={styles.metricLabel}>BMI</Text>
                <Text style={styles.metricCyanValue}>{bmi}</Text>
                <Text style={styles.metricSmall}>{bmiCategory}</Text>
              </View>

              <View style={styles.metricGreen}>
                <Text style={styles.metricLabel}>Daily Calorie Goal</Text>
                <Text style={styles.metricGreenValue}>{dailyCalories}</Text>
                <Text style={styles.metricSmall}>kcal/day</Text>
              </View>
            </View>
          </View>
        )}

        <Pressable style={styles.helpButton} onPress={openHelpPdf}>
          <MaterialCommunityIcons name="file-document-outline" size={20} color="#0891b2" />
          <Text style={styles.helpText}>Open Help Guide</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <BottomNav />
    </View>
  );
};

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoBox}>
      <MaterialCommunityIcons name={icon} size={22} color="#64748b" />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ecfeff',
  },
  header: {
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  emailText: {
    color: '#cffafe',
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoBox: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  infoValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCyan: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
    borderRadius: 12,
  },
  metricGreen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 5,
  },
  metricCyanValue: {
    color: '#0891b2',
    fontSize: 26,
    fontWeight: '700',
  },
  metricGreenValue: {
    color: '#059669',
    fontSize: 26,
    fontWeight: '700',
  },
  metricSmall: {
    color: '#64748b',
    fontSize: 12,
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: 'white',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  helpButton: {
  height: 50,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#a5f3fc',
  backgroundColor: 'white',
  flexDirection: 'row',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'center',
},
helpText: {
  color: '#0891b2',
  fontWeight: '700',
  fontSize: 16,
},
});