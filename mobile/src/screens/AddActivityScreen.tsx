import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { calculateCaloriesBurned } from '../utils/calculations';
import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';

const activityTypes = [
  'Walking',
  'Running',
  'Cycling',
  'Swimming',
  'Yoga',
  'Weightlifting',
  'Dancing',
  'Hiking',
  'Basketball',
  'Soccer',
  'Tennis',
  'Aerobics',
  'Rowing',
  'Jump Rope',
  'Pilates',
  'Boxing',
];

type Tezina = {
  datumUnosa?: string;
  datum_unosa?: string;
  tezina: number | string;
};

export const AddActivityScreen: React.FC = () => {
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [estimatedCalories, setEstimatedCalories] = useState(0);

  const getCurrentWeight = async () => {
    const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

    if (!korisnickoIme) {
      return 70;
    }

    const weightResponse = await fetch(`${API_URL}/tezina/${korisnickoIme}`);
    const weightData = await weightResponse.json();

    if (weightResponse.ok && Array.isArray(weightData) && weightData.length > 0) {
      const sortedWeights = [...weightData].sort((a: Tezina, b: Tezina) => {
        const dateA = new Date(a.datumUnosa || a.datum_unosa || '').getTime();
        const dateB = new Date(b.datumUnosa || b.datum_unosa || '').getTime();

        return dateB - dateA;
      });

      const latestWeight = Number(sortedWeights[0].tezina);

      if (!Number.isNaN(latestWeight)) {
        return latestWeight;
      }
    }

    const profileResponse = await fetch(`${API_URL}/profil/${korisnickoIme}`);
    const profileData = await profileResponse.json();

    if (profileResponse.ok && profileData?.trenutnaTezina) {
      return Number(profileData.trenutnaTezina);
    }

    return 70;
  };

  const calculateCalories = async (type: string, minutes: string) => {
    const parsedMinutes = parseFloat(minutes);

    if (!type || !minutes || Number.isNaN(parsedMinutes) || parsedMinutes <= 0) {
      setEstimatedCalories(0);
      return;
    }

    const currentWeight = await getCurrentWeight();

    const calories = calculateCaloriesBurned(
      type,
      parsedMinutes,
      currentWeight
    );

    setEstimatedCalories(calories);
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    calculateCalories(activityType, value);
  };

  const handleActivityTypeChange = (value: string) => {
    setActivityType(value);
    calculateCalories(value, duration);
  };

  const handleSubmit = async () => {
    try {
      const parsedDuration = parseFloat(duration);

      if (!activityType || !duration || Number.isNaN(parsedDuration) || parsedDuration <= 0) {
        Alert.alert('Error', 'Fill in all required fields');
        return;
      }

      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

      if (!korisnickoIme) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const body = {
        korisnickoIme,
        datumAktivnosti: new Date().toLocaleDateString('en-CA'),
        vrstaAktivnosti: activityType,
        trajanje: Math.round(parsedDuration),
        potrosnjaKalorija: estimatedCalories,
        napomena: '',
      };

      const response = await fetch(`${API_URL}/aktivnost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        Alert.alert('Error', result.message || 'Saving failed');
        return;
      }

      Alert.alert('Success', 'Activity saved');
      router.replace('/activity');
    } catch (error) {
      Alert.alert('Error', 'Saving failed');
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="white" />
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>Add Activity</Text>
            <Text style={styles.headerSubtitle}>Log your workout</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="run-fast" size={22} color="#06b6d4" />
            <Text style={styles.cardTitle}>New Activity</Text>
          </View>

          <Text style={styles.label}>Activity Type</Text>
          <View style={styles.activityGrid}>
            {activityTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => handleActivityTypeChange(type)}
                style={[
                  styles.activityButton,
                  activityType === type && styles.activityButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.activityText,
                    activityType === type && styles.activityTextActive,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Duration (minutes)</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="clock-outline" size={22} color="#94a3b8" style={styles.icon} />
            <TextInput
              value={duration}
              onChangeText={handleDurationChange}
              placeholder="30"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {estimatedCalories > 0 && (
            <View style={styles.calorieBox}>
              <Text style={styles.calorieLabel}>Estimated Calories Burned</Text>
              <Text style={styles.calorieValue}>{estimatedCalories} kcal</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.saveWrapper} onPress={handleSubmit}>
              <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.saveButton}>
                <MaterialCommunityIcons name="content-save-outline" size={20} color="white" />
                <Text style={styles.saveText}>Save Activity</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>Note:</Text> Calorie estimates are based on average
            values and may vary based on intensity and individual factors.
          </Text>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    color: '#cffafe',
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  activityButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  activityButtonActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#ecfeff',
  },
  activityText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  activityTextActive: {
    color: '#0891b2',
  },
  inputWrapper: {
    justifyContent: 'center',
    marginBottom: 18,
  },
  icon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingLeft: 46,
    paddingRight: 14,
    fontSize: 16,
    backgroundColor: 'white',
  },
  calorieBox: {
    padding: 16,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
    borderRadius: 12,
    marginBottom: 18,
  },
  calorieLabel: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 4,
  },
  calorieValue: {
    color: '#0891b2',
    fontSize: 30,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '700',
  },
  saveWrapper: {
    flex: 1,
  },
  saveButton: {
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: '700',
  },
  noteBox: {
    marginTop: 18,
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  noteText: {
    color: '#1e40af',
    fontSize: 14,
    lineHeight: 20,
  },
  noteBold: {
    fontWeight: '700',
  },
});