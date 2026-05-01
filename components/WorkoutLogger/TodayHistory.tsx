'use client';

import React from 'react';
import type { WorkoutSetWithExercise } from '@/lib/db/types';
import { formatTime, formatWeight } from '@/lib/utils/format';
import { deleteWorkoutSet } from '@/lib/db/operations';

interface TodayHistoryProps {
  sets: WorkoutSetWithExercise[];
  onDelete: (id: string) => void;
}

export function TodayHistory({ sets, onDelete }: TodayHistoryProps) {
  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除這組記錄？')) {
      await deleteWorkoutSet(id);
      onDelete(id);
    }
  };

  if (sets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">💪</div>
        <div>今天還沒有訓練記錄</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-white mb-4">今日訓練</h2>
      {sets.map((set) => (
        <div
          key={set.id}
          className="flex items-center justify-between bg-gray-900 border-2 border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors"
        >
          <div className="flex-1">
            <div className="font-semibold text-base text-white">
              {set.exercise?.name || '未知運動'}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {formatTime(set.created_at)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono font-bold text-lg text-white">
                {formatWeight(set.weight, set.unit)}
              </div>
              <div className="text-sm text-gray-400">{set.reps} 次</div>
            </div>
            <button
              onClick={() => handleDelete(set.id)}
              className="text-gray-500 hover:text-red-400 transition-colors p-2"
              aria-label="刪除"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
