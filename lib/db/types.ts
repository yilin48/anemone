// Database Types

export type WeightUnit = 'kg' | 'lb';

export const MUSCLE_GROUPS = ['胸', '背', '腿', '肩', '手臂', '核心'] as const;
export type MuscleGroup = typeof MUSCLE_GROUPS[number];

export const EQUIPMENT_TYPES = ['槓鈴', '啞鈴', '纜繩', '機械'] as const;
export type EquipmentType = typeof EQUIPMENT_TYPES[number];

export interface Exercise {
  id: string;
  name: string;
  tags: MuscleGroup[];
  equipment_type: EquipmentType | null;
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

export interface GymEquipment {
  id: string;
  name: string;
  exercise_id: string;
  grid_x: number;
  grid_y: number;
  created_at: Date;
}

export type CreateGymEquipment = Omit<GymEquipment, 'id' | 'created_at'>;

// Helper types for creating records
export type CreateWorkoutSet = Omit<WorkoutSet, 'id' | 'created_at' | 'synced'>;
export type CreateExercise = Omit<Exercise, 'id' | 'created_at'> & { tags?: MuscleGroup[]; equipment_type?: EquipmentType | null };
export type CreateWorkoutPlan = Omit<WorkoutPlan, 'id' | 'created_at'>;
export type CreatePlanExercise = Omit<PlanExercise, 'id'>;
