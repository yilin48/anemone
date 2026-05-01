'use client';

import React, { useEffect, useState } from 'react';
import type { GymEquipment, Exercise, MuscleGroup, EquipmentType } from '@/lib/db/types';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '@/lib/db/types';
import {
  getAllGymEquipment,
  createGymEquipment,
  deleteGymEquipment,
  getAllExercises,
} from '@/lib/db/operations';

const COLS = 10;
const ROWS = 8;
const CELL = 64;

interface GymMapProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export function GymMap({ onSelectExercise }: GymMapProps) {
  const [equipment, setEquipment] = useState<GymEquipment[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [filterTag, setFilterTag] = useState<MuscleGroup | null>(null);
  const [filterEquipment, setFilterEquipment] = useState<EquipmentType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [eq, ex] = await Promise.all([getAllGymEquipment(), getAllExercises()]);
    setEquipment(eq);
    setExercises(ex);
    if (ex.length > 0) setSelectedExerciseId(ex[0].id);
  };

  const getEquipmentAt = (x: number, y: number) =>
    equipment.find((e) => e.grid_x === x && e.grid_y === y);

  const handleCellClick = async (x: number, y: number) => {
    const existing = getEquipmentAt(x, y);

    if (editMode) {
      if (existing) {
        await deleteGymEquipment(existing.id);
        setEquipment((prev) => prev.filter((e) => e.id !== existing.id));
      } else {
        if (!selectedExerciseId) return;
        const exercise = exercises.find((e) => e.id === selectedExerciseId);
        if (!exercise) return;
        const id = await createGymEquipment({
          name: exercise.name,
          exercise_id: selectedExerciseId,
          grid_x: x,
          grid_y: y,
        });
        setEquipment((prev) => [
          ...prev,
          { id, name: exercise.name, exercise_id: selectedExerciseId, grid_x: x, grid_y: y, created_at: new Date() },
        ]);
      }
    } else {
      if (existing) {
        const exercise = exercises.find((e) => e.id === existing.exercise_id);
        if (exercise) onSelectExercise(exercise);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">健身房地圖</h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
            editMode
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-gray-600 hover:border-white'
          }`}
        >
          {editMode ? '完成' : '編輯'}
        </button>
      </div>

      {/* Exercise picker (edit mode only) */}
      {editMode && (() => {
        const filtered = exercises.filter((ex) => {
          const tagMatch = !filterTag || ex.tags?.includes(filterTag);
          const equipMatch = !filterEquipment || ex.equipment_type === filterEquipment;
          return tagMatch && equipMatch;
        });

        return (
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 space-y-3">
            <p className="text-gray-400 text-sm">選擇器材，再點格子放置（點已放置的器材可移除）</p>

            {/* 部位 filter */}
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag((prev) => prev === tag ? null : tag)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                    filterTag === tag
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* 器材 filter */}
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterEquipment((prev) => prev === type ? null : type)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                    filterEquipment === type
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filtered.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-2">沒有符合的運動</p>
              ) : (
                filtered.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExerciseId(ex.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedExerciseId === ex.id
                        ? 'bg-white text-black font-semibold'
                        : 'text-white hover:bg-gray-700'
                    }`}
                  >
                    {ex.name}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          style={{ width: COLS * CELL, height: ROWS * CELL }}
          className="relative border-2 border-gray-700 rounded-lg overflow-hidden flex-shrink-0"
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, #374151 1px, transparent 1px),
                linear-gradient(to bottom, #374151 1px, transparent 1px)
              `,
              backgroundSize: `${CELL}px ${CELL}px`,
            }}
          />

          {/* Clickable cells */}
          {Array.from({ length: ROWS }, (_, y) =>
            Array.from({ length: COLS }, (_, x) => {
              const eq = getEquipmentAt(x, y);
              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  style={{ left: x * CELL, top: y * CELL, width: CELL, height: CELL }}
                  className={`absolute flex items-center justify-center transition-colors ${
                    eq
                      ? editMode
                        ? 'bg-red-900 hover:bg-red-700 border-2 border-red-500'
                        : 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-500'
                      : editMode
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-900'
                  }`}
                >
                  {eq && (
                    <span className="text-white text-xs font-semibold text-center leading-tight px-1 break-all">
                      {eq.name.replace(/ \(.*\)/, '')}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {!editMode && equipment.length === 0 && (
        <p className="text-gray-500 text-sm text-center">點「編輯」開始放置器材</p>
      )}
    </div>
  );
}
