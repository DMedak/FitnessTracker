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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { formatDate, formatTime } from '../utils/calculations';

export const ActivityHistoryScreen: React.FC = () => {
  const { activities, removeActivity } = useApp();

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalCalories = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);

  const handleDelete = (id: string) => {
    Alert.alert('Delete activity', 'Are you sure you want to delete this activity?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeActivity(id),
      },
    ]);
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
              <View key={activity.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.entryContent}>
                    <Text style={styles.activityTitle}>{activity.type}</Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="clock-outline" size={17} color="#64748b" />
                        <Text style={styles.metaText}>{activity.duration} min</Text>
                      </View>

                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="fire" size={17} color="#f97316" />
                        <Text style={styles.metaText}>{activity.caloriesBurned} kcal</Text>
                      </View>
                    </View>

                    <Text style={styles.dateText}>
                      {formatDate(activity.date)} • {formatTime(activity.date)}
                    </Text>
                  </View>

                  <Pressable style={styles.deleteButton} onPress={() => handleDelete(activity.id)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => router.push('/dashboard')}>
          <MaterialCommunityIcons name="home" size={26} color="#64748b" />
        </Pressable>
        <Pressable onPress={() => router.push('/activity')}>
          <MaterialCommunityIcons name="run" size={26} color="#06b6d4" />
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