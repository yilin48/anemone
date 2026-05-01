'use client';

import { useEffect } from 'react';
import { startSyncEngine, stopSyncEngine } from '@/lib/sync/sync-engine';

export function SyncProvider() {
  useEffect(() => {
    startSyncEngine();
    return () => stopSyncEngine();
  }, []);

  return null;
}
