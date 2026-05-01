import { supabase, isSupabaseConfigured } from './supabase';
import {
  getUnsyncedWorkoutSets,
  markWorkoutSetAsSynced,
  getAllExercises,
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

  console.log(`✅ Downloaded ${data.length} exercises from Supabase`);
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

export async function syncWorkoutSets(): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> {
  if (!navigator.onLine) {
    return { success: false, syncedCount: 0, error: 'Offline' };
  }

  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured, skipping sync');
    return { success: false, syncedCount: 0, error: 'Supabase not configured' };
  }

  const { setIsSyncing, decrementUnsyncedCount } = useSyncStore.getState();

  setIsSyncing(true);

  try {
    // Sync exercises first to satisfy foreign key constraints
    await syncExercises();

    const unsyncedSets = await getUnsyncedWorkoutSets();

    if (unsyncedSets.length === 0) {
      setIsSyncing(false);
      return { success: true, syncedCount: 0 };
    }

    console.log(`🔄 Syncing ${unsyncedSets.length} workout sets...`);

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
      console.error('❌ Sync error:', error);
      setIsSyncing(false);
      return { success: false, syncedCount: 0, error: error.message };
    }

    await Promise.all(
      unsyncedSets.map((set) => markWorkoutSetAsSynced(set.id))
    );

    decrementUnsyncedCount(unsyncedSets.length);
    useSyncStore.getState().setLastSyncTime(new Date());

    console.log(`✅ Synced ${unsyncedSets.length} workout sets`);

    setIsSyncing(false);
    return { success: true, syncedCount: unsyncedSets.length };
  } catch (error) {
    console.error('❌ Sync error:', error);
    setIsSyncing(false);
    return {
      success: false,
      syncedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function startSyncEngine() {
  if (typeof window === 'undefined') return;

  console.log('🚀 Starting sync engine...');

  syncWorkoutSets();

  syncTimer = setInterval(() => {
    syncWorkoutSets();
  }, SYNC_INTERVAL);

  window.addEventListener('online', () => {
    console.log('🌐 Back online, syncing...');
    syncWorkoutSets();
  });
}

export function stopSyncEngine() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
    console.log('⏹️ Sync engine stopped');
  }
}

if (typeof window !== 'undefined') {
  startSyncEngine();
}
