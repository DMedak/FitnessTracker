import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const screenWidth = Dimensions.get('window').width - 64;

type Tezina = {
  korisnickoIme?: string;
  korisnicko_ime?: string;
  datumUnosa?: string;
  datum_unosa?: string;
  tezina: number | string;
  napomena?: string;
};

type Aktivnost = {
  korisnickoIme?: string;
  korisnicko_ime?: string;
  datumAktivnosti?: string;
  datum_aktivnosti?: string;
  vrstaAktivnosti?: string;
  vrsta_aktivnosti?: string;
  trajanje: number | string;
  potrosnjaKalorija?: number | string;
  potrosnja_kalorija?: number | string;
  napomena?: string;
};

export const ProgressScreen: React.FC = () => {
  const [weights, setWeights] = useState<Tezina[]>([]);
  const [activities, setActivities] = useState<Aktivnost[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const getWeightDate = (item: Tezina) =>
    item.datumUnosa || item.datum_unosa || '';

  const getActivityDate = (item: Aktivnost) =>
    item.datumAktivnosti || item.datum_aktivnosti || '';

  const getActivityType = (item: Aktivnost) =>
    item.vrstaAktivnosti || item.vrsta_aktivnosti || 'Unknown';

  const getActivityCalories = (item: Aktivnost) =>
    Number(item.potrosnjaKalorija || item.potrosnja_kalorija || 0);

  const loadData = async () => {
    try {
      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

      if (!korisnickoIme) {
        return;
      }

      const [weightResponse, activityResponse] = await Promise.all([
        fetch(`${API_URL}/tezina/${korisnickoIme}`),
        fetch(`${API_URL}/aktivnost/${korisnickoIme}`),
      ]);

      const weightData = await weightResponse.json();
      const activityData = await activityResponse.json();

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

  const weightChartData = useMemo(() => {
    return [...weights]
      .sort(
        (a, b) =>
          new Date(getWeightDate(a)).getTime() -
          new Date(getWeightDate(b)).getTime()
      )
      .map((w) => ({
        date: new Date(getWeightDate(w)).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
        }),
        weight: Number(w.tezina),
      }))
      .filter((w) => !Number.isNaN(w.weight));
  }, [weights]);

  const weeklyActivityData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));

      const dayActivities = activities.filter(
        (a) =>
          new Date(getActivityDate(a)).toDateString() === date.toDateString()
      );

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: dayActivities.reduce(
          (sum, a) => sum + getActivityCalories(a),
          0
        ),
        duration: dayActivities.reduce(
          (sum, a) => sum + Number(a.trajanje),
          0
        ),
      };
    });
  }, [activities]);

  const activityDistribution = useMemo(() => {
    const typeMap = new Map<string, number>();

    activities.forEach((a) => {
      const activityType = getActivityType(a);

      typeMap.set(
        activityType,
        (typeMap.get(activityType) || 0) + Number(a.trajanje)
      );
    });

    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [activities]);

  const weightProgress = useMemo(() => {
    if (weights.length < 2) {
      return { change: '0.0', percentage: '0.0' };
    }

    const sorted = [...weights].sort(
      (a, b) =>
        new Date(getWeightDate(a)).getTime() -
        new Date(getWeightDate(b)).getTime()
    );

    const first = Number(sorted[0].tezina);
    const last = Number(sorted[sorted.length - 1].tezina);

    if (Number.isNaN(first) || Number.isNaN(last) || first === 0) {
      return { change: '0.0', percentage: '0.0' };
    }

    const change = last - first;
    const percentage = ((change / first) * 100).toFixed(1);

    return {
      change: change.toFixed(1),
      percentage,
    };
  }, [weights]);

  const totalActivities = activities.length;

  const totalCalories = activities.reduce(
    (sum, a) => sum + getActivityCalories(a),
    0
  );

  const totalDuration = activities.reduce(
    (sum, a) => sum + Number(a.trajanje),
    0
  );

  const weeklyCalories = weeklyActivityData.reduce(
    (sum, d) => sum + d.calories,
    0
  );

  const weeklyDuration = weeklyActivityData.reduce(
    (sum, d) => sum + d.duration,
    0
  );

  const weeklyActivities = activities.filter((a) => {
    const activityDate = new Date(getActivityDate(a));
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    return activityDate >= sevenDaysAgo && activityDate <= today;
  }).length;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <Text style={styles.headerTitle}>Progress & Statistics</Text>
        <Text style={styles.headerSubtitle}>Your fitness journey insights</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.weekHero}>
          <View style={styles.weekHeroTop}>
            <View>
              <Text style={styles.weekHeroTitle}>This Week</Text>
              <Text style={styles.weekHeroSubtitle}>
                Your last 7 days of progress
              </Text>
            </View>

            <View style={styles.weekHeroIcon}>
              <MaterialCommunityIcons name="chart-line" size={28} color="white" />
            </View>
          </View>

          <View style={styles.weekHeroStats}>
            <View style={styles.weekHeroStat}>
              <Text style={styles.weekHeroValue}>{weeklyActivities}</Text>
              <Text style={styles.weekHeroLabel}>Activities</Text>
            </View>

            <View style={styles.weekDivider} />

            <View style={styles.weekHeroStat}>
              <Text style={styles.weekHeroValue}>
                {Math.round(weeklyCalories)}
              </Text>
              <Text style={styles.weekHeroLabel}>kcal</Text>
            </View>

            <View style={styles.weekDivider} />

            <View style={styles.weekHeroStat}>
              <Text style={styles.weekHeroValue}>{weeklyDuration}</Text>
              <Text style={styles.weekHeroLabel}>min</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons
                name={
                  parseFloat(weightProgress.change) < 0
                    ? 'trending-down'
                    : 'trending-up'
                }
                size={24}
                color="white"
              />
            </View>

            <Text style={styles.statNumber}>
              {parseFloat(weightProgress.change) > 0 ? '+' : ''}
              {weightProgress.change} kg
            </Text>

            <Text style={styles.statLabel}>Weight Change</Text>
          </LinearGradient>

          <LinearGradient colors={['#10b981', '#059669']} style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons name="run-fast" size={24} color="white" />
            </View>

            <Text style={styles.statNumber}>{totalActivities}</Text>
            <Text style={styles.statLabel}>Total Activities</Text>
          </LinearGradient>
        </View>

        {weightChartData.length > 1 && (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={22}
                color="#10b981"
              />
              <Text style={styles.cardTitleNoMargin}>Weight Progress</Text>
            </View>

            <Text style={styles.cardSubtitle}>
              Trend of your weight changes over time
            </Text>

            <LineChart
              data={{
                labels: weightChartData.map((item) => item.date),
                datasets: [
                  {
                    data: weightChartData.map((item) => item.weight),
                  },
                ],
              }}
              width={screenWidth}
              height={220}
              yAxisSuffix=" kg"
              bezier
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                propsForDots: {
                  r: '5',
                  strokeWidth: '2',
                  stroke: '#10b981',
                },
                propsForBackgroundLines: {
                  stroke: '#e5e7eb',
                },
              }}
              style={styles.chart}
            />
          </View>
        )}

        {weeklyActivityData.some((d) => d.calories > 0) && (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="fire" size={22} color="#f97316" />
              <Text style={styles.cardTitleNoMargin}>Weekly Calories Burned</Text>
            </View>

            <Text style={styles.cardSubtitle}>
              Calories burned during the last 7 days
            </Text>

            <BarChart
              data={{
                labels: weeklyActivityData.map((d) => d.day),
                datasets: [
                  {
                    data: weeklyActivityData.map((d) => d.calories),
                  },
                ],
              }}
              width={screenWidth}
              height={230}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              showValuesOnTopOfBars
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                propsForBackgroundLines: {
                  stroke: '#e5e7eb',
                },
              }}
              style={styles.chart}
            />
          </View>
        )}

        {activityDistribution.length > 0 && (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={22}
                color="#8b5cf6"
              />
              <Text style={styles.cardTitleNoMargin}>Activity Distribution</Text>
            </View>

            <Text style={styles.cardSubtitle}>
              Minutes spent by activity type
            </Text>

            {activityDistribution.map((item, index) => (
              <View key={item.name} style={styles.distributionRow}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: COLORS[index % COLORS.length] },
                  ]}
                />

                <Text style={styles.rowLabel}>{item.name}</Text>
                <Text style={styles.rowValue}>{item.value} min</Text>
              </View>
            ))}
          </View>
        )}

        {totalCalories > 0 && (
          <View style={styles.totalCard}>
            <View style={styles.totalIcon}>
              <MaterialCommunityIcons name="fire" size={30} color="#f97316" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>Total Calories Burned</Text>
              <Text style={styles.totalNumber}>
                {Math.round(totalCalories)} kcal
              </Text>
            </View>
          </View>
        )}

        {weights.length === 0 && activities.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="chart-line"
                size={34}
                color="#0891b2"
              />
            </View>

            <Text style={styles.emptyTitle}>No progress data yet</Text>

            <Text style={styles.emptyText}>
              Add your first weight entry or activity to unlock progress charts
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
};

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

  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },

  headerSubtitle: {
    color: '#cffafe',
  },

  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },

  weekHero: {
    borderRadius: 20,
    padding: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  weekHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  weekHeroTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },

  weekHeroSubtitle: {
    color: '#ecfeff',
    fontSize: 14,
    fontWeight: '500',
  },

  weekHeroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekHeroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 16,
    paddingVertical: 14,
  },

  weekHeroStat: {
    flex: 1,
    alignItems: 'center',
  },

  weekHeroValue: {
    color: 'white',
    fontSize: 26,
    fontWeight: '800',
  },

  weekHeroLabel: {
    color: '#ecfeff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  weekDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statNumber: {
    color: 'white',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 12,
  },

  statLabel: {
    color: '#ecfeff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  cardTitleNoMargin: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1f2937',
  },

  cardSubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },

  chart: {
    borderRadius: 16,
    marginLeft: -12,
  },

  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  rowLabel: {
    flex: 1,
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },

  rowValue: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 15,
  },

  totalCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  totalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },

  totalNumber: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    color: '#1f2937',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },

  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});