import { db } from './index';
import type {
  Exercise,
  WorkoutSet,
  WorkoutPlan,
  PlanExercise,
  CreateWorkoutSet,
  CreateExercise,
  CreateWorkoutPlan,
  CreatePlanExercise,
  WorkoutSetWithExercise,
  WeightUnit,
} from './types';

// ===== EXERCISES =====

export async function getAllExercises(): Promise<Exercise[]> {
  return db.exercises.orderBy('name').toArray();
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  return db.exercises.get(id);
}

export async function createExercise(data: CreateExercise): Promise<string> {
  const id = crypto.randomUUID();
  await db.exercises.add({
    id,
    ...data,
    created_at: new Date(),
  });
  return id;
}

export async function deleteExercise(id: string): Promise<void> {
  await db.exercises.delete(id);
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const allExercises = await db.exercises.toArray();
  const lowerQuery = query.toLowerCase();
  return allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(lowerQuery)
  );
}

// ===== WORKOUT SETS =====

export async function createWorkoutSet(data: CreateWorkoutSet): Promise<string> {
  const id = crypto.randomUUID();
  await db.workout_sets.add({
    id,
    ...data,
    created_at: new Date(),
    synced: false,
  });
  return id;
}

export async function getWorkoutSetsByExercise(
  exerciseId: string
): Promise<WorkoutSet[]> {
  return db.workout_sets
    .where('exercise_id')
    .equals(exerciseId)
    .reverse()
    .sortBy('created_at');
}

export async function getTodayWorkoutSets(): Promise<WorkoutSetWithExercise[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sets = await db.workout_sets
    .where('created_at')
    .aboveOrEqual(today)
    .reverse()
    .sortBy('created_at');

  // Fetch exercise details
  const setsWithExercise = await Promise.all(
    sets.map(async (set) => {
      const exercise = await db.exercises.get(set.exercise_id);
      return { ...set, exercise };
    })
  );

  return setsWithExercise;
}

export async function getLastSetForExercise(
  exerciseId: string
): Promise<WorkoutSet | undefined> {
  const sets = await db.workout_sets
    .where('exercise_id')
    .equals(exerciseId)
    .reverse()
    .sortBy('created_at');

  return sets[0];
}

export async function deleteWorkoutSet(id: string): Promise<void> {
  await db.workout_sets.delete(id);
}

export async function getUnsyncedWorkoutSets(): Promise<WorkoutSet[]> {
  return db.workout_sets.filter((set) => !set.synced).toArray();
}

export async function markWorkoutSetAsSynced(id: string): Promise<void> {
  await db.workout_sets.update(id, { synced: true });
}

// ===== PR TRACKING =====

export async function getPersonalRecord(
  exerciseId: string,
  unit: WeightUnit = 'kg'
): Promise<number> {
  const sets = await db.workout_sets
    .where('exercise_id')
    .equals(exerciseId)
    .and((set) => set.unit === unit)
    .toArray();

  if (sets.length === 0) return 0;

  return Math.max(...sets.map((set) => set.weight));
}

export async function isNewPR(
  exerciseId: string,
  weight: number,
  unit: WeightUnit = 'kg'
): Promise<boolean> {
  const currentPR = await getPersonalRecord(exerciseId, unit);
  return weight > currentPR;
}

// ===== WORKOUT PLANS =====

export async function getAllWorkoutPlans(): Promise<WorkoutPlan[]> {
  return db.workout_plans.orderBy('created_at').reverse().toArray();
}

export async function createWorkoutPlan(data: CreateWorkoutPlan): Promise<string> {
  const id = crypto.randomUUID();
  await db.workout_plans.add({
    id,
    ...data,
    created_at: new Date(),
  });
  return id;
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  // Delete associated plan exercises
  const planExercises = await db.plan_exercises
    .where('plan_id')
    .equals(id)
    .toArray();

  await db.plan_exercises.bulkDelete(planExercises.map((pe) => pe.id));
  await db.workout_plans.delete(id);
}

// ===== PLAN EXERCISES =====

export async function addExerciseToPlan(data: CreatePlanExercise): Promise<string> {
  const id = crypto.randomUUID();
  await db.plan_exercises.add({
    id,
    ...data,
  });
  return id;
}

export async function getPlanExercises(planId: string): Promise<Exercise[]> {
  const planExercises = await db.plan_exercises
    .where('plan_id')
    .equals(planId)
    .sortBy('order');

  const exercises = await Promise.all(
    planExercises.map((pe) => db.exercises.get(pe.exercise_id))
  );

  return exercises.filter((ex): ex is Exercise => ex !== undefined);
}

export async function removePlanExercise(id: string): Promise<void> {
  await db.plan_exercises.delete(id);
}

export async function reorderPlanExercises(
  planId: string,
  exerciseIds: string[]
): Promise<void> {
  const planExercises = await db.plan_exercises
    .where('plan_id')
    .equals(planId)
    .toArray();

  const updates = exerciseIds.map((exerciseId, index) => {
    const pe = planExercises.find((p) => p.exercise_id === exerciseId);
    if (pe) {
      return db.plan_exercises.update(pe.id, { order: index });
    }
  });

  await Promise.all(updates.filter(Boolean));
}

// ===== ANALYTICS =====

export async function getExerciseWeightHistory(
  exerciseId: string,
  limit: number = 30
): Promise<Array<{ date: Date; maxWeight: number }>> {
  const sets = await db.workout_sets
    .where('exercise_id')
    .equals(exerciseId)
    .reverse()
    .sortBy('created_at');

  // Group by date and get max weight per day
  const groupedByDate = new Map<string, number>();

  sets.forEach((set) => {
    const dateKey = set.created_at.toISOString().split('T')[0];
    const currentMax = groupedByDate.get(dateKey) || 0;
    groupedByDate.set(dateKey, Math.max(currentMax, set.weight));
  });

  const history = Array.from(groupedByDate.entries())
    .map(([dateStr, maxWeight]) => ({
      date: new Date(dateStr),
      maxWeight,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-limit);

  return history;
}

export async function getWeeklyWorkoutFrequency(weeks: number = 8): Promise<
  Array<{ week: string; count: number }>
> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - weeks * 7);

  const sets = await db.workout_sets
    .where('created_at')
    .aboveOrEqual(startDate)
    .toArray();

  // Group by week
  const weekMap = new Map<string, Set<string>>();

  sets.forEach((set) => {
    const date = new Date(set.created_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, new Set());
    }

    // Count unique days in the week
    const dayKey = set.created_at.toISOString().split('T')[0];
    weekMap.get(weekKey)!.add(dayKey);
  });

  const frequency = Array.from(weekMap.entries())
    .map(([week, days]) => ({
      week,
      count: days.size,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  return frequency;
}
