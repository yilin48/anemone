'use client';

import React, { useEffect, useState } from 'react';
import type { GymZone, GymEquipmentWithExercises, GymWalkway, Exercise, MuscleGroup, EquipmentType } from '@/lib/db/types';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '@/lib/db/types';
import {
  getZoneEquipmentWithExercises,
  createGymEquipment,
  deleteGymEquipment,
  addExerciseToEquipment,
  removeExerciseFromEquipment,
  getZoneWalkways,
  createGymWalkway,
  deleteGymWalkway,
  getAllExercises,
} from '@/lib/db/operations';

const CELL = 44;

interface GymMapProps {
  zone: GymZone;
  onSelectExercise: (exercise: Exercise) => void;
  onBack: () => void;
}

export function GymMap({ zone, onSelectExercise, onBack }: GymMapProps) {
  const [equipment, setEquipment] = useState<GymEquipmentWithExercises[]>([]);
  const [walkways, setWalkways] = useState<GymWalkway[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editSubMode, setEditSubMode] = useState<'equipment' | 'walkway'>('equipment');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [filterTag, setFilterTag] = useState<MuscleGroup | null>(null);
  const [filterEquipment, setFilterEquipment] = useState<EquipmentType | null>(null);
  const [managingId, setManagingId] = useState<string | null>(null);
  const [pickingForId, setPickingForId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [zone.id]);

  const loadData = async () => {
    const [eq, wk, ex] = await Promise.all([
      getZoneEquipmentWithExercises(zone.id),
      getZoneWalkways(zone.id),
      getAllExercises(),
    ]);
    setEquipment(eq);
    setWalkways(wk);
    setExercises(ex);
    if (ex.length > 0) setSelectedExerciseId(ex[0].id);
  };

  const getEquipmentAt = (x: number, y: number) =>
    equipment.find((e) => e.grid_x === x && e.grid_y === y);

  const getWalkwayAt = (x: number, y: number) =>
    walkways.find((w) => w.grid_x === x && w.grid_y === y);

  const handleCellClick = async (x: number, y: number) => {
    if (editMode) {
      if (editSubMode === 'walkway') {
        const existing = getWalkwayAt(x, y);
        if (getEquipmentAt(x, y)) return;
        if (existing) {
          await deleteGymWalkway(existing.id);
          setWalkways((prev) => prev.filter((w) => w.id !== existing.id));
        } else {
          const id = await createGymWalkway(zone.id, x, y);
          setWalkways((prev) => [...prev, { id, zone_id: zone.id, grid_x: x, grid_y: y, created_at: new Date() }]);
        }
      } else {
        const existing = getEquipmentAt(x, y);
        if (existing) {
          setManagingId(existing.id);
        } else {
          if (!selectedExerciseId) return;
          const exercise = exercises.find((e) => e.id === selectedExerciseId);
          if (!exercise) return;
          const wk = getWalkwayAt(x, y);
          if (wk) {
            await deleteGymWalkway(wk.id);
            setWalkways((prev) => prev.filter((w) => w.id !== wk.id));
          }
          const id = await createGymEquipment({
            name: exercise.name,
            exercise_id: selectedExerciseId,
            zone_id: zone.id,
            grid_x: x,
            grid_y: y,
          });
          setEquipment((prev) => [
            ...prev,
            { id, name: exercise.name, zone_id: zone.id, grid_x: x, grid_y: y, created_at: new Date(), exercises: [exercise] },
          ]);
        }
      }
    } else {
      const existing = getEquipmentAt(x, y);
      if (existing && existing.exercises.length > 0) {
        if (existing.exercises.length === 1) {
          onSelectExercise(existing.exercises[0]);
        } else {
          setPickingForId(existing.id);
        }
      }
    }
  };

  const managingEquipment = managingId ? equipment.find((e) => e.id === managingId) : null;
  const pickingEquipment = pickingForId ? equipment.find((e) => e.id === pickingForId) : null;

  const handleAddExerciseToManaging = async () => {
    if (!managingId || !selectedExerciseId) return;
    const exercise = exercises.find((e) => e.id === selectedExerciseId);
    if (!exercise) return;
    await addExerciseToEquipment(managingId, selectedExerciseId);
    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === managingId
          ? { ...eq, exercises: eq.exercises.some((e) => e.id === exercise.id) ? eq.exercises : [...eq.exercises, exercise] }
          : eq
      )
    );
  };

  const handleRemoveExerciseFromManaging = async (exercise_id: string) => {
    if (!managingId) return;
    await removeExerciseFromEquipment(managingId, exercise_id);
    setEquipment((prev) =>
      prev.map((eq) =>
        eq.id === managingId
          ? { ...eq, exercises: eq.exercises.filter((e) => e.id !== exercise_id) }
          : eq
      )
    );
  };

  const handleDeleteManagingEquipment = async () => {
    if (!managingId) return;
    await deleteGymEquipment(managingId);
    setEquipment((prev) => prev.filter((eq) => eq.id !== managingId));
    setManagingId(null);
  };

  const filtered = exercises.filter((ex) => {
    const tagMatch = !filterTag || ex.tags?.includes(filterTag);
    const equipMatch = !filterEquipment || ex.equipment_type === filterEquipment;
    return tagMatch && equipMatch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-white text-sm">← 返回</button>
          <h2 className="text-white font-bold text-lg">{zone.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <>
              <button
                onClick={() => { setEditSubMode('equipment'); setManagingId(null); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  editSubMode === 'equipment'
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                }`}
              >
                器材
              </button>
              <button
                onClick={() => { setEditSubMode('walkway'); setManagingId(null); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  editSubMode === 'walkway'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                }`}
              >
                走道
              </button>
            </>
          )}
          <button
            onClick={() => { setEditMode(!editMode); setManagingId(null); setEditSubMode('equipment'); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
              editMode
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-white border-gray-600 hover:border-white'
            }`}
          >
            {editMode ? '完成' : '編輯'}
          </button>
        </div>
      </div>

      {/* Exercise picker */}
      {editMode && editSubMode === 'equipment' && !managingId && (
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3 space-y-3">
          <p className="text-gray-400 text-sm">選擇運動，再點格子放置；點已放置的器材可管理</p>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((tag) => (
              <button key={tag} onClick={() => setFilterTag((p) => p === tag ? null : tag)}
                className={`px-2 py-1 rounded-full text-xs border transition-colors ${filterTag === tag ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'}`}>
                {tag}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_TYPES.map((type) => (
              <button key={type} onClick={() => setFilterEquipment((p) => p === type ? null : type)}
                className={`px-2 py-1 rounded-full text-xs border transition-colors ${filterEquipment === type ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'}`}>
                {type}
              </button>
            ))}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filtered.length === 0
              ? <p className="text-gray-500 text-sm text-center py-2">沒有符合的運動</p>
              : filtered.map((ex) => (
                  <button key={ex.id} onClick={() => setSelectedExerciseId(ex.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedExerciseId === ex.id ? 'bg-white text-black font-semibold' : 'text-white hover:bg-gray-700'}`}>
                    {ex.name}
                  </button>
                ))}
          </div>
        </div>
      )}

      {/* Walkway hint */}
      {editMode && editSubMode === 'walkway' && (
        <div className="bg-gray-900 border-2 border-blue-800 rounded-lg p-3">
          <p className="text-blue-300 text-sm">點格子設置／移除走道；器材格子無法設置走道</p>
        </div>
      )}

      {/* Equipment management panel */}
      {editMode && managingId && managingEquipment && (
        <div className="bg-gray-900 border-2 border-yellow-700 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-yellow-300 text-sm font-semibold">{managingEquipment.name}</span>
            <button onClick={() => setManagingId(null)} className="text-gray-500 hover:text-white text-sm">✕</button>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-xs">已綁定的運動：</p>
            {managingEquipment.exercises.length === 0
              ? <p className="text-gray-600 text-sm">（尚未綁定運動）</p>
              : managingEquipment.exercises.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between bg-gray-800 rounded px-3 py-1.5">
                    <span className="text-white text-sm">{ex.name}</span>
                    <button onClick={() => handleRemoveExerciseFromManaging(ex.id)} className="text-red-400 hover:text-red-300 text-xs ml-2">移除</button>
                  </div>
                ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddExerciseToManaging}
              disabled={!selectedExerciseId || managingEquipment.exercises.some((e) => e.id === selectedExerciseId)}
              className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            >
              + 加入「{exercises.find((e) => e.id === selectedExerciseId)?.name ?? ''}」
            </button>
            <button onClick={handleDeleteManagingEquipment} className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-300 text-sm rounded-lg transition-colors">
              刪除器材
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          style={{ width: zone.cols * CELL, height: zone.rows * CELL }}
          className="relative border-2 border-gray-700 rounded-lg overflow-hidden flex-shrink-0"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #374151 1px, transparent 1px), linear-gradient(to bottom, #374151 1px, transparent 1px)`,
              backgroundSize: `${CELL}px ${CELL}px`,
            }}
          />

          {walkways.map((w) => (
            <div
              key={w.id}
              className="absolute pointer-events-none"
              style={{
                left: w.grid_x * CELL, top: w.grid_y * CELL, width: CELL, height: CELL,
                background: 'repeating-linear-gradient(45deg, #1e3a5f 0px, #1e3a5f 4px, #172a44 4px, #172a44 8px)',
              }}
            />
          ))}

          {Array.from({ length: zone.rows }, (_, y) =>
            Array.from({ length: zone.cols }, (_, x) => {
              const eq = getEquipmentAt(x, y);
              const wk = getWalkwayAt(x, y);
              const isManaging = managingId === eq?.id;
              const multiExercise = eq && eq.exercises.length > 1;

              let cellClass = '';
              if (eq) {
                cellClass = editMode
                  ? (isManaging ? 'bg-yellow-900 border-2 border-yellow-500' : 'bg-red-900 hover:bg-red-700 border-2 border-red-500')
                  : 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-500';
              } else if (wk) {
                cellClass = editMode && editSubMode === 'walkway' ? 'hover:bg-blue-900/40' : '';
              } else {
                cellClass = editMode
                  ? (editSubMode === 'walkway' ? 'hover:bg-blue-900/30' : 'hover:bg-gray-800')
                  : 'hover:bg-gray-900';
              }

              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  style={{ left: x * CELL, top: y * CELL, width: CELL, height: CELL }}
                  className={`absolute flex items-center justify-center transition-colors ${cellClass}`}
                >
                  {eq && (() => {
                    const primaryTag = eq.exercises[0]?.tags?.[0];
                    return (
                      <span className="text-white text-xs font-semibold text-center leading-tight">
                        {primaryTag ?? '—'}
                        {multiExercise && (
                          <span className="block text-yellow-300" style={{ fontSize: 9 }}>+{eq.exercises.length - 1}</span>
                        )}
                      </span>
                    );
                  })()}
                  {!eq && wk && (
                    <span className="text-blue-400 opacity-50" style={{ fontSize: 9 }}>道</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* View mode: multi-exercise picker */}
      {!editMode && pickingForId && pickingEquipment && (
        <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-semibold">選擇動作 — {pickingEquipment.name}</span>
            <button onClick={() => setPickingForId(null)} className="text-gray-500 hover:text-white text-sm">✕</button>
          </div>
          <div className="space-y-1">
            {pickingEquipment.exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => { onSelectExercise(ex); setPickingForId(null); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-700 transition-colors"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!editMode && equipment.length === 0 && (
        <p className="text-gray-500 text-sm text-center">點「編輯」開始放置器材</p>
      )}
    </div>
  );
}
