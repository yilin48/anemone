'use client';

import React, { useEffect, useState } from 'react';
import type { GymZone, GymEquipmentWithExercises, GymWalkway, Exercise } from '@/lib/db/types';
import {
  getAllGymZones,
  getZoneEquipmentWithExercises,
  getZoneWalkways,
  getZoneEquipmentCount,
} from '@/lib/db/operations';

const CELL = 44;

interface MapExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
}

export function MapExercisePicker({ onSelect }: MapExercisePickerProps) {
  const [zones, setZones] = useState<GymZone[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedZone, setSelectedZone] = useState<GymZone | null>(null);
  const [equipment, setEquipment] = useState<GymEquipmentWithExercises[]>([]);
  const [walkways, setWalkways] = useState<GymWalkway[]>([]);
  const [pickingFor, setPickingFor] = useState<GymEquipmentWithExercises | null>(null);

  useEffect(() => {
    getAllGymZones().then(async (zs) => {
      setZones(zs);
      const entries = await Promise.all(
        zs.map(async (z) => [z.id, await getZoneEquipmentCount(z.id)] as const)
      );
      setCounts(Object.fromEntries(entries));
    });
  }, []);

  const handleSelectZone = async (zone: GymZone) => {
    const [eq, wk] = await Promise.all([
      getZoneEquipmentWithExercises(zone.id),
      getZoneWalkways(zone.id),
    ]);
    setEquipment(eq);
    setWalkways(wk);
    setSelectedZone(zone);
    setPickingFor(null);
  };

  const getEquipmentAt = (x: number, y: number) =>
    equipment.find((e) => e.grid_x === x && e.grid_y === y);

  const getWalkwayAt = (x: number, y: number) =>
    walkways.find((w) => w.grid_x === x && w.grid_y === y);

  const handleCellClick = (x: number, y: number) => {
    const eq = getEquipmentAt(x, y);
    if (!eq || eq.exercises.length === 0) return;
    if (eq.exercises.length === 1) {
      onSelect(eq.exercises[0]);
    } else {
      setPickingFor(eq);
    }
  };

  if (zones.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        尚未設置地圖，請先至「器材地圖」頁建立分區
      </p>
    );
  }

  if (!selectedZone) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => handleSelectZone(zone)}
            className="text-left rounded-xl border-2 border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-800 active:scale-95 transition-all p-4"
          >
            <p className="text-white font-semibold text-sm">{zone.name}</p>
            <p className="text-gray-500 text-xs mt-1">{counts[zone.id] ?? 0} 台器材</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => { setSelectedZone(null); setPickingFor(null); }}
        className="text-gray-400 hover:text-white text-sm"
      >
        ← {selectedZone.name}
      </button>

      <div className="overflow-x-auto">
        <div
          style={{ width: selectedZone.cols * CELL, height: selectedZone.rows * CELL }}
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
          {Array.from({ length: selectedZone.rows }, (_, y) =>
            Array.from({ length: selectedZone.cols }, (_, x) => {
              const eq = getEquipmentAt(x, y);
              const wk = getWalkwayAt(x, y);
              const multi = eq && eq.exercises.length > 1;
              return (
                <button
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  style={{ left: x * CELL, top: y * CELL, width: CELL, height: CELL }}
                  className={`absolute flex items-center justify-center transition-colors ${
                    eq ? 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-500' : 'hover:bg-gray-900'
                  }`}
                >
                  {eq && (() => {
                    const tag = eq.exercises[0]?.tags?.[0];
                    return (
                      <span className="text-white text-xs font-semibold text-center leading-tight">
                        {tag ?? '—'}
                        {multi && <span className="block text-yellow-300" style={{ fontSize: 9 }}>+{eq.exercises.length - 1}</span>}
                      </span>
                    );
                  })()}
                  {!eq && wk && <span className="text-blue-400 opacity-50" style={{ fontSize: 9 }}>道</span>}
                </button>
              );
            })
          )}
        </div>
      </div>

      {pickingFor && (
        <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-3 space-y-1">
          <p className="text-gray-400 text-xs mb-2">選擇動作 — {pickingFor.name}</p>
          {pickingFor.exercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-gray-700 transition-colors"
            >
              {ex.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
