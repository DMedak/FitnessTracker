import React from 'react';
import {
  Alert,
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

import { formatDate } from '../utils/calculations';
import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';

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

export const ActivityHistoryScreen: React.FC = () => {
  const [activities, setActivities] = React.useState<Aktivnost[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadAktivnosti();
    }, [])
  );

  const getActivityDate = (activity: Aktivnost) =>
    activity.datumAktivnosti || activity.datum_aktivnosti || '';

  const getActivityType = (activity: Aktivnost) =>
    activity.vrstaAktivnosti || activity.vrsta_aktivnosti || 'Unknown';

  const getActivityCalories = (activity: Aktivnost) =>
    Number(activity.potrosnjaKalorija || activity.potrosnja_kalorija || 0);

  const loadAktivnosti = async () => {
    try {
      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

      if (!korisnickoIme) {
        return;
      }

      const response = await fetch(`${API_URL}/aktivnost/${korisnickoIme}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setActivities(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sortedActivities = [...activities].sort(
    (a, b) =>
      new Date(getActivityDate(b)).getTime() -
      new Date(getActivityDate(a)).getTime()
  );

  const totalCalories = activities.reduce(
    (sum, a) => sum + getActivityCalories(a),
    0
  );

  const today = new Date().toLocaleDateString('en-CA');

  const todayCalories = activities
    .filter((a) => getActivityDate(a) === today)
    .reduce((sum, a) => sum + getActivityCalories(a), 0);

  const totalDuration = activities.reduce(
    (sum, a) => sum + Number(a.trajanje || 0),
    0
  );

  const handleDelete = async (activity: Aktivnost) => {
    try {
      const korisnickoIme =
        activity.korisnickoIme || activity.korisnicko_ime;

      const datum =
        activity.datumAktivnosti || activity.datum_aktivnosti;

      const vrsta =
        activity.vrstaAktivnosti || activity.vrsta_aktivnosti;

      const response = await fetch(
        `${API_URL}/aktivnost/${korisnickoIme}/${datum}/${vrsta}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setActivities((prev) =>
          prev.filter(
            (a) =>
              !(
                getActivityDate(a) === datum &&
                getActivityType(a) === vrsta
              )
          )
        );

        Alert.alert('Success', 'Activity deleted successfully.');
      } else {
        Alert.alert('Error', 'Failed to delete activity.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <Text style={styles.headerTitle}>Activity History</Text>
        <Text style={styles.headerSubtitle}>Your workout journey</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={['#06b6d4', '#10b981']}
          style={styles.summaryCard}
        >
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryLabel}>Activity Summary</Text>
              <Text style={styles.summaryMessage}>
                {activities.length > 0
                  ? 'Track your workouts, calories and total active time.'
                  : 'No activities yet. Add your first workout and start tracking.'}
              </Text>
            </View>

            <View style={styles.summaryIconCircle}>
              <MaterialCommunityIcons name="run-fast" size={30} color="white" />
            </View>
          </View>

          <View style={styles.summaryMainRow}>
            <Text style={styles.summaryNumber}>{activities.length}</Text>
            <Text style={styles.summaryUnit}>activities</Text>
          </View>

          <View style={styles.summaryStatsGrid}>
            <View style={styles.summaryStatBox}>
              <MaterialCommunityIcons name="fire" size={22} color="white" />
              <Text style={styles.summaryStatValue}>{totalCalories}</Text>
              <Text style={styles.summaryStatLabel}>Total kcal</Text>
            </View>

            <View style={styles.summaryStatBox}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={22}
                color="white"
              />
              <Text style={styles.summaryStatValue}>{totalDuration}</Text>
              <Text style={styles.summaryStatLabel}>Minutes</Text>
            </View>

            <View style={styles.summaryStatBox}>
              <MaterialCommunityIcons
                name="calendar-today"
                size={22}
                color="white"
              />
              <Text style={styles.summaryStatValue}>{todayCalories}</Text>
              <Text style={styles.summaryStatLabel}>Today kcal</Text>
            </View>
          </View>
        </LinearGradient>

        <Pressable onPress={() => router.push('/add-activity')}>
          <LinearGradient
            colors={['#06b6d4', '#10b981']}
            style={styles.addButton}
          >
            <MaterialCommunityIcons name="plus" size={23} color="white" />
            <Text style={styles.addButtonText}>Add Activity</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.sectionTitle}>Recent Activities</Text>

        {sortedActivities.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={34}
                color="#0891b2"
              />
            </View>

            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptyText}>
              Start tracking by adding your first activity
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedActivities.map((activity, index) => (
              <View
                key={`${getActivityDate(activity)}-${getActivityType(activity)}-${index}`}
                style={styles.card}
              >
                <View style={styles.row}>
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons
                      name="run-fast"
                      size={24}
                      color="#0891b2"
                    />
                  </View>

                  <View style={styles.entryContent}>
                    <Text style={styles.activityTitle}>
                      {getActivityType(activity)}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={17}
                          color="#64748b"
                        />
                        <Text style={styles.metaText}>
                          {activity.trajanje} min
                        </Text>
                      </View>

                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons
                          name="fire"
                          size={17}
                          color="#f97316"
                        />
                        <Text style={styles.metaText}>
                          {getActivityCalories(activity)} kcal
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.dateText}>
                      {formatDate(getActivityDate(activity))}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(activity)}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={22}
                      color="#ef4444"
                    />
                  </Pressable>
                </View>
              </View>
            ))}
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
    fontSize: 31,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
  },

  headerSubtitle: {
    color: '#cffafe',
    fontSize: 16,
    fontWeight: '500',
  },

  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 14,
  },

  summaryCard: {
    padding: 20,
    borderRadius: 22,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
  },

  summaryTextBlock: {
    flex: 1,
  },

  summaryLabel: {
    color: 'white',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },

  summaryMessage: {
    color: '#ecfeff',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },

  summaryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 22,
  },

  summaryNumber: {
    color: 'white',
    fontSize: 48,
    fontWeight: '800',
  },

  summaryUnit: {
    color: '#ecfeff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 7,
  },

  summaryStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  summaryStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },

  summaryStatValue: {
    color: 'white',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 7,
  },

  summaryStatLabel: {
    color: '#ecfeff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },

  addButton: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#10b981',
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
  },

  addButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 4,
  },

  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },

  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },

  list: {
    gap: 12,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  activityIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  entryContent: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 7,
  },

  metaRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 7,
    flexWrap: 'wrap',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  metaText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },

  dateText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },

  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});