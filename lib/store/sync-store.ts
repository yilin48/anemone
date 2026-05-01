import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  unsyncedCount: number;

  // Actions
  setOnline: (online: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: Date) => void;
  setUnsyncedCount: (count: number) => void;
  incrementUnsyncedCount: () => void;
  decrementUnsyncedCount: (amount?: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  lastSyncTime: null,
  unsyncedCount: 0,

  setOnline: (online) => set({ isOnline: online }),

  setIsSyncing: (syncing) => set({ isSyncing: syncing }),

  setLastSyncTime: (time) => set({ lastSyncTime: time }),

  setUnsyncedCount: (count) => set({ unsyncedCount: count }),

  incrementUnsyncedCount: () =>
    set((state) => ({ unsyncedCount: state.unsyncedCount + 1 })),

  decrementUnsyncedCount: (amount = 1) =>
    set((state) => ({
      unsyncedCount: Math.max(0, state.unsyncedCount - amount),
    })),
}));

// Listen to online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useSyncStore.getState().setOnline(true);
  });

  window.addEventListener('offline', () => {
    useSyncStore.getState().setOnline(false);
  });
}
