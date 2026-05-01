import { supabase, isSupabaseConfigured } from './supabase';
import {
  getUnsyncedWorkoutSets,
  markWorkoutSetAsSynced,
  getAllExercises,
  getAllWorkoutPlans,
  getAllGymEquipment,
} from '@/lib/db/operations';
import { db } from '@/lib/db';
import { useSyncStore } from '@/lib/store/sync-store';
import type { MuscleGroup, EquipmentType } from '@/lib/db/types';

const SYNC_INTERVAL = 30000;

let syncTimer: NodeJS.Timeout | null = null;

export async function downloadExercisesFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const localCount = await db.exercises.count();
  if (localCount > 0) return;

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  if (error || !data || data.length === 0) return;

  await db.exercises.bulkAdd(
    data.map((ex) => ({
      id: ex.id,
      name: ex.name,
      tags: (ex.tags ?? []) as MuscleGroup[],
      equipment_type: (ex.equipment_type ?? null) as EquipmentType | null,
      created_at: new Date(ex.created_at),
    }))
  );
}

async function syncExercises(): Promise<void> {
  const exercises = await getAllExercises();
  if (exercises.length === 0) return;

  await supabase.from('exercises').upsert(
    exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      tags: ex.tags ?? [],
      equipment_type: ex.equipment_type ?? null,
      created_at: ex.created_at.toISOString(),
    })),
    { onConflict: 'id' }
  );
}

async function syncWorkoutPlans(): Promise<void> {
  const plans = await getAllWorkoutPlans();
  if (plans.length > 0) {
    await supabase.from('workout_plans').upsert(
      plans.map((p) => ({
        id: p.id,
        name: p.name,
        created_at: p.created_at.toISOString(),
      })),
      { onConflict: 'id' }
    );
  }

  const planExercises = await db.plan_exercises.toArray();
  if (planExercises.length === 0) return;

  await supabase.from('plan_exercises').upsert(
    planExercises.map((pe) => ({
      id: pe.id,
      plan_id: pe.plan_id,
      exercise_id: pe.exercise_id,
      order: pe.order,
    })),
    { onConflict: 'id' }
  );
}

async function syncGymEquipment(): Promise<void> {
  const equipment = await getAllGymEquipment();
  if (equipment.length === 0) return;

  await supabase.from('gym_equipment').upsert(
    equipment.map((eq) => ({
      id: eq.id,
      name: eq.name,
      exercise_id: eq.exercise_id,
      grid_x: eq.grid_x,
      grid_y: eq.grid_y,
      created_at: eq.created_at.toISOString(),
    })),
    { onConflict: 'id' }
  );
}

export async function syncWorkoutSets(): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> {
  if (!navigator.onLine) {
    return { success: false, syncedCount: 0, error: 'Offline' };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, syncedCount: 0, error: 'Supabase not configured' };
  }

  const { setIsSyncing, decrementUnsyncedCount } = useSyncStore.getState();
  setIsSyncing(true);

  try {
    await syncExercises();

    const unsyncedSets = await getUnsyncedWorkoutSets();

    if (unsyncedSets.length === 0) {
      setIsSyncing(false);
      return { success: true, syncedCount: 0 };
    }

    const { error } = await supabase
      .from('workout_sets')
      .upsert(
        unsyncedSets.map((set) => ({
          id: set.id,
          exercise_id: set.exercise_id,
          weight: set.weight,
          reps: set.reps,
          unit: set.unit,
          created_at: set.created_at.toISOString(),
          synced: true,
        })),
        { onConflict: 'id' }
      );

    if (error) {
      setIsSyncing(false);
      return { success: false, syncedCount: 0, error: error.message };
    }

    await Promise.all(unsyncedSets.map((set) => markWorkoutSetAsSynced(set.id)));
    decrementUnsyncedCount(unsyncedSets.length);
    useSyncStore.getState().setLastSyncTime(new Date());

    setIsSyncing(false);
    return { success: true, syncedCount: unsyncedSets.length };
  } catch (error) {
    setIsSyncing(false);
    return {
      success: false,
      syncedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function fullSync(): Promise<{ success: boolean; error?: string }> {
  if (!navigator.onLine) return { success: false, error: 'Offline' };
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

  const { setIsSyncing, setLastSyncTime, setUnsyncedCount } = useSyncStore.getState();
  setIsSyncing(true);

  try {
    // exercises first — other tables have FK deps on it
    await syncExercises();
    await Promise.all([
      syncWorkoutSets(),
      syncWorkoutPlans(),
      syncGymEquipment(),
    ]);

    setLastSyncTime(new Date());
    setUnsyncedCount(0);
    setIsSyncing(false);
    return { success: true };
  } catch (error) {
    setIsSyncing(false);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function startSyncEngine() {
  if (typeof window === 'undefined') return;

  syncWorkoutSets();

  syncTimer = setInterval(() => {
    syncWorkoutSets();
  }, SYNC_INTERVAL);

  window.addEventListener('online', () => {
    syncWorkoutSets();
  });
}

export function stopSyncEngine() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

if (typeof window !== 'undefined') {
  startSyncEngine();
}
