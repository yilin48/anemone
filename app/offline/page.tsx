'use client';

export default function Offline() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📴</div>
        <h1 className="text-2xl font-bold mb-2">目前離線</h1>
        <p className="text-gray-600 mb-6">
          您目前處於離線狀態，請檢查網路連線
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          重試
        </button>
      </div>
    </div>
  );
}
