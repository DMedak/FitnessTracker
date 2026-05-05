import React, { useState } from 'react';
import {
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

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    goalWeight: '',
    goal: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    completeOnboarding({
      age: parseInt(formData.age),
      gender: formData.gender as 'male' | 'female' | 'other',
      height: parseFloat(formData.height),
      currentWeight: parseFloat(formData.weight),
      goalWeight: parseFloat(formData.goalWeight),
      goal: formData.goal as 'loss' | 'gain' | 'maintenance',
    });

    router.replace('/dashboard');
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.age !== '' && formData.gender !== '';
      case 2:
        return formData.height !== '';
      case 3:
        return formData.weight !== '';
      case 4:
        return formData.goalWeight !== '' && formData.goal !== '';
      default:
        return false;
    }
  };

  return (
    <LinearGradient colors={['#ecfeff', '#eff6ff', '#ecfdf5']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Profile Setup</Text>
            <Text style={styles.stepText}>Step {step} of {totalSteps}</Text>
          </View>

          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#06b6d4', '#10b981']}
              style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]}
            />
          </View>

          <Text style={styles.description}>
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'What is your height?'}
            {step === 3 && 'What is your current weight?'}
            {step === 4 && 'Set your fitness goal'}
          </Text>

          {step === 1 && (
            <View style={styles.section}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#94a3b8" style={styles.icon} />
                <TextInput
                  value={formData.age}
                  onChangeText={(value) => setFormData({ ...formData, age: value })}
                  placeholder="25"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>Gender</Text>
              <View style={styles.optionRow}>
                {['male', 'female', 'other'].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setFormData({ ...formData, gender: item })}
                    style={[
                      styles.optionButton,
                      formData.gender === item && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.gender === item && styles.optionTextActive,
                      ]}
                    >
                      {item === 'male' ? 'Male' : item === 'female' ? 'Female' : 'Other'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.section}>
              <Text style={styles.label}>Height (cm)</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="ruler" size={22} color="#94a3b8" style={styles.icon} />
                <TextInput
                  value={formData.height}
                  onChangeText={(value) => setFormData({ ...formData, height: value })}
                  placeholder="170"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.section}>
              <Text style={styles.label}>Current Weight (kg)</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="scale-bathroom" size={22} color="#94a3b8" style={styles.icon} />
                <TextInput
                  value={formData.weight}
                  onChangeText={(value) => setFormData({ ...formData, weight: value })}
                  placeholder="70"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.section}>
              <Text style={styles.label}>Goal Weight (kg)</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="target" size={22} color="#94a3b8" style={styles.icon} />
                <TextInput
                  value={formData.goalWeight}
                  onChangeText={(value) => setFormData({ ...formData, goalWeight: value })}
                  placeholder="65"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>Your Goal</Text>
              <View style={styles.goalColumn}>
                {[
                  { value: 'loss', label: 'Weight Loss' },
                  { value: 'gain', label: 'Weight Gain' },
                  { value: 'maintenance', label: 'Maintain Weight' },
                ].map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => setFormData({ ...formData, goal: item.value })}
                    style={[
                      styles.goalButton,
                      formData.goal === item.value && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        formData.goal === item.value && styles.optionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.footer}>
            {step > 1 && (
              <Pressable style={styles.backButton} onPress={handleBack}>
                <MaterialCommunityIcons name="arrow-left" size={18} color="#374151" />
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleNext}
              disabled={!isStepValid()}
              style={[styles.nextWrapper, !isStepValid() && styles.disabled]}
            >
              <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.nextButton}>
                <Text style={styles.nextText}>
                  {step === totalSteps ? 'Complete' : 'Next'}
                </Text>
                {step < totalSteps && (
                  <MaterialCommunityIcons name="arrow-right" size={18} color="white" />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  stepText: {
    fontSize: 13,
    color: '#64748b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  description: {
    marginTop: 18,
    marginBottom: 24,
    color: '#64748b',
    fontSize: 15,
  },
  section: {
    gap: 12,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrapper: {
    justifyContent: 'center',
    marginBottom: 10,
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
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  optionButtonActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#ecfeff',
  },
  optionText: {
    color: '#374151',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#0891b2',
  },
  goalColumn: {
    gap: 10,
  },
  goalButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  backButton: {
    height: 50,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    color: '#374151',
    fontWeight: '700',
  },
  nextWrapper: {
    flex: 1,
  },
  nextButton: {
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.45,
  },
});