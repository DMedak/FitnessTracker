import React, { useEffect, useState } from 'react';
import {
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

import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';

type Profil = {
  korisnickoIme: string;
  dob: number;
  spol: string;
  visina: number;
  trenutnaTezina: number;
  cilj: string;
};

export const DashboardScreen = () => {
  const [profil, setProfil] = useState<Profil | null>(null);

  useEffect(() => {
    loadProfil();
  }, []);

  const loadProfil = async () => {
    try {
      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

      if (!korisnickoIme) {
        return;
      }

      const response = await fetch(`${API_URL}/profil/${korisnickoIme}`);
      const data = await response.json();

      if (response.ok) {
        setProfil(data);
      }
    } catch (error) {
      // silent fail for dashboard
    }
  };

  const calculateBMI = () => {
    if (!profil?.visina || !profil?.trenutnaTezina) {
      return '--';
    }

    const heightMeters = profil.visina / 100;
    const bmi = profil.trenutnaTezina / (heightMeters * heightMeters);

    return bmi.toFixed(1);
  };

  const goalText = () => {
    if (!profil?.cilj) {
      return '--';
    }

    switch (profil.cilj) {
      case 'loss':
        return 'Weight Loss';
      case 'gain':
        return 'Weight Gain';
      case 'maintenance':
        return 'Maintain';
      default:
        return profil.cilj;
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#ecfeff', '#eff6ff', '#ecfdf5']}
        style={styles.root}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <LinearGradient
            colors={['#06b6d4', '#10b981']}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>
              {profil?.korisnickoIme
                ? `Hello, ${profil.korisnickoIme}! 👋`
                : 'Hello! 👋'}
            </Text>

            <Text style={styles.headerSubtitle}>
              Continue tracking your progress
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weight Progress</Text>

            <View style={styles.row}>
              <View>
                <Text style={styles.smallText}>Current</Text>

                <Text style={styles.bigText}>
                  {profil?.trenutnaTezina
                    ? `${profil.trenutnaTezina} kg`
                    : '-- kg'}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.smallText}>Goal</Text>

                <Text style={styles.bigTextMuted}>
                  {goalText()}
                </Text>
              </View>
            </View>

            <View style={styles.progressBackground}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.grid}>
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.statCard}
            >
              <MaterialCommunityIcons name="fire" size={30} color="white" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Calories Burned Today</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.statCard}
            >
              <MaterialCommunityIcons name="heart-pulse" size={30} color="white" />
              <Text style={styles.statNumber}>{calculateBMI()}</Text>
              <Text style={styles.statLabel}>BMI</Text>
            </LinearGradient>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.grid}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/add-weight')}
            >
              <MaterialCommunityIcons name="plus" size={28} color="#374151" />
              <Text style={styles.actionText}>Add Weight</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/add-activity')}
            >
              <MaterialCommunityIcons name="plus" size={28} color="#374151" />
              <Text style={styles.actionText}>Add Activity</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/weight')}
            >
              <MaterialCommunityIcons name="scale-bathroom" size={28} color="#374151" />
              <Text style={styles.actionText}>Weight History</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/activity')}
            >
              <MaterialCommunityIcons name="run" size={28} color="#374151" />
              <Text style={styles.actionText}>Activity History</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/progress')}
            >
              <MaterialCommunityIcons name="chart-line" size={28} color="#374151" />
              <Text style={styles.actionText}>Progress</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/profile')}
            >
              <MaterialCommunityIcons name="account" size={28} color="#374151" />
              <Text style={styles.actionText}>Profile</Text>
            </Pressable>
          </View>
        </ScrollView>

        <BottomNav />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 120,
  },
  header: {
    padding: 28,
    paddingTop: 52,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#ccfbf1',
    marginTop: 6,
    fontSize: 15,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallText: {
    color: '#64748b',
    fontSize: 13,
  },
  bigText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1f2937',
  },
  bigTextMuted: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6b7280',
  },
  progressBackground: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: '#06b6d4',
  },
  grid: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    minHeight: 120,
  },
  statNumber: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 12,
  },
  statLabel: {
    color: '#ecfeff',
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    color: '#1f2937',
  },
  actionButton: {
    flex: 1,
    height: 96,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    color: '#374151',
    fontWeight: '700',
    textAlign: 'center',
  },
});