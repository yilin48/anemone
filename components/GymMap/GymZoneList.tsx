'use client';

import React, { useEffect, useState } from 'react';
import type { GymZone } from '@/lib/db/types';
import {
  getAllGymZones,
  createGymZone,
  deleteGymZone,
  getZoneEquipmentCount,
} from '@/lib/db/operations';

const SIZE_PRESETS = [
  { label: '小', cols: 4, rows: 3 },
  { label: '中', cols: 6, rows: 5 },
  { label: '大', cols: 8, rows: 6 },
] as const;

interface GymZoneListProps {
  onSelectZone: (zone: GymZone) => void;
}

export function GymZoneList({ onSelectZone }: GymZoneListProps) {
  const [zones, setZones] = useState<GymZone[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSize, setNewSize] = useState<(typeof SIZE_PRESETS)[number]>(SIZE_PRESETS[1]);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    const zs = await getAllGymZones();
    setZones(zs);
    const countEntries = await Promise.all(
      zs.map(async (z) => [z.id, await getZoneEquipmentCount(z.id)] as const)
    );
    setCounts(Object.fromEntries(countEntries));
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const order = zones.length;
    const id = await createGymZone({ name, cols: newSize.cols, rows: newSize.rows, order });
    const newZone: GymZone = { id, name, cols: newSize.cols, rows: newSize.rows, order, created_at: new Date() };
    setZones((prev) => [...prev, newZone]);
    setCounts((prev) => ({ ...prev, [id]: 0 }));
    setNewName('');
    setAdding(false);
  };

  const handleDelete = async (zone: GymZone) => {
    await deleteGymZone(zone.id);
    setZones((prev) => prev.filter((z) => z.id !== zone.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">健身房地圖</h2>
        <button
          onClick={() => { setEditMode(!editMode); setAdding(false); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
            editMode
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-gray-600 hover:border-white'
          }`}
        >
          {editMode ? '完成' : '編輯'}
        </button>
      </div>

      {zones.length === 0 && !editMode && (
        <p className="text-gray-500 text-sm text-center py-8">點「編輯」新增分區</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => !editMode && onSelectZone(zone)}
            disabled={editMode}
            className={`relative text-left rounded-xl border-2 p-4 transition-colors ${
              editMode
                ? 'border-gray-700 bg-gray-900 cursor-default'
                : 'border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-800 active:scale-95'
            }`}
          >
            <p className="text-white font-semibold text-sm">{zone.name}</p>
            <p className="text-gray-500 text-xs mt-1">
              {counts[zone.id] ?? 0} 台器材 · {zone.cols}×{zone.rows}
            </p>
            {editMode && (
              <button
                onClick={() => handleDelete(zone)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-400 text-lg leading-none"
              >
                ×
              </button>
            )}
          </button>
        ))}

        {editMode && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-xl border-2 border-dashed border-gray-700 p-4 text-gray-500 hover:border-gray-500 hover:text-gray-400 transition-colors text-sm"
          >
            + 新增分區
          </button>
        )}
      </div>

      {editMode && adding && (
        <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 space-y-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="分區名稱（例：啞鈴區）"
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-gray-500 placeholder-gray-600"
          />
          <div className="flex gap-2">
            {SIZE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setNewSize(preset)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  newSize === preset
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                }`}
              >
                {preset.label} {preset.cols}×{preset.rows}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="flex-1 py-2 bg-white text-black text-sm font-semibold rounded-lg disabled:opacity-40"
            >
              建立
            </button>
            <button
              onClick={() => { setAdding(false); setNewName(''); }}
              className="px-4 py-2 text-gray-400 text-sm hover:text-white"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
