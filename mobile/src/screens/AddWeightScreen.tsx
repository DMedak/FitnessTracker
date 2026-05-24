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

          <View>
            <Text style={styles.headerTitle}>Add Weight</Text>
            <Text style={styles.headerSubtitle}>Track your weight progress</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="scale-bathroom" size={22} color="#06b6d4" />
            <Text style={styles.cardTitle}>New Weight Entry</Text>
          </View>

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="70.5"
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any notes about this entry..."
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
                <MaterialCommunityIcons name="content-save-outline" size={20} color="white" />
                <Text style={styles.saveText}>Save Entry</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        <View style={styles.tipBox}>
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 18,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 5,
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
  tipBox: {
    marginTop: 18,
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  tipText: {
    color: '#1e40af',
    fontSize: 14,
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '700',
  },
});