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
import { useFocusEffect } from '@react-navigation/native';

type Tezina = {
  korisnickoIme: string;
  datumUnosa: string;
  tezina: number;
  napomena?: string;
};

export const WeightHistoryScreen: React.FC = () => {
  const [weights, setWeights] = React.useState<Tezina[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadWeights();
    }, [])
  );

  const loadWeights = async () => {
    try {
      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

      if (!korisnickoIme) {
        return;
      }

      const response = await fetch(`${API_URL}/tezina/${korisnickoIme}`);
      const data = await response.json();

      if (response.ok) {
        setWeights(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sortedWeights = [...weights].sort(
    (a, b) =>
      new Date(b.datumUnosa).getTime() -
      new Date(a.datumUnosa).getTime()
  );

  const current = sortedWeights[0];
  const previous = sortedWeights[1];

  const diff =
    current && previous
      ? Number(current.tezina) - Number(previous.tezina)
      : 0;

  const totalEntries = sortedWeights.length;

  const handleDelete = () => {
    Alert.alert('Info', 'Delete endpoint još nije napravljen na backendu');
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <Text style={styles.headerTitle}>Weight History</Text>
        <Text style={styles.headerSubtitle}>Track your weight over time</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {current && (
          <LinearGradient
            colors={['#06b6d4', '#10b981']}
            style={styles.currentCard}
          >
            <View style={styles.currentIcon}>
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={30}
                color="white"
              />
            </View>

            <Text style={styles.currentLabel}>Current Weight</Text>

            <Text style={styles.currentDate}>
              Latest entry: {formatDate(current.datumUnosa)}
            </Text>

            <View style={styles.currentWeightRow}>
              <Text style={styles.currentWeight}>{current.tezina}</Text>
              <Text style={styles.currentUnit}>kg</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name={diff < 0 ? 'trending-down' : 'trending-up'}
                    size={22}
                    color="white"
                  />
                </View>

                <Text style={styles.infoValue}>
                  {diff === 0 ? '0.0 kg' : `${Math.abs(diff).toFixed(1)} kg`}
                </Text>

                <Text style={styles.infoLabel}>
                  {diff < 0 ? 'Lost' : diff > 0 ? 'Gained' : 'No change'}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <MaterialCommunityIcons
                    name="calendar-check-outline"
                    size={22}
                    color="white"
                  />
                </View>

                <Text style={styles.infoValue}>{totalEntries}</Text>
                <Text style={styles.infoLabel}>Entries</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        <Pressable onPress={() => router.push('/add-weight')}>
          <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={23} color="white" />
            <Text style={styles.addButtonText}>Add Weight Entry</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.sectionTitle}>Weight Entries</Text>

        {sortedWeights.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={34}
                color="#0891b2"
              />
            </View>

            <Text style={styles.emptyTitle}>No weight entries yet</Text>
            <Text style={styles.emptyText}>
              Start tracking by adding your first weight entry
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedWeights.map((entry, index) => {
              const prevEntry = sortedWeights[index + 1];
              const entryDiff = prevEntry
                ? Number(entry.tezina) - Number(prevEntry.tezina)
                : 0;

              return (
                <View
                  key={`${entry.korisnickoIme}-${entry.datumUnosa}`}
                  style={styles.card}
                >
                  <View style={styles.row}>
                    <View style={styles.entryIcon}>
                      <MaterialCommunityIcons
                        name="scale-bathroom"
                        size={24}
                        color="#0891b2"
                      />
                    </View>

                    <View style={styles.entryContent}>
                      <View style={styles.weightLine}>
                        <Text style={styles.weightText}>{entry.tezina} kg</Text>

                        {entryDiff !== 0 && (
                          <View
                            style={[
                              styles.diffBadge,
                              entryDiff < 0
                                ? styles.diffGreen
                                : styles.diffOrange,
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={
                                entryDiff < 0
                                  ? 'trending-down'
                                  : 'trending-up'
                              }
                              size={14}
                              color={entryDiff < 0 ? '#15803d' : '#c2410c'}
                            />

                            <Text
                              style={[
                                styles.diffText,
                                entryDiff < 0
                                  ? styles.diffTextGreen
                                  : styles.diffTextOrange,
                              ]}
                            >
                              {Math.abs(entryDiff).toFixed(1)} kg
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.dateText}>
                        {formatDate(entry.datumUnosa)}
                      </Text>

                      {entry.napomena ? (
                        <Text style={styles.noteText}>{entry.napomena}</Text>
                      ) : null}
                    </View>

                    <Pressable style={styles.deleteButton} onPress={handleDelete}>
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={22}
                        color="#ef4444"
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}
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
    gap: 13,
  },

  currentCard: {
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  currentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  currentLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
    textAlign: 'center',
  },

  currentDate: {
    color: '#ecfeff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  currentWeightRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 16,
  },

  currentWeight: {
    color: 'white',
    fontSize: 48,
    fontWeight: '800',
  },

  currentUnit: {
    color: '#ecfeff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 9,
    marginLeft: 6,
  },

  infoGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },

  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 98,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  infoValue: {
    color: 'white',
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 3,
    textAlign: 'center',
  },

  infoLabel: {
    color: '#ecfeff',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
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

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
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
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    color: '#1f2937',
    fontSize: 17,
    fontWeight: '700',
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
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  entryIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  entryContent: {
    flex: 1,
  },

  weightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 5,
  },

  weightText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  diffGreen: {
    backgroundColor: '#dcfce7',
  },

  diffOrange: {
    backgroundColor: '#ffedd5',
  },

  diffText: {
    fontSize: 12,
    fontWeight: '700',
  },

  diffTextGreen: {
    color: '#15803d',
  },

  diffTextOrange: {
    color: '#c2410c',
  },

  dateText: {
    color: '#64748b',
    fontSize: 14,
  },

  noteText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});