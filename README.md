# 💪 Gym Logger - 健身訓練記錄 PWA

快速、離線優先的健身訓練記錄應用程式。

## ✨ 特色功能

- ⚡ **極速記錄**：2 秒內完成一組訓練記錄
- 📴 **完全離線**：使用 IndexedDB，健身房無網路也能用
- 📱 **手機優先**：專為單手操作設計
- 💾 **自動同步**：恢復網路後自動同步到雲端
- 🏆 **PR 追蹤**：自動偵測並慶祝新紀錄
- 📊 **數據分析**：視覺化你的訓練進度

## 🛠️ 技術棧

- **前端框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **狀態管理**: Zustand
- **本地資料庫**: Dexie.js (IndexedDB)
- **後端**: Supabase (PostgreSQL)
- **圖表**: Recharts
- **PWA**: @ducanh2912/next-pwa

## 📋 前置需求

- Node.js 18+
- npm 或 yarn
- Supabase 帳號（用於資料同步）

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env.local`：

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入你的 Supabase 憑證：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 設定 Supabase 資料庫

1. 登入 [Supabase](https://supabase.com)
2. 建立新專案
3. 進入 SQL Editor
4. 執行 `supabase-schema.sql` 中的 SQL 腳本

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

## 📁 專案結構

```
anemone/
├── app/                    # Next.js App Router 頁面
│   ├── page.tsx           # 首頁（訓練記錄）
│   ├── plans/             # 訓練計劃
│   ├── analytics/         # 數據分析
│   └── offline/           # 離線頁面
├── components/            # React 組件
│   ├── WorkoutLogger/     # 訓練記錄核心組件
│   ├── PRIndicator/       # PR 指示器
│   └── ui/                # 基礎 UI 組件
├── lib/
│   ├── db/                # Dexie.js 資料庫層
│   ├── store/             # Zustand 狀態管理
│   ├── sync/              # 同步引擎
│   └── utils/             # 工具函式
├── public/
│   └── manifest.json      # PWA manifest
└── supabase-schema.sql    # 資料庫 schema
```

## 🎯 核心功能使用

### 訓練記錄

1. 點擊「選擇運動」
2. 搜尋或選擇運動項目
3. 輸入重量和次數
4. 使用快速增量按鈕（+2.5kg, +5kg, +10kg）
5. 點擊「記錄」完成

**快捷功能**：
- 「重複上一組」按鈕：快速載入上次的重量和次數
- 單位切換：點擊 kg/lb 按鈕切換單位

### PR 追蹤

當你打破個人記錄時，系統會自動顯示慶祝動畫 🏆

## 📦 部署到 Vercel

### 1. 推送到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. 部署到 Vercel

1. 登入 [Vercel](https://vercel.com)
2. 點擊「Import Project」
3. 選擇你的 GitHub repository
4. 設定環境變數：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 點擊「Deploy」

### 3. PWA 安裝

部署後，在手機瀏覽器開啟網站：
- iOS Safari：點擊「分享」→「加入主畫面」
- Android Chrome：點擊「⋮」→「安裝應用程式」

## 🔧 開發指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm start
```

## 🔄 同步機制

- 立即寫入本地 IndexedDB
- 背景自動同步到 Supabase
- 每 30 秒自動檢查
- 網路恢復時立即觸發

## 🐛 故障排除

### 資料沒有同步

1. 檢查環境變數設定
2. 確認 Supabase 專案運作正常
3. 查看瀏覽器 console

### PWA 無法安裝

1. 確認使用 HTTPS
2. 檢查 service worker 狀態
3. 查看 manifest.json

## 📄 詳細文件

查看 [PLAN.md](./PLAN.md) 了解完整開發計劃和架構說明。

---

**版本**: 1.0.0 MVP
**建立日期**: 2026-05-02
