import Dexie, { type EntityTable } from 'dexie';
import type { Exercise, WorkoutSet, WorkoutPlan, PlanExercise, GymEquipment } from './types';

// Dexie Database Class
class GymLoggerDB extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>;
  workout_sets!: EntityTable<WorkoutSet, 'id'>;
  workout_plans!: EntityTable<WorkoutPlan, 'id'>;
  plan_exercises!: EntityTable<PlanExercise, 'id'>;
  gym_equipment!: EntityTable<GymEquipment, 'id'>;

  constructor() {
    super('GymLoggerDB');

    this.version(1).stores({
      exercises: 'id, name, created_at',
      workout_sets: 'id, exercise_id, created_at, synced, [exercise_id+created_at]',
      workout_plans: 'id, name, created_at',
      plan_exercises: 'id, plan_id, exercise_id, [plan_id+order]',
    });

    this.version(2).stores({
      exercises: 'id, name, created_at',
      workout_sets: 'id, exercise_id, created_at, synced, [exercise_id+created_at]',
      workout_plans: 'id, name, created_at',
      plan_exercises: 'id, plan_id, exercise_id, [plan_id+order]',
      gym_equipment: 'id, exercise_id, grid_x, grid_y',
    });

    this.version(3).stores({
      exercises: 'id, name, created_at',
      workout_sets: 'id, exercise_id, created_at, synced, [exercise_id+created_at]',
      workout_plans: 'id, name, created_at',
      plan_exercises: 'id, plan_id, exercise_id, [plan_id+order]',
      gym_equipment: 'id, exercise_id, grid_x, grid_y',
    }).upgrade((tx) => {
      return tx.table('exercises').toCollection().modify((ex) => {
        if (!ex.tags) ex.tags = [];
      });
    });

    this.version(4).stores({
      exercises: 'id, name, equipment_type, created_at',
      workout_sets: 'id, exercise_id, created_at, synced, [exercise_id+created_at]',
      workout_plans: 'id, name, created_at',
      plan_exercises: 'id, plan_id, exercise_id, [plan_id+order]',
      gym_equipment: 'id, exercise_id, grid_x, grid_y',
    }).upgrade((tx) => {
      return tx.table('exercises').toCollection().modify((ex) => {
        if (ex.equipment_type === undefined) ex.equipment_type = null;
      });
    });
  }
}

// Create singleton instance
export const db = new GymLoggerDB();

export async function initializeDB() {
  const localCount = await db.exercises.count();
  if (localCount === 0) {
    const { downloadExercisesFromSupabase } = await import('@/lib/sync/sync-engine');
    await downloadExercisesFromSupabase();
  }
}

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  initializeDB().catch(console.error);
}
