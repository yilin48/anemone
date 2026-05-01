'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Exercise, MuscleGroup, EquipmentType } from '@/lib/db/types';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '@/lib/db/types';
import {
  getAllExercises,
  createExercise,
  deleteExercise,
  updateExercise,
} from '@/lib/db/operations';

function TagSelector({
  selected,
  onChange,
}: {
  selected: MuscleGroup[];
  onChange: (tags: MuscleGroup[]) => void;
}) {
  const toggle = (tag: MuscleGroup) => {
    onChange(
      selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {MUSCLE_GROUPS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-colors ${
            selected.includes(tag)
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

function EquipmentTypeSelector({
  selected,
  onChange,
}: {
  selected: EquipmentType | null;
  onChange: (type: EquipmentType | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {EQUIPMENT_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(selected === type ? null : type)}
          className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-colors ${
            selected === type
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filterTags, setFilterTags] = useState<MuscleGroup[]>([]);
  const [filterEquipment, setFilterEquipment] = useState<EquipmentType | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTags, setNewTags] = useState<MuscleGroup[]>([]);
  const [newEquipmentType, setNewEquipmentType] = useState<EquipmentType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingTags, setEditingTags] = useState<MuscleGroup[]>([]);
  const [editingEquipmentType, setEditingEquipmentType] = useState<EquipmentType | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const all = await getAllExercises();
    setExercises(all);
  };

  const filtered = exercises.filter((ex) => {
    const tagMatch = filterTags.length === 0 || filterTags.some((t) => ex.tags?.includes(t));
    const equipMatch = !filterEquipment || ex.equipment_type === filterEquipment;
    return tagMatch && equipMatch;
  });

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    await createExercise({ name, tags: newTags, equipment_type: newEquipmentType });
    setNewName('');
    setNewTags([]);
    setNewEquipmentType(null);
    setIsAdding(false);
    loadExercises();
  };

  const handleEditStart = (ex: Exercise) => {
    setEditingId(ex.id);
    setEditingName(ex.name);
    setEditingTags(ex.tags ?? []);
    setEditingEquipmentType(ex.equipment_type ?? null);
  };

  const handleEditSave = async () => {
    if (!editingId || !editingName.trim()) return;
    await updateExercise(editingId, editingName.trim(), editingTags, editingEquipmentType);
    setExercises((prev) =>
      prev.map((e) =>
        e.id === editingId
          ? { ...e, name: editingName.trim(), tags: editingTags, equipment_type: editingEquipmentType }
          : e
      )
    );
    setEditingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`確定刪除「${name}」？`)) return;
    await deleteExercise(id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white py-4 px-4 border-b border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🏋️ 運動管理</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← 返回
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            + 新增運動
          </button>
        ) : (
          <div className="bg-gray-900 border-2 border-gray-600 rounded-xl p-4 space-y-3">
            <input
              type="text"
              placeholder="運動名稱（例如：坐姿划船）"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
              className="w-full px-4 py-3 bg-gray-800 text-white placeholder-gray-500 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-white"
            />
            <div>
              <p className="text-sm text-gray-400 mb-2">練習部位</p>
              <TagSelector selected={newTags} onChange={setNewTags} />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">器材類型</p>
              <EquipmentTypeSelector selected={newEquipmentType} onChange={setNewEquipmentType} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setIsAdding(false); setNewName(''); setNewTags([]); setNewEquipmentType(null); }}
                className="py-2 bg-gray-800 text-white border-2 border-gray-600 rounded-lg hover:border-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                新增
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-medium">篩選</span>
            {(filterTags.length > 0 || filterEquipment) && (
              <button
                onClick={() => { setFilterTags([]); setFilterEquipment(null); }}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                清除
              </button>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">部位</p>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTags((prev) =>
                    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                  )}
                  className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${
                    filterTags.includes(tag)
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">器材</p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterEquipment((prev) => prev === type ? null : type)}
                  className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${
                    filterEquipment === type
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-600">{filtered.length} / {exercises.length} 個運動</p>
        </div>

        <div className="space-y-2">
          {filtered.map((ex) => (
            <div key={ex.id} className="bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3">
              {editingId === ex.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setEditingId(null)}
                    autoFocus
                    className="w-full px-3 py-2 bg-gray-800 text-white border-2 border-white rounded-lg focus:outline-none"
                  />
                  <TagSelector selected={editingTags} onChange={setEditingTags} />
                  <EquipmentTypeSelector selected={editingEquipmentType} onChange={setEditingEquipmentType} />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="py-2 bg-gray-800 text-white border-2 border-gray-600 rounded-lg hover:border-white transition-colors text-sm"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleEditSave}
                      className="py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      儲存
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">{ex.name}</div>
                    {(ex.equipment_type || (ex.tags && ex.tags.length > 0)) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ex.equipment_type && (
                          <span className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded-full font-medium">
                            {ex.equipment_type}
                          </span>
                        )}
                        {ex.tags && ex.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleEditStart(ex)}
                      className="text-gray-500 hover:text-white transition-colors p-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(ex.id, ex.name)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
