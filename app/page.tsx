import Link from "next/link";
import { WorkoutLogger } from "@/components/WorkoutLogger/WorkoutLogger";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 text-white py-4 px-4 border-b border-gray-700">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-3">💪 Gym Logger</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="font-semibold border-b-2 border-white pb-1">
              記錄
            </Link>
            <Link href="/plans" className="hover:opacity-80 pb-1">
              計劃
            </Link>
            <Link href="/analytics" className="hover:opacity-80 pb-1">
              分析
            </Link>
          </nav>
        </div>
      </header>

      <main className="py-6">
        <WorkoutLogger />
      </main>
    </div>
  );
}
