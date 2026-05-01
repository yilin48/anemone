'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAllExercises,
  getExerciseWeightHistory,
  getWeeklyWorkoutFrequency,
} from '@/lib/db/operations';
import type { Exercise } from '@/lib/db/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/lib/utils/format';

export default function AnalyticsPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [weightHistory, setWeightHistory] = useState<
    Array<{ date: Date; maxWeight: number }>
  >([]);
  const [weeklyFrequency, setWeeklyFrequency] = useState<
    Array<{ week: string; count: number }>
  >([]);

  useEffect(() => {
    loadExercises();
    loadWeeklyFrequency();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      loadWeightHistory(selectedExercise.id);
    }
  }, [selectedExercise]);

  const loadExercises = async () => {
    const allExercises = await getAllExercises();
    setExercises(allExercises);
    if (allExercises.length > 0) {
      setSelectedExercise(allExercises[0]);
    }
  };

  const loadWeightHistory = async (exerciseId: string) => {
    const history = await getExerciseWeightHistory(exerciseId, 30);
    setWeightHistory(history);
  };

  const loadWeeklyFrequency = async () => {
    const frequency = await getWeeklyWorkoutFrequency(8);
    setWeeklyFrequency(frequency);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white py-4 px-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">📊 數據分析</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← 返回
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Weekly Frequency Chart */}
        <div className="bg-gray-900 p-6 rounded-xl border-2 border-gray-700">
          <h2 className="text-lg font-bold mb-4">每週訓練頻率</h2>
          {weeklyFrequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="week"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  labelFormatter={(value) => formatDate(new Date(value))}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    color: '#f9fafb',
                  }}
                />
                <Bar dataKey="count" fill="#ffffff" name="訓練天數" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              還沒有訓練數據
            </div>
          )}
        </div>

        {/* Exercise Selection */}
        {exercises.length > 0 && (
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
            <label className="block text-sm font-semibold mb-2 text-gray-400">
              選擇運動
            </label>
            <select
              value={selectedExercise?.id || ''}
              onChange={(e) => {
                const exercise = exercises.find((ex) => ex.id === e.target.value);
                setSelectedExercise(exercise || null);
              }}
              className="w-full px-4 py-3 text-lg bg-gray-800 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:border-white"
            >
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Weight Trend Chart */}
        {selectedExercise && (
          <div className="bg-gray-900 p-6 rounded-xl border-2 border-gray-700">
            <h2 className="text-lg font-bold mb-4">
              {selectedExercise.name} - 重量趨勢
            </h2>
            {weightHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    labelFormatter={(value) => formatDate(new Date(value))}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '2px solid #4b5563',
                      borderRadius: '8px',
                      color: '#f9fafb',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={{ fill: '#ffffff', r: 4 }}
                    name="最大重量 (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {selectedExercise.name} 還沒有訓練記錄
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
