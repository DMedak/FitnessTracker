import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';
import { calculateBMI, getBMICategory } from '../utils/calculations';

type Profil = {
  korisnickoIme: string;
  dob: number;
  spol: string;
  visina: number;
  trenutnaTezina: number;
  cilj: string;
};

type Tezina = {
  korisnickoIme?: string;
  korisnicko_ime?: string;
  datumUnosa?: string;
  datum_unosa?: string;
  tezina: number | string;
  napomena?: string;
};

type Aktivnost = {
  datumAktivnosti?: string;
  datum_aktivnosti?: string;
  vrstaAktivnosti?: string;
  vrsta_aktivnosti?: string;
  trajanje: number | string;
  potrosnjaKalorija?: number | string;
  potrosnja_kalorija?: number | string;
};

export const DashboardScreen = () => {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [weights, setWeights] = useState<Tezina[]>([]);
  const [activities, setActivities] = useState<Aktivnost[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const getWeightDate = (item: Tezina) =>
    item.datumUnosa || item.datum_unosa || '';

  const getActivityDate = (item: Aktivnost) =>
    item.datumAktivnosti || item.datum_aktivnosti || '';

  const getActivityCalories = (item: Aktivnost) =>
    Number(item.potrosnjaKalorija || item.potrosnja_kalorija || 0);

  const loadDashboardData = async () => {
    try {
      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

      if (!korisnickoIme) {
        return;
      }

      const [profileResponse, weightResponse, activityResponse] =
        await Promise.all([
          fetch(`${API_URL}/profil/${korisnickoIme}`),
          fetch(`${API_URL}/tezina/${korisnickoIme}`),
          fetch(`${API_URL}/aktivnost/${korisnickoIme}`),
        ]);

      const profileData = await profileResponse.json();
      const weightData = await weightResponse.json();
      const activityData = await activityResponse.json();

      if (profileResponse.ok) {
        setProfil(profileData);
      }

      if (weightResponse.ok && Array.isArray(weightData)) {
        setWeights(weightData);
      }

      if (activityResponse.ok && Array.isArray(activityData)) {
        setActivities(activityData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sortedWeights = useMemo(() => {
    return [...weights].sort(
      (a, b) =>
        new Date(getWeightDate(b)).getTime() -
        new Date(getWeightDate(a)).getTime()
    );
  }, [weights]);

  const currentWeight = useMemo(() => {
    if (sortedWeights.length > 0) {
      const latestWeight = Number(sortedWeights[0].tezina);

      if (!Number.isNaN(latestWeight)) {
        return latestWeight;
      }
    }

    if (profil?.trenutnaTezina) {
      return Number(profil.trenutnaTezina);
    }

    return null;
  }, [sortedWeights, profil]);

  const previousWeight = useMemo(() => {
    if (sortedWeights.length > 1) {
      const previous = Number(sortedWeights[1].tezina);

      if (!Number.isNaN(previous)) {
        return previous;
      }
    }

    return null;
  }, [sortedWeights]);

  const weightChange = useMemo(() => {
    if (!currentWeight || !previousWeight) {
      return 0;
    }

    return Number((currentWeight - previousWeight).toFixed(1));
  }, [currentWeight, previousWeight]);

  const bmi = useMemo(() => {
    if (!profil?.visina || !currentWeight) {
      return '--';
    }

    return calculateBMI(currentWeight, profil.visina).toString();
  }, [profil, currentWeight]);

  const bmiCategory = useMemo(() => {
    if (bmi === '--') {
      return '--';
    }

    return getBMICategory(Number(bmi));
  }, [bmi]);

  const todayCalories = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');

    return Math.round(
      activities
        .filter((item) => getActivityDate(item) === today)
        .reduce((sum, item) => sum + getActivityCalories(item), 0)
    );
  }, [activities]);

  const weeklyActivities = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    return activities.filter((item) => {
      const date = new Date(getActivityDate(item));
      return date >= sevenDaysAgo && date <= today;
    });
  }, [activities]);

  const weeklyCalories = useMemo(() => {
    return Math.round(
      weeklyActivities.reduce((sum, item) => sum + getActivityCalories(item), 0)
    );
  }, [weeklyActivities]);

  const weeklyMinutes = useMemo(() => {
    return weeklyActivities.reduce(
      (sum, item) => sum + Number(item.trajanje || 0),
      0
    );
  }, [weeklyActivities]);

  const streak = useMemo(() => {
    const activityDates = new Set(
      activities.map((item) => getActivityDate(item)).filter(Boolean)
    );

    let count = 0;
    const date = new Date();

    while (true) {
      const key = date.toLocaleDateString('en-CA');

      if (activityDates.has(key)) {
        count += 1;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }

    return count;
  }, [activities]);

  const progressPercent = useMemo(() => {
    if (weights.length < 2) {
      return 35;
    }

    const chronological = [...weights].sort(
      (a, b) =>
        new Date(getWeightDate(a)).getTime() -
        new Date(getWeightDate(b)).getTime()
    );

    const start = Number(chronological[0].tezina);
    const latest = Number(chronological[chronological.length - 1].tezina);

    if (Number.isNaN(start) || Number.isNaN(latest) || start === latest) {
      return 35;
    }

    const diff = Math.abs(latest - start);
    const estimatedGoalDistance = Math.max(diff * 2, 1);
    const progress = Math.round((diff / estimatedGoalDistance) * 100);

    return Math.min(Math.max(progress, 15), 100);
  }, [weights]);

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

  const latestActivity = activities.length > 0 ? activities[activities.length - 1] : null;

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
            <View>
              <Text style={styles.headerTitle}>
                {profil?.korisnickoIme
                  ? `Hello, ${profil.korisnickoIme}! 👋`
                  : 'Hello! 👋'}
              </Text>

              <Text style={styles.headerSubtitle}>
                Here is your fitness overview
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Current Weight</Text>
                <Text style={styles.heroWeight}>
                  {currentWeight ? `${currentWeight} kg` : '-- kg'}
                </Text>
              </View>

              <View style={styles.goalPill}>
                <MaterialCommunityIcons name="target" size={17} color="#0891b2" />
                <Text style={styles.goalPillText}>{goalText()}</Text>
              </View>
            </View>

            <View style={styles.heroStatsRow}>
              <View style={styles.heroMiniStat}>
                <Text style={styles.heroMiniLabel}>BMI</Text>
                <Text style={styles.heroMiniValue}>{bmi}</Text>
                <Text style={styles.heroMiniSmall}>{bmiCategory}</Text>
              </View>

              <View style={styles.heroMiniStat}>
                <Text style={styles.heroMiniLabel}>Change</Text>
                <Text
                  style={[
                    styles.heroMiniValue,
                    weightChange < 0 ? styles.goodText : styles.warningText,
                  ]}
                >
                  {weightChange > 0 ? '+' : ''}
                  {weightChange.toFixed(1)} kg
                </Text>
                <Text style={styles.heroMiniSmall}>Last entry</Text>
              </View>
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Progress trend</Text>
              <Text style={styles.progressText}>{progressPercent}%</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.grid}>
            <LinearGradient
              colors={['#f97316', '#ef4444']}
              style={styles.statCard}
            >
              <MaterialCommunityIcons name="fire" size={30} color="white" />
              <Text style={styles.statNumber}>{todayCalories}</Text>
              <Text style={styles.statLabel}>Calories Today</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#8b5cf6', '#ec4899']}
              style={styles.statCard}
            >
              <MaterialCommunityIcons name="calendar-week" size={30} color="white" />
              <Text style={styles.statNumber}>{weeklyActivities.length}</Text>
              <Text style={styles.statLabel}>Activities This Week</Text>
            </LinearGradient>
          </View>

          <View style={styles.weekCard}>
            <Text style={styles.cardTitle}>This Week</Text>

            <View style={styles.weekGrid}>
              <View style={styles.weekItem}>
                <MaterialCommunityIcons name="fire" size={22} color="#f97316" />
                <Text style={styles.weekValue}>{weeklyCalories}</Text>
                <Text style={styles.weekLabel}>kcal</Text>
              </View>

              <View style={styles.weekItem}>
                <MaterialCommunityIcons name="clock-outline" size={22} color="#06b6d4" />
                <Text style={styles.weekValue}>{weeklyMinutes}</Text>
                <Text style={styles.weekLabel}>minutes</Text>
              </View>

              <View style={styles.weekItem}>
                <MaterialCommunityIcons name="lightning-bolt" size={22} color="#10b981" />
                <Text style={styles.weekValue}>{streak}</Text>
                <Text style={styles.weekLabel}>day streak</Text>
              </View>
            </View>
          </View>

          {latestActivity && (
            <View style={styles.latestCard}>
              <View style={styles.latestIcon}>
                <MaterialCommunityIcons name="run-fast" size={24} color="#0891b2" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.latestLabel}>Latest Activity</Text>
                <Text style={styles.latestTitle}>
                  {latestActivity.vrstaAktivnosti ||
                    latestActivity.vrsta_aktivnosti ||
                    'Activity'}
                </Text>
                <Text style={styles.latestSubtitle}>
                  {latestActivity.trajanje} min •{' '}
                  {getActivityCalories(latestActivity)} kcal
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionGrid}>
            <ActionButton
              icon="plus"
              label="Add Weight"
              onPress={() => router.push('/add-weight')}
            />
            <ActionButton
              icon="run"
              label="Add Activity"
              onPress={() => router.push('/add-activity')}
            />
            <ActionButton
              icon="chart-line"
              label="Progress"
              onPress={() => router.push('/progress')}
            />
            <ActionButton
              icon="account"
              label="Profile"
              onPress={() => router.push('/profile')}
            />
          </View>
        </ScrollView>

        <BottomNav />
      </LinearGradient>
    </View>
  );
};

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon} size={25} color="#0891b2" />
      </View>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

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
    fontSize: 27,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#ccfbf1',
    marginTop: 6,
    fontSize: 15,
  },
  heroCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  heroLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  heroWeight: {
    color: '#111827',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 3,
  },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  goalPillText: {
    color: '#0891b2',
    fontSize: 12,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  heroMiniStat: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
  },
  heroMiniLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  heroMiniValue: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  heroMiniSmall: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  goodText: {
    color: '#059669',
  },
  warningText: {
    color: '#f97316',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },
  progressText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBackground: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
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
    borderRadius: 18,
    minHeight: 122,
  },
  statNumber: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
  },
  statLabel: {
    color: '#fff7ed',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  weekCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    borderRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 9,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 15,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  weekItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  weekValue: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  weekLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  latestCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  latestIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  latestTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  latestSubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    color: '#1f2937',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 16,
  },
  actionButton: {
    width: '47.8%',
    height: 100,
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#374151',
    fontWeight: '800',
    textAlign: 'center',
  },
});