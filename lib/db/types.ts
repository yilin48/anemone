// Database Types

export type WeightUnit = 'kg' | 'lb';

export interface Exercise {
  id: string;
  name: string;
  created_at: Date;
}

export interface WorkoutSet {
  id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  unit: WeightUnit;
  created_at: Date;
  synced: boolean;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  created_at: Date;
}

export interface PlanExercise {
  id: string;
  plan_id: string;
  exercise_id: string;
  order: number;
}

// Extended types with relations
export interface WorkoutSetWithExercise extends WorkoutSet {
  exercise?: Exercise;
}

export interface PlanExerciseWithDetails extends PlanExercise {
  exercise?: Exercise;
}

// Helper types for creating records
export type CreateWorkoutSet = Omit<WorkoutSet, 'id' | 'created_at' | 'synced'>;
export type CreateExercise = Omit<Exercise, 'id' | 'created_at'>;
export type CreateWorkoutPlan = Omit<WorkoutPlan, 'id' | 'created_at'>;
export type CreatePlanExercise = Omit<PlanExercise, 'id'>;
