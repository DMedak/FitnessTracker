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

  const handleDelete = () => {
    Alert.alert('Info', 'Delete endpoint još nije napravljen na backendu');
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <Text style={styles.headerTitle}>Weight History</Text>
        <Text style={styles.headerSubtitle}>Track your weight over time</Text>
      </LinearGradient>

      {sortedWeights.length > 0 && (() => {
        const current = sortedWeights[0];
        const previous = sortedWeights[1];

        const diff = previous
          ? Number(current.tezina) - Number(previous.tezina)
          : 0;

        return (
          <View style={styles.currentCard}>
            <Text style={styles.currentLabel}>Current Weight</Text>

            <View style={styles.currentWeightRow}>
              <Text style={styles.currentWeight}>
                {current.tezina} kg
              </Text>

              {diff !== 0 && (
                <View
                  style={[
                    styles.diffBadge,
                    diff < 0 ? styles.diffGreen : styles.diffOrange,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={diff < 0 ? 'trending-down' : 'trending-up'}
                    size={14}
                    color={diff < 0 ? '#15803d' : '#c2410c'}
                  />

                  <Text
                    style={[
                      styles.diffText,
                      diff < 0
                        ? styles.diffTextGreen
                        : styles.diffTextOrange,
                    ]}
                  >
                    {Math.abs(diff).toFixed(1)} kg
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })()}

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.push('/add-weight')}>
          <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={22} color="white" />
            <Text style={styles.addButtonText}>Add Weight Entry</Text>
          </LinearGradient>
        </Pressable>

        {sortedWeights.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="calendar-outline" size={34} color="#94a3b8" />
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
              const diff = prevEntry
                ? Number(entry.tezina) - Number(prevEntry.tezina)
                : 0;

              return (
                <View
                  key={`${entry.korisnickoIme}-${entry.datumUnosa}`}
                  style={styles.card}
                >
                  <View style={styles.row}>
                    <View style={styles.entryContent}>
                      <View style={styles.weightLine}>
                        <Text style={styles.weightText}>
                          {entry.tezina} kg
                        </Text>
                      </View>

                      <Text style={styles.dateText}>
                        {formatDate(entry.datumUnosa)}
                      </Text>

                      {entry.napomena ? (
                        <Text style={styles.noteText}>{entry.napomena}</Text>
                      ) : null}
                    </View>

                    <Pressable style={styles.deleteButton} onPress={handleDelete}>
                      <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
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
    gap: 14,
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
  weightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 5,
  },
  weightText: {
    fontSize: 25,
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
    alignSelf: 'center',
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
    padding: 8,
    borderRadius: 10,
  },
  currentCard: {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  alignItems: 'center',
  elevation: 3,
  },
  currentLabel: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 6,
  },
  currentWeight: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '700',
  },
  currentWeightRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},
});