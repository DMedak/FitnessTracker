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

  const getActivityType = (item: Aktivnost) =>
    item.vrstaAktivnosti || item.vrsta_aktivnosti || 'Activity';

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

  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) =>
        new Date(getActivityDate(b)).getTime() -
        new Date(getActivityDate(a)).getTime()
    );
  }, [activities]);

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
      return null;
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

  const todayActivities = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');

    return activities.filter((item) => getActivityDate(item) === today);
  }, [activities]);

  const todayCalories = useMemo(() => {
    return Math.round(
      todayActivities.reduce((sum, item) => sum + getActivityCalories(item), 0)
    );
  }, [todayActivities]);

  const todayMinutes = useMemo(() => {
    return todayActivities.reduce(
      (sum, item) => sum + Number(item.trajanje || 0),
      0
    );
  }, [todayActivities]);

  const weeklyActivities = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);

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

  const activeDaysThisWeek = useMemo(() => {
    const days = new Set(
      weeklyActivities.map((item) => getActivityDate(item)).filter(Boolean)
    );

    return days.size;
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

  const weeklyGoalPercent = useMemo(() => {
    const goalDays = 5;
    const progress = Math.round((activeDaysThisWeek / goalDays) * 100);

    return Math.min(progress, 100);
  }, [activeDaysThisWeek]);

  const topActivityType = useMemo(() => {
    if (weeklyActivities.length === 0) {
      return null;
    }

    const counts: Record<string, number> = {};

    weeklyActivities.forEach((item) => {
      const type = getActivityType(item);
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [weeklyActivities]);

  const latestActivity =
    sortedActivities.length > 0 ? sortedActivities[0] : null;

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

  const getTodayMessage = () => {
    if (todayActivities.length === 0) {
      return 'No activities yet today. Add a workout and start building momentum.';
    }

    if (todayCalories >= 500) {
      return 'Great pace today. You already have a strong daily result.';
    }

    return 'Good start. One more short activity would nicely complete the day.';
  };

  const getWeightChangeText = () => {
    if (weightChange === null) {
      return '--';
    }

    if (weightChange > 0) {
      return `+${weightChange.toFixed(1)} kg`;
    }

    return `${weightChange.toFixed(1)} kg`;
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
            <View>
              <Text style={styles.headerTitle}>
                {profil?.korisnickoIme
                  ? `Hello, ${profil.korisnickoIme}! 👋`
                  : 'Hello! 👋'}
              </Text>

              <Text style={styles.headerSubtitle}>
                Your daily fitness overview
              </Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['#06b6d4', '#10b981']}
            style={styles.todayCard}
          >
            <View style={styles.todayTopRow}>
              <View style={styles.todayTextBlock}>
                <Text style={styles.todayLabel}>Today's Summary</Text>
                <Text style={styles.todayMessage}>{getTodayMessage()}</Text>
              </View>

              <View style={styles.todayIconCircle}>
                <MaterialCommunityIcons name="fire" size={30} color="white" />
              </View>
            </View>

            <View style={styles.todayMainRow}>
              <Text style={styles.todayCalories}>{todayCalories}</Text>
              <Text style={styles.todayUnit}>kcal</Text>
            </View>

            <View style={styles.todayStatsRow}>
              <View style={styles.todaySmallStat}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={19}
                  color="white"
                />
                <Text style={styles.todaySmallValue}>{todayMinutes} min</Text>
              </View>

              <View style={styles.todaySmallStat}>
                <MaterialCommunityIcons
                  name="run-fast"
                  size={19}
                  color="white"
                />
                <Text style={styles.todaySmallValue}>
                  {todayActivities.length} activities
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.weekCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Weekly Momentum</Text>
                <Text style={styles.cardSubtitle}>
                  Active {activeDaysThisWeek} of 5 target days
                </Text>
              </View>

              <View style={styles.streakBadge}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={18}
                  color="#059669"
                />
                <Text style={styles.streakText}>{streak} days</Text>
              </View>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${weeklyGoalPercent}%` },
                ]}
              />
            </View>

            <View style={styles.weekStatsRow}>
              <View style={styles.weekStatItem}>
                <Text style={styles.weekValue}>{weeklyCalories}</Text>
                <Text style={styles.weekLabel}>kcal</Text>
              </View>

              <View style={styles.weekDivider} />

              <View style={styles.weekStatItem}>
                <Text style={styles.weekValue}>{weeklyMinutes}</Text>
                <Text style={styles.weekLabel}>minutes</Text>
              </View>

              <View style={styles.weekDivider} />

              <View style={styles.weekStatItem}>
                <Text style={styles.weekValue}>{weeklyActivities.length}</Text>
                <Text style={styles.weekLabel}>activities</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Your Metrics</Text>

          <View style={styles.metricsGrid}>
            <MetricCard
              icon="scale-bathroom"
              label="Weight"
              value={currentWeight ? `${currentWeight} kg` : '-- kg'}
              description={`Goal: ${goalText()}`}
            />

            <MetricCard
              icon="human-male-height"
              label="BMI"
              value={bmi}
              description={bmiCategory}
            />

            <MetricCard
              icon="trending-up"
              label="Change"
              value={getWeightChangeText()}
              description="Last entry"
              valueStyle={
                weightChange !== null && weightChange < 0
                  ? styles.goodText
                  : styles.warningText
              }
            />
          </View>

          {latestActivity && (
            <View style={styles.latestCard}>
              <View style={styles.latestIcon}>
                <MaterialCommunityIcons
                  name="run-fast"
                  size={27}
                  color="#0891b2"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.latestLabel}>Latest Activity</Text>
                <Text style={styles.latestTitle}>
                  {getActivityType(latestActivity)}
                </Text>
                <Text style={styles.latestSubtitle}>
                  {latestActivity.trajanje} min •{' '}
                  {getActivityCalories(latestActivity)} kcal
                </Text>
              </View>
            </View>
          )}

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={26}
                color="#0891b2"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.insightLabel}>Insight</Text>
              <Text style={styles.insightText}>
                {topActivityType
                  ? `Your most common activity this week is ${topActivityType}. Keep building your rhythm.`
                  : 'Add your first activity this week and start building momentum.'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionGrid}>
            <ActionButton
              icon="run"
              label="Add Activity"
              onPress={() => router.push('/add-activity')}
            />

            <ActionButton
              icon="scale-bathroom"
              label="Add Weight"
              onPress={() => router.push('/add-weight')}
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

function MetricCard({
  icon,
  label,
  value,
  description,
  valueStyle,
}: {
  icon: any;
  label: string;
  value: string;
  description: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>
        <MaterialCommunityIcons name={icon} size={24} color="#0891b2" />
      </View>

      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueStyle]}>{value}</Text>
      <Text style={styles.metricDescription}>{description}</Text>
    </View>
  );
}

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
        <MaterialCommunityIcons name={icon} size={27} color="#0891b2" />
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
    paddingBottom: 34,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },

  headerTitle: {
    color: 'white',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  headerSubtitle: {
    color: '#ccfbf1',
    marginTop: 8,
    fontSize: 17,
    fontWeight: '600',
  },

  todayCard: {
    margin: 16,
    marginTop: 22,
    padding: 22,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    overflow: 'hidden',
  },

  todayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
  },

  todayTextBlock: {
    flex: 1,
    paddingRight: 8,
  },

  todayLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },

  todayMessage: {
    color: '#ecfeff',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 255,
    fontWeight: '500',
  },

  todayIconCircle: {
    width: 58,
    height: 58,
    minWidth: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 2,
  },

  todayMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 28,
  },

  todayCalories: {
    color: 'white',
    fontSize: 56,
    fontWeight: '800',
  },

  todayUnit: {
    color: '#ecfeff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 8,
  },

  todayStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  todaySmallStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
  },

  todaySmallValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  weekCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 20,
    borderRadius: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  cardTitle: {
    color: '#1f2937',
    fontSize: 24,
    fontWeight: '800',
  },

  cardSubtitle: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 5,
    fontWeight: '500',
  },

  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  streakText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
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
    borderRadius: 999,
  },

  weekStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },

  weekStatItem: {
    flex: 1,
    alignItems: 'center',
  },

  weekValue: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '800',
  },

  weekLabel: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 3,
    fontWeight: '600',
  },

  weekDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#e5e7eb',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    color: '#1f2937',
  },

  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
  },

  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  metricLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },

  metricValue: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },

  metricDescription: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 5,
    fontWeight: '600',
  },

  goodText: {
    color: '#059669',
  },

  warningText: {
    color: '#f97316',
  },

  latestCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  latestIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  latestLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },

  latestTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 3,
  },

  latestSubtitle: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 4,
    fontWeight: '500',
  },

  insightCard: {
    backgroundColor: '#f0fdfa',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 18,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },

  insightIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightLabel: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  insightText: {
    color: '#115e59',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
    marginTop: 5,
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 16,
  },

  actionButton: {
    width: '47.8%',
    height: 112,
    backgroundColor: 'white',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});