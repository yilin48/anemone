'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GymZoneList } from '@/components/GymMap/GymZoneList';
import { GymMap } from '@/components/GymMap/GymMap';
import type { GymZone, Exercise } from '@/lib/db/types';
import { useWorkoutStore } from '@/lib/store/workout-store';

export default function MapPage() {
  const { setSelectedExercise } = useWorkoutStore();
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<GymZone | null>(null);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white py-4 px-4 border-b border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🗺️ 器材地圖</h1>
          {!selectedZone && (
            <Link href="/" className="text-sm text-gray-400 hover:text-white">
              ← 返回
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {selectedZone ? (
          <GymMap
            zone={selectedZone}
            onSelectExercise={handleSelectExercise}
            onBack={() => setSelectedZone(null)}
          />
        ) : (
          <GymZoneList onSelectZone={setSelectedZone} />
        )}
      </main>
    </div>
  );
}
