'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAllWorkoutPlans,
  createWorkoutPlan,
  deleteWorkoutPlan,
  getPlanExercises,
} from '@/lib/db/operations';
import type { WorkoutPlan, Exercise } from '@/lib/db/types';
import { Button } from '@/components/ui/Button';

export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const allPlans = await getAllWorkoutPlans();
    setPlans(allPlans);
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) {
      alert('請輸入計劃名稱');
      return;
    }

    await createWorkoutPlan({ name: newPlanName });
    setNewPlanName('');
    setShowCreateForm(false);
    loadPlans();
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (confirm(`確定要刪除「${name}」計劃？`)) {
      await deleteWorkoutPlan(id);
      loadPlans();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white py-4 px-4 border-b border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">📋 訓練計劃</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← 返回
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {!showCreateForm ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setShowCreateForm(true)}
          >
            + 新增計劃
          </Button>
        ) : (
          <div className="bg-gray-900 p-6 rounded-xl border-2 border-gray-600 space-y-4">
            <input
              type="text"
              placeholder="計劃名稱（例如：推日、拉日）"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              className="w-full px-4 py-3 text-lg bg-gray-800 text-white placeholder-gray-500 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-white"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPlanName('');
                }}
              >
                取消
              </Button>
              <Button variant="primary" size="md" onClick={handleCreatePlan}>
                建立
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {plans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <div>還沒有建立訓練計劃</div>
            </div>
          ) : (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={handleDeletePlan}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  plan,
  onDelete,
}: {
  plan: WorkoutPlan;
  onDelete: (id: string, name: string) => void;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadExercises();
  }, [plan.id]);

  const loadExercises = async () => {
    const planExercises = await getPlanExercises(plan.id);
    setExercises(planExercises);
  };

  return (
    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-white">{plan.name}</h3>
          <p className="text-sm text-gray-400">
            {exercises.length} 個運動
          </p>
        </div>
        <button
          onClick={() => onDelete(plan.id, plan.name)}
          className="text-gray-500 hover:text-red-400 transition-colors p-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {exercises.length > 0 && (
        <div className="space-y-1">
          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="text-sm text-gray-400">
              {index + 1}. {exercise.name}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        功能開發中：編輯計劃、開始訓練
      </div>
    </div>
  );
}
