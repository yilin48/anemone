'use client';

import React, { useState, useEffect } from 'react';
import { getAllExercises } from '@/lib/db/operations';
import type { Exercise, MuscleGroup, EquipmentType } from '@/lib/db/types';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '@/lib/db/types';
import { Button } from '@/components/ui/Button';
import { MapExercisePicker } from './MapExercisePicker';

type Tab = 'filter' | 'map';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  selectedExercise: Exercise | null;
}

export function ExerciseSelector({ onSelect, selectedExercise }: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('filter');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<MuscleGroup | null>(null);
  const [filterEquipment, setFilterEquipment] = useState<EquipmentType | null>(null);

  useEffect(() => {
    getAllExercises().then(setExercises);
  }, []);

  const filtered = exercises.filter((ex) => {
    const nameMatch = !searchQuery || ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const tagMatch = !filterTag || ex.tags?.includes(filterTag);
    const equipMatch = !filterEquipment || ex.equipment_type === filterEquipment;
    return nameMatch && tagMatch && equipMatch;
  });

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  if (!isOpen) {
    return (
      <Button variant="secondary" size="lg" className="w-full" onClick={() => setIsOpen(true)}>
        {selectedExercise ? selectedExercise.name : '選擇運動'}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border-2 border-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('filter')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'filter' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          篩選
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === 'map' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          地圖
        </button>
      </div>

      {/* Filter tab */}
      {activeTab === 'filter' && (
        <div className="space-y-3">
          <input
            autoFocus
            type="text"
            placeholder="搜尋運動名稱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 text-base bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-white"
          />

          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag((p) => p === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  filterTag === tag ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilterEquipment((p) => p === type ? null : type)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  filterEquipment === type ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="max-h-56 overflow-y-auto bg-gray-900 border-2 border-gray-600 rounded-lg">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">沒有找到運動</div>
            ) : (
              filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelect(ex)}
                  className="w-full text-left px-4 py-3 text-white border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium">{ex.name}</span>
                  {ex.tags?.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">{ex.tags.join(' · ')}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Map tab */}
      {activeTab === 'map' && (
        <MapExercisePicker onSelect={handleSelect} />
      )}

      <Button variant="ghost" size="md" className="w-full" onClick={handleClose}>
        取消
      </Button>
    </div>
  );
}
