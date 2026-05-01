'use client';

import React, { useEffect } from 'react';
import { useWorkoutStore } from '@/lib/store/workout-store';

export function PRIndicator() {
  const { showPRNotification, prExerciseName, hidePR } = useWorkoutStore();

  useEffect(() => {
    if (showPRNotification) {
      const timer = setTimeout(() => {
        hidePR();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showPRNotification, hidePR]);

  if (!showPRNotification) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-lg shadow-lg border-2 border-yellow-600">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏆</span>
          <div>
            <div className="font-bold text-lg">新紀錄！</div>
            <div className="text-sm opacity-90">{prExerciseName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
