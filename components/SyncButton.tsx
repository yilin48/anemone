'use client';

import { useState } from 'react';
import { useSyncStore } from '@/lib/store/sync-store';
import { fullSync } from '@/lib/sync/sync-engine';

export function SyncButton() {
  const { isSyncing, lastSyncTime, unsyncedCount, isOnline } = useSyncStore();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSync() {
    if (isSyncing) return;
    setStatus('idle');
    const result = await fullSync();
    setStatus(result.success ? 'success' : 'error');
    setTimeout(() => setStatus('idle'), 3000);
  }

  const lastSyncLabel = lastSyncTime
    ? lastSyncTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing || !isOnline}
      title={
        !isOnline
          ? '離線中'
          : isSyncing
          ? '同步中...'
          : lastSyncLabel
          ? `上次同步：${lastSyncLabel}`
          : '同步全部資料'
      }
      className="fixed bottom-6 right-4 z-50 flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium shadow-lg transition-all disabled:opacity-50
        bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 active:scale-95"
    >
      {isSyncing ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-white" />
      ) : status === 'success' ? (
        <span className="text-green-400">✓</span>
      ) : status === 'error' ? (
        <span className="text-red-400">✕</span>
      ) : (
        <SyncIcon />
      )}
      <span>
        {isSyncing
          ? '同步中'
          : status === 'success'
          ? '完成'
          : status === 'error'
          ? '失敗'
          : unsyncedCount > 0
          ? `同步 (${unsyncedCount})`
          : '同步'}
      </span>
    </button>
  );
}

function SyncIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}
