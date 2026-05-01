import { supabase, isSupabaseConfigured } from './supabase';
import {
  getUnsyncedWorkoutSets,
  markWorkoutSetAsSynced,
} from '@/lib/db/operations';
import { useSyncStore } from '@/lib/store/sync-store';

// Sync interval (30 seconds)
const SYNC_INTERVAL = 30000;

let syncTimer: NodeJS.Timeout | null = null;

export async function syncWorkoutSets(): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> {
  // Check if online
  if (!navigator.onLine) {
    return { success: false, syncedCount: 0, error: 'Offline' };
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured, skipping sync');
    return { success: false, syncedCount: 0, error: 'Supabase not configured' };
  }

  const { setIsSyncing, decrementUnsyncedCount } = useSyncStore.getState();

  setIsSyncing(true);

  try {
    // Get unsynced sets
    const unsyncedSets = await getUnsyncedWorkoutSets();

    if (unsyncedSets.length === 0) {
      setIsSyncing(false);
      return { success: true, syncedCount: 0 };
    }

    console.log(`🔄 Syncing ${unsyncedSets.length} workout sets...`);

    // Upload to Supabase
    const { data, error } = await supabase
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

    // Mark as synced in local DB
    await Promise.all(
      unsyncedSets.map((set) => markWorkoutSetAsSynced(set.id))
    );

    // Update sync state
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

  // Initial sync
  syncWorkoutSets();

  // Periodic sync
  syncTimer = setInterval(() => {
    syncWorkoutSets();
  }, SYNC_INTERVAL);

  // Sync when coming back online
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

// Auto-start sync engine on client
if (typeof window !== 'undefined') {
  startSyncEngine();
}
