'use client';

import React, { useState, useEffect } from 'react';
import { getAllExercises, searchExercises } from '@/lib/db/operations';
import type { Exercise } from '@/lib/db/types';
import { Button } from '@/components/ui/Button';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  selectedExercise: Exercise | null;
}

export function ExerciseSelector({
  onSelect,
  selectedExercise,
}: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const allExercises = await getAllExercises();
    setExercises(allExercises);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchExercises(query);
      setExercises(results);
    } else {
      loadExercises();
    }
  };

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setIsOpen(false);
    setSearchQuery('');
    loadExercises();
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => setIsOpen(true)}
        >
          {selectedExercise ? selectedExercise.name : '選擇運動'}
        </Button>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="搜尋運動..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 text-lg bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-white"
            autoFocus
          />
          <div className="max-h-64 overflow-y-auto bg-gray-900 border-2 border-gray-600 rounded-lg">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleSelect(exercise)}
                className="w-full text-left px-4 py-3 text-white border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors font-medium"
              >
                {exercise.name}
              </button>
            ))}
            {exercises.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                沒有找到運動
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery('');
              loadExercises();
            }}
          >
            取消
          </Button>
        </div>
      )}
    </div>
  );
}
