'use client';

import React, { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/lib/store/workout-store';
import { useSyncStore } from '@/lib/store/sync-store';
import {
  createWorkoutSet,
  getTodayWorkoutSets,
  getLastSetForExercise,
  isNewPR,
} from '@/lib/db/operations';
import type { WorkoutSetWithExercise, WeightUnit } from '@/lib/db/types';
import { ExerciseSelector } from './ExerciseSelector';
import { TodayHistory } from './TodayHistory';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function WorkoutLogger() {
  const {
    selectedExercise,
    currentWeight,
    currentReps,
    currentUnit,
    setSelectedExercise,
    setCurrentWeight,
    setCurrentReps,
    setCurrentUnit,
    incrementWeight,
    addSetToToday,
    removeSetFromToday,
    showPR,
    reset,
  } = useWorkoutStore();

  const { incrementUnsyncedCount } = useSyncStore();

  const [todaySets, setTodaySets] = useState<WorkoutSetWithExercise[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    loadTodaySets();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      loadLastSet();
    }
  }, [selectedExercise]);

  const loadTodaySets = async () => {
    const sets = await getTodayWorkoutSets();
    setTodaySets(sets);
  };

  const loadLastSet = async () => {
    if (!selectedExercise) return;

    const lastSet = await getLastSetForExercise(selectedExercise.id);
    if (lastSet) {
      setCurrentWeight(lastSet.weight);
      setCurrentReps(lastSet.reps);
      setCurrentUnit(lastSet.unit);
    }
  };

  const handleLogSet = async () => {
    if (!selectedExercise || currentWeight <= 0 || currentReps <= 0) {
      alert('請填寫完整資料');
      return;
    }

    setIsLogging(true);

    try {
      // Check if this is a new PR
      const isPR = await isNewPR(selectedExercise.id, currentWeight, currentUnit);

      // Create workout set
      const setId = await createWorkoutSet({
        exercise_id: selectedExercise.id,
        weight: currentWeight,
        reps: currentReps,
        unit: currentUnit,
      });

      // Create set object for immediate UI update
      const newSet: WorkoutSetWithExercise = {
        id: setId,
        exercise_id: selectedExercise.id,
        weight: currentWeight,
        reps: currentReps,
        unit: currentUnit,
        created_at: new Date(),
        synced: false,
        exercise: selectedExercise,
      };

      // Optimistic UI update
      addSetToToday(newSet);
      setTodaySets((prev) => [newSet, ...prev]);

      // Increment unsynced counter
      incrementUnsyncedCount();

      // Show PR notification
      if (isPR) {
        showPR(selectedExercise.name);
      }

      // Visual feedback
      alert('✅ 記錄成功！');
    } catch (error) {
      console.error('Error logging set:', error);
      alert('記錄失敗，請重試');
    } finally {
      setIsLogging(false);
    }
  };

  const handleUseLastSet = async () => {
    if (!selectedExercise) return;
    await loadLastSet();
  };

  const handleDelete = (id: string) => {
    setTodaySets((prev) => prev.filter((s) => s.id !== id));
    removeSetFromToday(id);
  };

  const toggleUnit = () => {
    setCurrentUnit(currentUnit === 'kg' ? 'lb' : 'kg');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Exercise Selector */}
      <div>
        <ExerciseSelector
          selectedExercise={selectedExercise}
          onSelect={setSelectedExercise}
        />
      </div>

      {/* Input Section */}
      {selectedExercise && (
        <div className="space-y-4 bg-gray-900 p-6 rounded-xl border-2 border-gray-600">
          <h3 className="font-bold text-lg">{selectedExercise.name}</h3>

          {/* Weight Input */}
          <div>
            <div className="flex items-end gap-2 mb-2">
              <div className="flex-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="重量"
                  value={currentWeight || ''}
                  onChange={(e) => setCurrentWeight(Number(e.target.value))}
                  className="text-center text-2xl font-bold"
                />
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={toggleUnit}
                className="min-w-[60px]"
              >
                {currentUnit}
              </Button>
            </div>

            {/* Increment Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="increment"
                size="sm"
                onClick={() => incrementWeight(2.5)}
              >
                +2.5
              </Button>
              <Button
                variant="increment"
                size="sm"
                onClick={() => incrementWeight(5)}
              >
                +5
              </Button>
              <Button
                variant="increment"
                size="sm"
                onClick={() => incrementWeight(10)}
              >
                +10
              </Button>
            </div>
          </div>

          {/* Reps Input */}
          <div className="space-y-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="次數"
              value={currentReps || ''}
              onChange={(e) => setCurrentReps(Number(e.target.value))}
              className="text-center text-2xl font-bold"
            />
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentReps(n)}
                  className={`py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                    currentReps === n
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" size="md" onClick={handleUseLastSet}>
              重複上一組
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleLogSet}
              disabled={isLogging}
            >
              {isLogging ? '記錄中...' : '記錄'}
            </Button>
          </div>
        </div>
      )}

      {/* Today's History */}
      <div>
        <TodayHistory sets={todaySets} onDelete={handleDelete} />
      </div>
    </div>
  );
}
