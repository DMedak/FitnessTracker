import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ProgressScreen: React.FC = () => {
  const { weights, activities } = useApp();

  const weightChartData = useMemo(() => {
    return [...weights]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((w) => ({
        date: new Date(w.date).toLocaleDateString(),
        weight: w.weight,
      }));
  }, [weights]);

  const weeklyActivityData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));

      const dayActivities = activities.filter(
        (a) => new Date(a.date).toDateString() === date.toDateString()
      );

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: dayActivities.reduce((sum, a) => sum + a.caloriesBurned, 0),
        duration: dayActivities.reduce((sum, a) => sum + a.duration, 0),
      };
    });
  }, [activities]);

  const activityDistribution = useMemo(() => {
    const typeMap = new Map<string, number>();

    activities.forEach((a) => {
      typeMap.set(a.type, (typeMap.get(a.type) || 0) + a.duration);
    });

    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [activities]);

  const weightProgress = useMemo(() => {
    if (weights.length < 2) return { change: '0.0', percentage: '0.0' };

    const sorted = [...weights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    const change = last - first;
    const percentage = ((change / first) * 100).toFixed(1);

    return { change: change.toFixed(1), percentage };
  }, [weights]);

  const totalActivities = activities.length;
  const totalCalories = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <Text style={styles.headerTitle}>Progress & Statistics</Text>
        <Text style={styles.headerSubtitle}>Your fitness journey insights</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.statCard}>
            <MaterialCommunityIcons
              name={parseFloat(weightProgress.change) < 0 ? 'trending-down' : 'trending-up'}
              size={28}
              color="white"
            />
            <Text style={styles.statNumber}>
              {parseFloat(weightProgress.change) > 0 ? '+' : ''}
              {weightProgress.change} kg
            </Text>
            <Text style={styles.statLabel}>Weight Change</Text>
          </LinearGradient>

          <LinearGradient colors={['#10b981', '#059669']} style={styles.statCard}>
            <MaterialCommunityIcons name="run-fast" size={28} color="white" />
            <Text style={styles.statNumber}>{totalActivities}</Text>
            <Text style={styles.statLabel}>Total Activities</Text>
          </LinearGradient>
        </View>

        {weightChartData.length > 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weight Over Time</Text>

            {weightChartData.map((item, index) => (
              <View key={index} style={styles.rowItem}>
                <Text style={styles.rowLabel}>{item.date}</Text>
                <Text style={styles.rowValue}>{item.weight} kg</Text>
              </View>
            ))}
          </View>
        )}

        {weeklyActivityData.some((d) => d.calories > 0) && (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="fire" size={22} color="#f97316" />
              <Text style={styles.cardTitle}>Weekly Calories Burned</Text>
            </View>

            {weeklyActivityData.map((item) => (
              <View key={item.day} style={styles.rowItem}>
                <Text style={styles.rowLabel}>{item.day}</Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.min(item.calories / 10, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.rowValue}>{item.calories}</Text>
              </View>
            ))}
          </View>
        )}

        {activityDistribution.length > 0 && (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="calendar-outline" size={22} color="#8b5cf6" />
              <Text style={styles.cardTitle}>Activity Distribution</Text>
            </View>

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
          <LinearGradient colors={['#f97316', '#ef4444']} style={styles.totalCard}>
            <MaterialCommunityIcons name="fire" size={48} color="white" />
            <Text style={styles.totalNumber}>{totalCalories}</Text>
            <Text style={styles.totalLabel}>Total Calories Burned</Text>
          </LinearGradient>
        )}

        {weights.length === 0 && activities.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="calendar-outline" size={34} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No data to display yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your weight and activities to see your progress
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => router.push('/dashboard')}>
          <MaterialCommunityIcons name="home" size={26} color="#64748b" />
        </Pressable>
        <Pressable onPress={() => router.push('/activity')}>
          <MaterialCommunityIcons name="run" size={26} color="#64748b" />
        </Pressable>
        <Pressable onPress={() => router.push('/weight')}>
          <MaterialCommunityIcons name="scale-bathroom" size={26} color="#64748b" />
        </Pressable>
        <Pressable onPress={() => router.push('/profile')}>
          <MaterialCommunityIcons name="account" size={26} color="#64748b" />
        </Pressable>
      </View>
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
    paddingBottom: 95,
    gap: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  statNumber: {
    color: 'white',
    fontSize: 25,
    fontWeight: '700',
    marginTop: 10,
  },
  statLabel: {
    color: '#ecfeff',
    fontSize: 13,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLabel: {
    flex: 1,
    color: '#64748b',
  },
  rowValue: {
    color: '#111827',
    fontWeight: '700',
  },
  barWrapper: {
    flex: 2,
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  totalCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  totalNumber: {
    color: 'white',
    fontSize: 40,
    fontWeight: '700',
    marginTop: 10,
  },
  totalLabel: {
    color: '#ffedd5',
    fontSize: 17,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});