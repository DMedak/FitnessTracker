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
import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';

export const AddWeightScreen: React.FC = () => {
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
    try {
      const normalizedWeight = weight.replace(',', '.');
      const parsedWeight = parseFloat(normalizedWeight);

      if (!weight.trim() || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
        Alert.alert('Error', 'Please enter a valid weight.');
        return;
      }

      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');

      if (!korisnickoIme) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const body = {
        korisnickoIme,
        datumUnosa: new Date().toISOString().split('T')[0],
        tezina: parsedWeight,
        napomena: note,
      };

      const response = await fetch(`${API_URL}/tezina`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Daily entry already exists',
          result.message || 'You can enter your weight only once per day.'
        );
        return;
      }

      Alert.alert('Success', 'Weight saved');
      router.replace('/weight');
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

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Add Weight</Text>
            <Text style={styles.headerSubtitle}>Track your weight progress</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={26}
                color="#0891b2"
              />
            </View>

            <View>
              <Text style={styles.cardTitle}>New Weight Entry</Text>
              <Text style={styles.cardSubtitle}>
                Add today's weight measurement
              </Text>
            </View>
          </View>

          <Text style={styles.label}>Weight (kg)</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="70.5"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>Note (Optional)</Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any notes about this entry..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
          />

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.saveWrapper} onPress={handleSubmit}>
              <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.saveButton}>
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={20}
                  color="white"
                />
                <Text style={styles.saveText}>Save Entry</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        <View style={styles.tipBox}>
          <View style={styles.tipIcon}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={22}
              color="#0891b2"
            />
          </View>

          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Tip:</Text> Weight can be entered once per day.
            For consistent tracking, weigh yourself at the same time each day.
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 31,
    fontWeight: '800',
    color: 'white',
  },

  headerSubtitle: {
    color: '#cffafe',
    marginTop: 4,
    fontSize: 16,
    fontWeight: '500',
  },

  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },

  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1f2937',
  },

  cardSubtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 3,
    fontWeight: '500',
  },

  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 18,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f8fafc',
    marginBottom: 18,
  },

  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 13,
    marginBottom: 28,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    color: '#374151',
    fontWeight: '800',
    fontSize: 15,
  },

  saveWrapper: {
    flex: 1,
  },

  saveButton: {
    height: 54,
    borderRadius: 15,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#10b981',
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
  },

  saveText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
  },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: '#f0fdfa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipText: {
    flex: 1,
    color: '#115e59',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },

  tipBold: {
    fontWeight: '800',
  },
});