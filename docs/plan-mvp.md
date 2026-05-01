# Gym Workout Logging PWA - 實施計劃

## 專案概述

這是一個健身訓練記錄的 Progressive Web App (PWA)，專注於快速、低摩擦的訓練記錄體驗。

### 核心原則
- ⚡ 極致速度（2 秒內完成一組記錄）
- 📴 離線優先（健身房環境）
- 📱 手機優先（單手操作）
- 💾 本地優先 + 背景同步

---

## 技術棧

### 前端
- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **UI**: Tailwind CSS（簡約黑白色系）
- **狀態管理**: Zustand
- **圖表**: Recharts

### 資料層
- **本地資料庫**: Dexie.js (IndexedDB 封裝)
- **後端**: Supabase (PostgreSQL + Auto REST API)
- **同步**: 自訂同步引擎

### PWA
- **套件**: @ducanh2912/next-pwa
- **功能**: 離線支援、可安裝

---

## 資料庫 Schema

### IndexedDB (Dexie.js)

```typescript
// workout_sets
{
  id: string (uuid)
  exercise_id: string
  weight: number
  reps: number
  unit: 'kg' | 'lb'
  created_at: Date
  synced: boolean
}

// exercises
{
  id: string
  name: string
  created_at: Date
}

// workout_plans
{
  id: string
  name: string
  created_at: Date
}

// plan_exercises
{
  id: string
  plan_id: string
  exercise_id: string
  order: number
}
```

### Supabase PostgreSQL
（結構與 IndexedDB 對應，用於同步）

---

## 實施階段

### ✅ 階段 1: 專案基礎建設
- [x] 初始化 Next.js 專案
- [x] 安裝核心依賴
- [ ] 建立資料夾結構
- [ ] 配置 PWA

**資料夾結構**:
```
app/
  ├── layout.tsx          # 根布局
  ├── page.tsx            # 首頁（訓練記錄）
  ├── plans/              # 訓練計劃
  ├── analytics/          # 分析頁面
  └── exercises/          # 運動管理
lib/
  ├── db/                 # Dexie 資料庫
  ├── store/              # Zustand stores
  ├── sync/               # 同步引擎
  └── utils/              # 工具函式
components/
  ├── WorkoutLogger/      # 訓練記錄組件
  ├── PRIndicator/        # PR 指示器
  ├── Charts/             # 圖表組件
  └── ui/                 # 基礎 UI 組件
```

---

### 階段 2: 本地資料層

#### Dexie.js 設定
- 定義 schema
- 建立 CRUD 封裝
- 預設運動項目種子資料

**預設運動項目**（常見健身動作）:
- 深蹲 (Squat)
- 臥推 (Bench Press)
- 硬舉 (Deadlift)
- 肩推 (Overhead Press)
- 划船 (Barbell Row)
- 引體向上 (Pull-up)
- 二頭彎舉 (Bicep Curl)
- 三頭下推 (Tricep Pushdown)

#### Zustand Store
- 當前訓練狀態
- 單位偏好設定（kg/lb）
- 離線/在線狀態

---

### 階段 3: 核心功能 - 訓練記錄 UI ⭐ 最高優先

**功能需求**:
1. 選擇運動（快速搜尋/最近使用）
2. 輸入重量和次數
3. 快速增量按鈕（+2.5kg, +5kg, +10kg）
4. 「重複上一組」按鈕
5. 顯示今日訓練歷史
6. 即時 UI 更新（無 loading）

**UX 要求**:
- 大觸控目標（min 44x44px）
- 單屏操作（避免跳頁）
- 數字鍵盤自動彈出
- 視覺回饋（成功動畫）

**實作重點**:
```typescript
// 樂觀更新流程
1. 用戶點擊「記錄」
2. 立即寫入 IndexedDB (synced=false)
3. 立即更新 UI（顯示新組數）
4. 背景觸發同步（非阻塞）
```

---

### 階段 4: PR 追蹤

**功能**:
- 計算每個運動的歷史最大重量
- 記錄時自動檢查是否破 PR
- 破 PR 時顯示慶祝指示器（如 🎉 New PR!）

**實作邏輯**:
```typescript
// 檢查 PR
const currentPR = await db.workout_sets
  .where('exercise_id').equals(exerciseId)
  .sortBy('weight')
  .reverse()[0]?.weight || 0

if (newWeight > currentPR) {
  showPRIndicator()
}
```

---

### 階段 5: 訓練計劃

**功能**:
1. 建立計劃（如「推日」、「拉日」）
2. 添加運動到計劃（可排序）
3. 「開始訓練」模式
   - 顯示計劃中的運動清單
   - 直接點擊運動進行記錄
   - 顯示該運動的上次數據

**UI 流程**:
```
計劃列表 → 選擇計劃 → 開始訓練 → 逐項記錄 → 完成
```

---

### 階段 6: 基礎分析

**圖表 1: 重量趨勢**
- X 軸：日期
- Y 軸：重量
- 顯示特定運動的歷史最大重量變化

**圖表 2: 訓練頻率**
- 顯示每週訓練次數
- 簡單柱狀圖

**實作**: 使用 Recharts 的 `LineChart` 和 `BarChart`

---

### 階段 7: 同步引擎

**同步策略**:
```typescript
// 定期同步（每 30 秒檢查一次）
setInterval(async () => {
  if (navigator.onLine) {
    const unsyncedSets = await db.workout_sets
      .where('synced').equals(false)
      .toArray()

    for (const set of unsyncedSets) {
      await supabase.from('workout_sets').insert(set)
      await db.workout_sets.update(set.id, { synced: true })
    }
  }
}, 30000)
```

**Supabase 設定**:
1. 建立資料表（與 IndexedDB schema 對應）
2. 設定 Row Level Security (RLS) - v1 不啟用認證，暫時允許匿名寫入
3. 取得 API URL 和 anon key

**處理衝突**:
- v1 簡化版：最後寫入勝出（Last Write Wins）
- 用 `created_at` 作為時間戳

---

### 階段 8: PWA 配置

**manifest.json**:
```json
{
  "name": "Gym Logger",
  "short_name": "GymLog",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [...]
}
```

**Service Worker**:
- 快取靜態資源
- 離線頁面支援
- 背景同步 API

**測試清單**:
- [ ] 可安裝到主畫面
- [ ] 離線狀態下可記錄
- [ ] 恢復網路後自動同步

---

### 階段 9: 部署

**Vercel 部署**:
```bash
npm run build
vercel deploy
```

**環境變數**:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

**性能檢查**:
- Lighthouse PWA 分數 > 90
- 記錄一組 < 2 秒

---

## 設計決策

### 1. 為何選擇 IndexedDB？
- ✅ 支援大量資料（數萬筆記錄）
- ✅ 完全離線可用
- ✅ 複雜查詢能力（比 localStorage 強）

### 2. 為何選擇 Zustand？
- ✅ 輕量（< 1KB）
- ✅ 無樣板代碼
- ✅ React 整合簡單

### 3. 為何選擇 Supabase？
- ✅ 無需自建後端
- ✅ 自動生成 REST API
- ✅ PostgreSQL 穩定可靠
- ✅ 未來易擴展認證功能

### 4. 同步策略
- **寫入**: 本地優先（立即回饋）
- **上傳**: 背景非阻塞
- **追蹤**: `synced` flag

---

## 資料流

```
用戶點擊「記錄」
    ↓
立即寫入 IndexedDB
    ↓
樂觀更新 UI（顯示新資料）
    ↓
標記 synced=false
    ↓
[背景非同步]
    ↓
同步引擎定期掃描
    ↓
上傳未同步資料到 Supabase
    ↓
成功後標記 synced=true
```

---

## UI/UX 原則

### 色彩
- 主色：黑 (#000000)
- 背景：白 (#FFFFFF)
- 邊框：灰 (#E5E5E5)
- 強調：深灰 (#333333)
- 成功：綠 (#22C55E)
- PR：金 (#F59E0B)

### 字體
- 標題：font-bold, text-2xl
- 數字：font-mono（等寬，易對齊）
- 按鈕：font-semibold

### 間距
- 觸控目標：最小 48px
- 按鈕間距：16px
- 卡片邊距：24px

---

## 開發優先順序

1. **第一優先**: 訓練記錄 UI（核心功能）
2. **第二優先**: PR 追蹤
3. **第三優先**: 同步引擎
4. **第四優先**: 訓練計劃
5. **第五優先**: 分析圖表

---

## 成功指標

- [ ] 記錄一組 < 2 秒
- [ ] 離線可用
- [ ] 可安裝 PWA
- [ ] 恢復網路後自動同步
- [ ] Lighthouse PWA > 90 分

---

## 未來擴展（v2+）

- 🔐 用戶認證
- 📊 進階分析（1RM 計算、volume tracking）
- 📷 動作影片記錄
- 🤝 社交功能（分享成績）
- ⏱️ 組間休息計時器
- 📈 進度照片

---

## 參考資料

- Next.js 文件: https://nextjs.org/docs
- Dexie.js: https://dexie.org
- Supabase: https://supabase.com/docs
- PWA: https://web.dev/progressive-web-apps/

---

**建立日期**: 2026-05-02
**預計完成**: MVP 1-2 週
