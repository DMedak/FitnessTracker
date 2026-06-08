import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  calculateBMI,
  getBMICategory,
  getDailyCalorieGoal,
} from '../utils/calculations';
import { BottomNav } from '../components/BottomNav';
import { API_URL } from '../config/api';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

type UserData = {
  korisnickoIme: string;
  ime: string;
  prezime: string;
  mail: string;
};

type ProfilData = {
  korisnickoIme: string;
  dob: number;
  spol: 'male' | 'female' | 'other';
  visina: number;
  trenutnaTezina: number;
  cilj: 'loss' | 'gain' | 'maintenance';
};

type TezinaData = {
  datumUnosa?: string;
  datum_unosa?: string;
  tezina: number | string;
};

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editDob, setEditDob] = useState('');
  const [editSpol, setEditSpol] = useState<'male' | 'female' | 'other'>('male');
  const [editVisina, setEditVisina] = useState('');
  const [editTezina, setEditTezina] = useState('');
  const [editCilj, setEditCilj] = useState<'loss' | 'gain' | 'maintenance'>(
    'maintenance'
  );

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const korisnickoIme = await AsyncStorage.getItem('korisnickoIme');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (!korisnickoIme) {
        return;
      }

      const [profileResponse, weightResponse] = await Promise.all([
        fetch(`${API_URL}/profil/${korisnickoIme}`),
        fetch(`${API_URL}/tezina/${korisnickoIme}`),
      ]);

      const profileData = await profileResponse.json();
      const weightData = await weightResponse.json();

      if (profileResponse.ok) {
        setProfil(profileData);

        setEditDob(String(profileData.dob || ''));
        setEditSpol(profileData.spol || 'male');
        setEditVisina(String(profileData.visina || ''));
        setEditTezina(String(profileData.trenutnaTezina || ''));
        setEditCilj(profileData.cilj || 'maintenance');
      }

      if (weightResponse.ok && Array.isArray(weightData) && weightData.length > 0) {
        const sortedWeights = [...weightData].sort(
          (a: TezinaData, b: TezinaData) => {
            const dateA = new Date(a.datumUnosa || a.datum_unosa || '').getTime();
            const dateB = new Date(b.datumUnosa || b.datum_unosa || '').getTime();

            return dateB - dateA;
          }
        );

        const latestWeight = Number(sortedWeights[0].tezina);

        if (!Number.isNaN(latestWeight)) {
          setCurrentWeight(latestWeight);
        }
      } else {
        setCurrentWeight(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!profil) {
        return;
      }

      const parsedDob = Number(editDob);
      const parsedVisina = Number(editVisina);
      const parsedTezina = Number(editTezina.replace(',', '.'));

      if (
        Number.isNaN(parsedDob) ||
        Number.isNaN(parsedVisina) ||
        Number.isNaN(parsedTezina) ||
        parsedDob <= 0 ||
        parsedVisina <= 0 ||
        parsedTezina <= 0
      ) {
        Alert.alert('Error', 'Please enter valid profile values.');
        return;
      }

      const response = await fetch(`${API_URL}/profil/${profil.korisnickoIme}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dob: parsedDob,
          spol: editSpol,
          visina: parsedVisina,
          trenutnaTezina: parsedTezina,
          cilj: editCilj,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        Alert.alert('Error', result.message || 'Failed to update profile.');
        return;
      }

      const updatedProfil: ProfilData = {
        ...profil,
        dob: parsedDob,
        spol: editSpol,
        visina: parsedVisina,
        trenutnaTezina: parsedTezina,
        cilj: editCilj,
      };

      setProfil(updatedProfil);

      if (!currentWeight) {
        setCurrentWeight(parsedTezina);
      }

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const handleCancelEdit = () => {
    if (profil) {
      setEditDob(String(profil.dob || ''));
      setEditSpol(profil.spol || 'male');
      setEditVisina(String(profil.visina || ''));
      setEditTezina(String(profil.trenutnaTezina || ''));
      setEditCilj(profil.cilj || 'maintenance');
    }

    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('isLoggedIn');
          await AsyncStorage.removeItem('korisnickoIme');
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('profil');
          router.replace('/');
        },
      },
    ]);
  };

  const openHelpPdf = async () => {
    try {
      const asset = Asset.fromModule(require('../../assets/images/Help.pdf'));
      await asset.downloadAsync();

      const fromUri = asset.localUri || asset.uri;
      const fileUri = `${FileSystem.cacheDirectory}Help.pdf`;

      await FileSystem.copyAsync({
        from: fromUri,
        to: fileUri,
      });

      const contentUri = await FileSystem.getContentUriAsync(fileUri);

      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: 'application/pdf',
        flags: 1,
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Help document could not be opened.');
    }
  };

  const displayedWeight = currentWeight ?? profil?.trenutnaTezina ?? null;

  const bmi =
    profil && displayedWeight
      ? calculateBMI(displayedWeight, profil.visina)
      : '--';

  const bmiCategory =
    profil && displayedWeight
      ? getBMICategory(Number(bmi))
      : '--';

  const dailyCalories =
    profil && displayedWeight
      ? getDailyCalorieGoal(
          profil.dob,
          profil.spol,
          displayedWeight,
          profil.visina,
          profil.cilj
        )
      : '--';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06b6d4', '#10b981']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          <Pressable
            onPress={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
            style={styles.editHeaderButton}
          >
            <MaterialCommunityIcons
              name={isEditing ? 'close' : 'pencil'}
              size={23}
              color="white"
            />
          </Pressable>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-outline" size={35} color="white" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.nameText}>
              {user ? `${user.ime} ${user.prezime}` : 'User'}
            </Text>
            <Text style={styles.emailText}>
              {user?.mail || user?.korisnickoIme || ''}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>
              {isEditing ? 'Edit Personal Information' : 'Personal Information'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isEditing
                ? 'Update your profile values'
                : 'Your current fitness profile'}
            </Text>
          </View>

          {profil ? (
            <>
              <View style={styles.infoGrid}>
                {isEditing ? (
                  <EditBox
                    label="Age"
                    value={editDob}
                    onChangeText={setEditDob}
                    keyboardType="numeric"
                  />
                ) : (
                  <InfoBox label="Age" value={`${profil.dob} years`} />
                )}

                {isEditing ? (
                  <OptionBox
                    label="Gender"
                    value={editSpol}
                    options={[
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Other', value: 'other' },
                    ]}
                    onChange={(value) =>
                      setEditSpol(value as 'male' | 'female' | 'other')
                    }
                  />
                ) : (
                  <InfoBox label="Gender" value={profil.spol} />
                )}

                {isEditing ? (
                  <EditBox
                    label="Height"
                    value={editVisina}
                    onChangeText={setEditVisina}
                    keyboardType="numeric"
                  />
                ) : (
                  <InfoBox label="Height" value={`${profil.visina} cm`} />
                )}

                {isEditing ? (
                  <EditBox
                    label="Weight"
                    value={editTezina}
                    onChangeText={setEditTezina}
                    keyboardType="decimal-pad"
                  />
                ) : (
                  <InfoBox
                    label="Current Weight"
                    value={displayedWeight ? `${displayedWeight} kg` : '-- kg'}
                  />
                )}

                {isEditing ? (
                  <OptionBox
                    label="Goal"
                    value={editCilj}
                    options={[
                      { label: 'Loss', value: 'loss' },
                      { label: 'Gain', value: 'gain' },
                      { label: 'Maintain', value: 'maintenance' },
                    ]}
                    onChange={(value) =>
                      setEditCilj(value as 'loss' | 'gain' | 'maintenance')
                    }
                  />
                ) : (
                  <InfoBox
                    label="Goal"
                    value={
                      profil.cilj === 'loss'
                        ? 'Weight Loss'
                        : profil.cilj === 'gain'
                          ? 'Weight Gain'
                          : 'Maintain'
                    }
                  />
                )}
              </View>

              {isEditing && (
                <View style={styles.editButtonRow}>
                  <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable style={styles.saveButtonWrapper} onPress={handleSaveProfile}>
                    <LinearGradient
                      colors={['#06b6d4', '#10b981']}
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>
              Profile data not found. Complete onboarding first.
            </Text>
          )}
        </View>

        {profil && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Health Metrics</Text>
              <Text style={styles.cardSubtitle}>BMI and daily calorie estimate</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>BMI</Text>
                <Text style={styles.metricValue}>{bmi}</Text>
                <Text style={styles.metricSmall}>{bmiCategory}</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Daily Goal</Text>
                <Text style={styles.metricValue}>{dailyCalories}</Text>
                <Text style={styles.metricSmall}>kcal/day</Text>
              </View>
            </View>
          </View>
        )}

        <Pressable style={styles.helpButton} onPress={openHelpPdf}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={20}
            color="#0891b2"
          />
          <Text style={styles.helpText}>Open Help Guide</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <BottomNav />
    </View>
  );
};

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EditBox({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={styles.editBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

function OptionBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.optionBox}>
      <Text style={styles.infoLabel}>{label}</Text>

      <View style={styles.optionList}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonActive,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
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
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  editHeaderButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: 'white',
  },

  headerSubtitle: {
    color: '#cffafe',
    marginTop: 3,
    fontSize: 15,
    fontWeight: '500',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nameText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },

  emailText: {
    color: '#cffafe',
    marginTop: 2,
    fontSize: 14,
    fontWeight: '500',
  },

  content: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
  },

  cardHeaderRow: {
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },

  cardSubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 3,
    fontWeight: '600',
  },

  infoGrid: {
    gap: 9,
  },

  infoBox: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 13,
    backgroundColor: '#f8fafc',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  editBox: {
    width: '100%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  optionBox: {
    width: '100%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  optionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },

  optionButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: 'white',
  },

  optionButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },

  optionText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },

  optionTextActive: {
    color: '#059669',
  },

  infoLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  infoValue: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  input: {
    marginTop: 5,
    height: 42,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 11,
    color: '#111827',
    backgroundColor: 'white',
    fontSize: 15,
    fontWeight: '600',
  },

  editButtonRow: {
    flexDirection: 'row',
    gap: 11,
    marginTop: 14,
  },

  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '800',
  },

  saveButtonWrapper: {
    flex: 1,
  },

  saveButton: {
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },

  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  metricBox: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
  },

  metricLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  metricValue: {
    color: '#111827',
    fontSize: 25,
    fontWeight: '800',
  },

  metricSmall: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  logoutButton: {
    height: 50,
    borderRadius: 13,
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
    fontWeight: '800',
    fontSize: 16,
  },

  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },

  helpButton: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#a5f3fc',
    backgroundColor: 'white',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  helpText: {
    color: '#0891b2',
    fontWeight: '800',
    fontSize: 16,
  },
});