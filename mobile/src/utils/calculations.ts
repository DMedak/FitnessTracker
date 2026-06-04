export type ActivityIntensity = 'light' | 'moderate' | 'intense';

export function calculateBMI(weight: number, height: number) {
  if (!weight || !height || weight <= 0 || height <= 0) return 0;

  const heightMeters = height / 100;
  return Number((weight / (heightMeters * heightMeters)).toFixed(1));
}

export function getBMICategory(bmi: number) {
  if (!bmi || bmi <= 0) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function getBMIColor(bmi: number) {
  if (!bmi || bmi <= 0) return '#94a3b8';
  if (bmi < 18.5) return '#f59e0b';
  if (bmi < 25) return '#10b981';
  if (bmi < 30) return '#f97316';
  return '#ef4444';
}

export function getWeightProgress(
  currentWeight: number,
  goalWeight: number,
  startWeight: number
) {
  if (
    !currentWeight ||
    !goalWeight ||
    !startWeight ||
    currentWeight <= 0 ||
    goalWeight <= 0 ||
    startWeight <= 0
  ) {
    return 0;
  }

  const total = Math.abs(startWeight - goalWeight);
  const done = Math.abs(startWeight - currentWeight);

  if (total === 0) return 100;

  const progress = Math.round((done / total) * 100);
  return Math.min(Math.max(progress, 0), 100);
}

export function getWeightDifference(current: number, previous: number) {
  if (!current || !previous || current <= 0 || previous <= 0) {
    return {
      diff: 0,
      percentage: 0,
    };
  }

  const diff = Number((current - previous).toFixed(1));
  const percentage = Number(((diff / previous) * 100).toFixed(1));

  return {
    diff,
    percentage,
  };
}

export function calculateCaloriesBurned(
  activityType: string,
  duration: number,
  weight: number,
  intensity: ActivityIntensity = 'moderate'
) {
  if (!activityType || !duration || !weight || duration <= 0 || weight <= 0) {
    return 0;
  }

  const metValues: Record<string, number> = {
    Walking: 3.5,
    Running: 8,
    Cycling: 6,
    Swimming: 7,
    Yoga: 3,
    Weightlifting: 5,
    Dancing: 5,
    Hiking: 6,
    Basketball: 6.5,
    Soccer: 7,
    Tennis: 7,
    Aerobics: 6,
    Rowing: 7,
    'Jump Rope': 10,
    Pilates: 3.5,
    Boxing: 9,
  };

  const intensityMultipliers: Record<ActivityIntensity, number> = {
    light: 0.85,
    moderate: 1,
    intense: 1.25,
  };

  const baseMet = metValues[activityType] || 5;
  const finalMet = baseMet * intensityMultipliers[intensity];

  return Math.round((finalMet * weight * duration) / 60);
}

export function calculateBMR(
  age: number,
  gender: 'male' | 'female' | 'other',
  weight: number,
  height: number
) {
  if (!age || !weight || !height || age <= 0 || weight <= 0 || height <= 0) {
    return 0;
  }

  let bmr = 10 * weight + 6.25 * height - 5 * age;

  if (gender === 'male') bmr += 5;
  else if (gender === 'female') bmr -= 161;

  return Math.round(bmr);
}

export function calculateTDEE(bmr: number, multiplier = 1.4) {
  if (!bmr || bmr <= 0) return 0;

  return Math.round(bmr * multiplier);
}

export function getDailyCalorieGoal(
  age: number,
  gender: 'male' | 'female' | 'other',
  weight: number,
  height: number,
  goal: 'loss' | 'gain' | 'maintenance'
) {
  const bmr = calculateBMR(age, gender, weight, height);
  let calories = calculateTDEE(bmr, 1.4);

  if (goal === 'loss') calories -= 400;
  if (goal === 'gain') calories += 400;

  return Math.max(Math.round(calories), 0);
}

export function formatDate(date: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

export function formatTime(date: string) {
  if (!date) return '';

  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}