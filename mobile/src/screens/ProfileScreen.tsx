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
import {
  calculateBMI,
  getBMICategory,
  getDailyCalorieGoal,
} from '../utils/calculations';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    height: user?.height?.toString() || '',
    goalWeight: user?.goalWeight?.toString() || '',
    goal: user?.goal || 'maintenance',
  });

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Nema korisnika</Text>
      </View>
    );
  }

  const bmi = calculateBMI(user.currentWeight, user.height);
  const bmiCategory = getBMICategory(bmi);

  const dailyCalories = getDailyCalorieGoal(
    user.age,
    user.gender,
    user.currentWeight,
    user.height,
    user.goal
  );

  const handleSave = () => {
    updateUser({
      name: formData.name,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      goalWeight: parseFloat(formData.goalWeight),
      goal: formData.goal as 'loss' | 'gain' | 'maintenance',
    });

    setIsEditing(false);
    Alert.alert('Uspjeh', 'Profil je ažuriran');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name,
      age: user.age.toString(),
      height: user.height.toString(),
      goalWeight: user.goalWeight.toString(),
      goal: user.goal,
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Profile</Text>

          {!isEditing && (
            <Pressable style={styles.editButton} onPress={() => setIsEditing(true)}>
              <MaterialCommunityIcons name="pencil-outline" size={17} color="white" />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-outline" size={36} color="white" />
          </View>

          <View>
            <Text style={styles.nameText}>{user.name}</Text>
            <Text style={styles.emailText}>{user.email}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          {isEditing ? (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={formData.name}
                onChangeText={(value) => setFormData({ ...formData, name: value })}
                style={styles.input}
              />

              <Text style={styles.label}>Age</Text>
              <TextInput
                value={formData.age}
                onChangeText={(value) => setFormData({ ...formData, age: value })}
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                value={formData.height}
                onChangeText={(value) => setFormData({ ...formData, height: value })}
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.label}>Goal Weight (kg)</Text>
              <TextInput
                value={formData.goalWeight}
                onChangeText={(value) => setFormData({ ...formData, goalWeight: value })}
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.label}>Goal</Text>
              <View style={styles.goalColumn}>
                {[
                  { value: 'loss', label: 'Weight Loss' },
                  { value: 'gain', label: 'Weight Gain' },
                  { value: 'maintenance', label: 'Maintain Weight' },
                ].map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => setFormData({ ...formData, goal: item.value as 'loss' | 'gain' | 'maintenance' })}
                    style={[
                      styles.goalButton,
                      formData.goal === item.value && styles.goalButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.goalText,
                        formData.goal === item.value && styles.goalTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.buttonRow}>
                <Pressable style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>

                <Pressable style={styles.saveWrapper} onPress={handleSave}>
                  <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.saveButton}>
                    <MaterialCommunityIcons name="content-save-outline" size={19} color="white" />
                    <Text style={styles.saveText}>Save</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.infoGrid}>
              <InfoBox icon="account-outline" label="Age" value={`${user.age} years`} />
              <InfoBox icon="account-outline" label="Gender" value={user.gender} />
              <InfoBox icon="ruler" label="Height" value={`${user.height} cm`} />
              <InfoBox icon="scale-bathroom" label="Current" value={`${user.currentWeight} kg`} />
              <InfoBox icon="target" label="Goal Weight" value={`${user.goalWeight} kg`} />
              <InfoBox
                icon="target"
                label="Goal"
                value={
                  user.goal === 'loss'
                    ? 'Weight Loss'
                    : user.goal === 'gain'
                      ? 'Weight Gain'
                      : 'Maintain'
                }
              />
            </View>
          )}
        </View>

        {!isEditing && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Health Metrics</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricCyan}>
                <Text style={styles.metricLabel}>BMI</Text>
                <Text style={styles.metricCyanValue}>{bmi}</Text>
                <Text style={styles.metricSmall}>{bmiCategory}</Text>
              </View>

              <View style={styles.metricGreen}>
                <Text style={styles.metricLabel}>Daily Calorie Goal</Text>
                <Text style={styles.metricGreenValue}>{dailyCalories}</Text>
                <Text style={styles.metricSmall}>kcal/day</Text>
              </View>
            </View>
          </View>
        )}

        {!isEditing && (
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => router.push('/dashboard')}>
          <MaterialCommunityIcons name="home" size={26} color="#64748b" />
        </Pressable>
        <Pressable onPress={() => router.push('/activity')}>
          <MaterialCommunityIcons name="run" size={26} color="#64748b" />
        </Pressable>
        <Pressable onPress={() => router.push('/weight')}>
          <MaterialCommunityIcons name="scale-bathroom" size={26} color="#64748b" />
        </Pressable>
        <Pressable onPress={() => router.push('/profile')}>
          <MaterialCommunityIcons name="account" size={26} color="#06b6d4" />
        </Pressable>
      </View>
    </View>
  );
};

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoBox}>
      <MaterialCommunityIcons name={icon} size={22} color="#64748b" />
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  editText: {
    color: 'white',
    fontWeight: '700',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  emailText: {
    color: '#cffafe',
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 95,
    gap: 14,
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
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
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
    marginBottom: 14,
  },
  goalColumn: {
    gap: 10,
    marginBottom: 16,
  },
  goalButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  goalButtonActive: {
    borderColor: '#06b6d4',
    backgroundColor: '#ecfeff',
  },
  goalText: {
    color: '#374151',
    fontWeight: '600',
  },
  goalTextActive: {
    color: '#0891b2',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: 'white',
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoBox: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  infoValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCyan: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
    borderRadius: 12,
  },
  metricGreen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 5,
  },
  metricCyanValue: {
    color: '#0891b2',
    fontSize: 26,
    fontWeight: '700',
  },
  metricGreenValue: {
    color: '#059669',
    fontSize: 26,
    fontWeight: '700',
  },
  metricSmall: {
    color: '#64748b',
    fontSize: 12,
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: 'white',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 16,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});