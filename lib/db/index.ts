import Dexie, { type EntityTable } from 'dexie';
import type { Exercise, WorkoutSet, WorkoutPlan, PlanExercise, GymZone, GymEquipment, GymEquipmentExercise, GymWalkway } from './types';

// Dexie Database Class
class GymLoggerDB extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>;
  workout_sets!: EntityTable<WorkoutSet, 'id'>;
  workout_plans!: EntityTable<WorkoutPlan, 'id'>;
  plan_exercises!: EntityTable<PlanExercise, 'id'>;
  gym_zones!: EntityTable<GymZone, 'id'>;
  gym_equipment!: EntityTable<GymEquipment, 'id'>;
  gym_equipment_exercises!: EntityTable<GymEquipmentExercise, 'id'>;
  gym_walkways!: EntityTable<GymWalkway, 'id'>;

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

    this.version(5).stores({
      exercises: 'id, name, equipment_type, created_at',
      workout_sets: 'id, exercise_id, created_at, synced, [exercise_id+created_at]',
      workout_plans: 'id, name, created_at',
      plan_exercises: 'id, plan_id, exercise_id, [plan_id+order]',
      gym_equipment: 'id, grid_x, grid_y',
      gym_equipment_exercises: 'id, equipment_id, exercise_id',
      gym_walkways: 'id, grid_x, grid_y',
    }).upgrade(async (tx) => {
      const equipment = await tx.table('gym_equipment').toArray();
      const junctionRecords = equipment
        .filter((eq: GymEquipment) => eq.exercise_id)
        .map((eq: GymEquipment) => ({
          id: crypto.randomUUID(),
          equipment_id: eq.id,
          exercise_id: eq.exercise_id!,
        }));
      if (junctionRecords.length > 0) {
        await tx.table('gym_equipment_exercises').bulkAdd(junctionRecords);
      }
    });

    this.version(6).stores({
      exercises: 'id, name, equipment_type, created_at',
      workout_sets: 'id, exercise_id, created_at, synced, [exercise_id+created_at]',
      workout_plans: 'id, name, created_at',
      plan_exercises: 'id, plan_id, exercise_id, [plan_id+order]',
      gym_zones: 'id, order',
      gym_equipment: 'id, zone_id, grid_x, grid_y',
      gym_equipment_exercises: 'id, equipment_id, exercise_id',
      gym_walkways: 'id, zone_id, grid_x, grid_y',
    }).upgrade(async (tx) => {
      const equipment = await tx.table('gym_equipment').toArray();
      const walkways = await tx.table('gym_walkways').toArray();
      if (equipment.length > 0 || walkways.length > 0) {
        const defaultZoneId = crypto.randomUUID();
        await tx.table('gym_zones').add({
          id: defaultZoneId,
          name: '主區域',
          cols: 10,
          rows: 8,
          order: 0,
          created_at: new Date(),
        });
        await tx.table('gym_equipment').toCollection().modify({ zone_id: defaultZoneId });
        await tx.table('gym_walkways').toCollection().modify({ zone_id: defaultZoneId });
      }
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
