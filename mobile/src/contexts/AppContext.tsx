import React, { createContext, useContext, useState } from 'react';

type Goal = 'loss' | 'gain' | 'maintenance';
type Gender = 'male' | 'female' | 'other';

type User = {
  name: string;
  email: string;
  age: number;
  gender: Gender;
  height: number;
  currentWeight: number;
  goalWeight: number;
  goal: Goal;
};

type WeightEntry = {
  id: string;
  weight: number;
  date: string;
  note?: string;
};

type ActivityEntry = {
  id: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  date: string;
};

type AppContextType = {
  user: User | null;
  weights: WeightEntry[];
  activities: ActivityEntry[];

  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  completeOnboarding: (data: Partial<User>) => void;
  updateUser: (data: Partial<User>) => void;

  addWeightEntry: (weight: number, note?: string) => void;
  removeWeightEntry: (id: string) => void;

  addActivity: (type: string, duration: number, caloriesBurned: number) => void;
  removeActivity: (id: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    name: 'Test User',
    email: 'test@test.com',
    age: 25,
    gender: 'male',
    height: 180,
    currentWeight: 80,
    goalWeight: 75,
    goal: 'loss',
  });

  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  const login = async () => {
    return true;
  };

  const register = async (name: string, email: string) => {
    setUser({
      name,
      email,
      age: 25,
      gender: 'male',
      height: 180,
      currentWeight: 80,
      goalWeight: 75,
      goal: 'loss',
    });

    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const completeOnboarding = (data: Partial<User>) => {
    setUser((prev) => ({
      ...(prev as User),
      ...data,
    }));
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => ({
      ...(prev as User),
      ...data,
    }));
  };

  const addWeightEntry = (weight: number, note?: string) => {
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      weight,
      note,
      date: new Date().toISOString(),
    };

    setWeights((prev) => [newEntry, ...prev]);

    setUser((prev) =>
      prev
        ? {
            ...prev,
            currentWeight: weight,
          }
        : prev
    );
  };

  const removeWeightEntry = (id: string) => {
    setWeights((prev) => prev.filter((w) => w.id !== id));
  };

  const addActivity = (type: string, duration: number, caloriesBurned: number) => {
    const newActivity: ActivityEntry = {
      id: Date.now().toString(),
      type,
      duration,
      caloriesBurned,
      date: new Date().toISOString(),
    };

    setActivities((prev) => [newActivity, ...prev]);
  };

  const removeActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        weights,
        activities,
        login,
        register,
        logout,
        completeOnboarding,
        updateUser,
        addWeightEntry,
        removeWeightEntry,
        addActivity,
        removeActivity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }

  return context;
}