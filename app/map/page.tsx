'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GymMap } from '@/components/GymMap/GymMap';
import type { Exercise } from '@/lib/db/types';
import { useWorkoutStore } from '@/lib/store/workout-store';

export default function MapPage() {
  const { setSelectedExercise } = useWorkoutStore();
  const router = useRouter();

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white py-4 px-4 border-b border-gray-700">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🗺️ 器材地圖</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ← 返回
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <GymMap onSelectExercise={handleSelectExercise} />
      </main>
    </div>
  );
}
