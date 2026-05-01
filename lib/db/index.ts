import Dexie, { type EntityTable } from 'dexie';
import type { Exercise, WorkoutSet, WorkoutPlan, PlanExercise } from './types';

// Dexie Database Class
class GymLoggerDB extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>;
  workout_sets!: EntityTable<WorkoutSet, 'id'>;
  workout_plans!: EntityTable<WorkoutPlan, 'id'>;
  plan_exercises!: EntityTable<PlanExercise, 'id'>;

  constructor() {
    super('GymLoggerDB');

    this.version(1).stores({
      exercises: 'id, name, created_at',
      workout_sets: 'id, exercise_id, created_at, synced, [exercise_id+created_at]',
      workout_plans: 'id, name, created_at',
      plan_exercises: 'id, plan_id, exercise_id, [plan_id+order]',
    });
  }
}

// Create singleton instance
export const db = new GymLoggerDB();

// Initialize database with seed data
export async function initializeDB() {
  const exerciseCount = await db.exercises.count();

  // Only seed if database is empty
  if (exerciseCount === 0) {
    await seedDefaultExercises();
  }
}

// Seed default exercises
async function seedDefaultExercises() {
  const defaultExercises = [
    { id: crypto.randomUUID(), name: '深蹲 (Squat)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '臥推 (Bench Press)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '硬舉 (Deadlift)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '肩推 (Overhead Press)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '槓鈴划船 (Barbell Row)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '引體向上 (Pull-up)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '二頭彎舉 (Bicep Curl)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '三頭下推 (Tricep Pushdown)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '腿推 (Leg Press)', created_at: new Date() },
    { id: crypto.randomUUID(), name: '啞鈴飛鳥 (Dumbbell Fly)', created_at: new Date() },
  ];

  await db.exercises.bulkAdd(defaultExercises);
  console.log('✅ Default exercises seeded');
}

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  initializeDB().catch(console.error);
}
