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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

export const AddWeightScreen: React.FC = () => {
  const { addWeightEntry } = useApp();

  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!weight || parseFloat(weight) <= 0) {
      Alert.alert('Greška', 'Unesi ispravnu težinu');
      return;
    }

    addWeightEntry(parseFloat(weight), note || undefined);
    Alert.alert('Uspjeh', 'Težina je spremljena');
    router.replace('/weight');
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
            keyboardType="numeric"
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
            <Text style={styles.tipBold}>Tip:</Text> Weigh yourself at the same time each day
            (preferably in the morning) for consistent tracking.
          </Text>
        </View>
      </ScrollView>
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
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 12,
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