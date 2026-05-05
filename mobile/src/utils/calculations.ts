export function calculateBMI(weight: number, height: number) {
  const heightMeters = height / 100;
  return Number((weight / (heightMeters * heightMeters)).toFixed(1));
}

export function getBMICategory(bmi: number) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function getBMIColor(bmi: number) {
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
  const total = Math.abs(startWeight - goalWeight);
  const done = Math.abs(startWeight - currentWeight);

  if (total === 0) return 100;

  const progress = Math.round((done / total) * 100);
  return Math.min(progress, 100);
}

export function getWeightDifference(current: number, previous: number) {
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
  weight: number
) {
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

  const met = metValues[activityType] || 5;

  return Math.round((met * weight * duration) / 60);
}

export function getDailyCalorieGoal(
  age: number,
  gender: 'male' | 'female' | 'other',
  weight: number,
  height: number,
  goal: 'loss' | 'gain' | 'maintenance'
) {
  let bmr = 10 * weight + 6.25 * height - 5 * age;

  if (gender === 'male') bmr += 5;
  else if (gender === 'female') bmr -= 161;

  let calories = bmr * 1.4;

  if (goal === 'loss') calories -= 400;
  if (goal === 'gain') calories += 400;

  return Math.round(calories);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

export function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}