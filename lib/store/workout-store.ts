import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise, WorkoutSet, WeightUnit } from '@/lib/db/types';

interface WorkoutState {
  // Current workout session
  selectedExercise: Exercise | null;
  currentWeight: number;
  currentReps: number;
  currentUnit: WeightUnit;

  // Today's workout sets
  todaySets: WorkoutSet[];

  // PR notification
  showPRNotification: boolean;
  prExerciseName: string | null;

  // Actions
  setSelectedExercise: (exercise: Exercise | null) => void;
  setCurrentWeight: (weight: number) => void;
  setCurrentReps: (reps: number) => void;
  setCurrentUnit: (unit: WeightUnit) => void;
  incrementWeight: (amount: number) => void;
  setTodaySets: (sets: WorkoutSet[]) => void;
  addSetToToday: (set: WorkoutSet) => void;
  removeSetFromToday: (id: string) => void;
  showPR: (exerciseName: string) => void;
  hidePR: () => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      // Initial state
      selectedExercise: null,
      currentWeight: 0,
      currentReps: 0,
      currentUnit: 'kg',
      todaySets: [],
      showPRNotification: false,
      prExerciseName: null,

      // Actions
      setSelectedExercise: (exercise) =>
        set({ selectedExercise: exercise }),

      setCurrentWeight: (weight) =>
        set({ currentWeight: weight }),

      setCurrentReps: (reps) =>
        set({ currentReps: reps }),

      setCurrentUnit: (unit) =>
        set({ currentUnit: unit }),

      incrementWeight: (amount) =>
        set((state) => ({
          currentWeight: Math.max(0, state.currentWeight + amount),
        })),

      setTodaySets: (sets) =>
        set({ todaySets: sets }),

      addSetToToday: (set_item) =>
        set((state) => ({
          todaySets: [set_item, ...state.todaySets],
        })),

      removeSetFromToday: (id) =>
        set((state) => ({
          todaySets: state.todaySets.filter((s) => s.id !== id),
        })),

      showPR: (exerciseName) =>
        set({
          showPRNotification: true,
          prExerciseName: exerciseName,
        }),

      hidePR: () =>
        set({
          showPRNotification: false,
          prExerciseName: null,
        }),

      reset: () =>
        set({
          selectedExercise: null,
          currentWeight: 0,
          currentReps: 0,
        }),
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({
        currentUnit: state.currentUnit,
      }),
    }
  )
);
