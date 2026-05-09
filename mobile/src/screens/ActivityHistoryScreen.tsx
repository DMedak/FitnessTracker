import React from 'react';
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
import { formatDate } from '../utils/calculations';
import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';

type Aktivnost = {
  korisnickoIme: string;
  datumAktivnosti: string;
  vrstaAktivnosti: string;
  trajanje: number;
  potrosnjaKalorija: number;
  napomena?: string;
};

export const ActivityHistoryScreen: React.FC = () => {
  const [activities, setActivities] = React.useState<Aktivnost[]>([]);

  React.useEffect(() => {
    loadAktivnosti();
  }, []);

  const loadAktivnosti = async () => {
    try {
      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

      if (!korisnickoIme) {
        return;
      }

      const response = await fetch(`${API_URL}/aktivnost/${korisnickoIme}`);
      const data = await response.json();

      if (response.ok) {
        setActivities(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sortedActivities = [...activities].sort(
    (a, b) =>
      new Date(b.datumAktivnosti).getTime() -
      new Date(a.datumAktivnosti).getTime()
  );

  const totalCalories = activities.reduce(
    (sum, a) => sum + Number(a.potrosnjaKalorija),
    0
  );

  const totalDuration = activities.reduce(
    (sum, a) => sum + Number(a.trajanje),
    0
  );

  const handleDelete = () => {
    Alert.alert('Info', 'Delete endpoint još nije napravljen na backendu');
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <Text style={styles.headerTitle}>Activity History</Text>
        <Text style={styles.headerSubtitle}>Your workout journey</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {activities.length > 0 && (
          <View style={styles.statsRow}>
            <LinearGradient colors={['#f97316', '#ef4444']} style={styles.statCard}>
              <MaterialCommunityIcons name="fire" size={28} color="white" />
              <Text style={styles.statNumber}>{totalCalories}</Text>
              <Text style={styles.statLabel}>Total Calories</Text>
            </LinearGradient>

            <LinearGradient colors={['#a855f7', '#ec4899']} style={styles.statCard}>
              <MaterialCommunityIcons name="clock-outline" size={28} color="white" />
              <Text style={styles.statNumber}>{totalDuration}</Text>
              <Text style={styles.statLabel}>Total Minutes</Text>
            </LinearGradient>
          </View>
        )}

        <Pressable onPress={() => router.push('/add-activity')}>
          <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={22} color="white" />
            <Text style={styles.addButtonText}>Add Activity</Text>
          </LinearGradient>
        </Pressable>

        {sortedActivities.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="calendar-outline" size={34} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptyText}>
              Start tracking by adding your first activity
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedActivities.map((activity) => (
              <View
                key={`${activity.korisnickoIme}-${activity.datumAktivnosti}-${activity.vrstaAktivnosti}`}
                style={styles.card}
              >
                <View style={styles.row}>
                  <View style={styles.entryContent}>
                    <Text style={styles.activityTitle}>
                      {activity.vrstaAktivnosti}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="clock-outline" size={17} color="#64748b" />
                        <Text style={styles.metaText}>{activity.trajanje} min</Text>
                      </View>

                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="fire" size={17} color="#f97316" />
                        <Text style={styles.metaText}>{activity.potrosnjaKalorija} kcal</Text>
                      </View>
                    </View>

                    <Text style={styles.dateText}>
                      {formatDate(activity.datumAktivnosti)}
                    </Text>
                  </View>

                  <Pressable style={styles.deleteButton} onPress={handleDelete}>
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
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
    fontSize: 26,
    fontWeight: '700',
    marginTop: 10,
  },
  statLabel: {
    color: '#fff7ed',
    fontSize: 13,
  },
  addButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  entryContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#64748b',
    fontSize: 14,
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 10,
  },
});