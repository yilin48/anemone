# ⚡ 快速啟動指南

5 分鐘內啟動 Gym Logger！

## 步驟 1: 安裝依賴

```bash
npm install
```

## 步驟 2: 啟動開發伺服器（本地測試）

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

**此時可以完全離線使用**，所有資料儲存在瀏覽器的 IndexedDB 中。

---

## 步驟 3: 設定 Supabase（選用，用於雲端同步）

### 3.1 建立 Supabase 專案

1. 前往 https://supabase.com
2. 註冊/登入
3. 點擊「New Project」
4. 填寫專案名稱、密碼、區域
5. 等待專案建立完成（約 2 分鐘）

### 3.2 執行 SQL Schema

1. 在 Supabase Dashboard 左側選單點擊「SQL Editor」
2. 點擊「New Query」
3. 複製 `supabase-schema.sql` 的全部內容
4. 貼上並點擊「Run」

### 3.3 取得 API 憑證

1. 點擊左側選單的「Project Settings」（齒輪圖示）
2. 選擇「API」
3. 複製以下兩個值：
   - `Project URL`
   - `anon public` key

### 3.4 設定環境變數

建立 `.env.local` 檔案：

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入剛才複製的值：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的專案id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon金鑰
```

### 3.5 重啟開發伺服器

```bash
# Ctrl+C 停止伺服器
npm run dev
```

現在資料會自動同步到 Supabase！

---

## 測試功能

### 1. 記錄訓練

1. 點擊「選擇運動」
2. 選擇「臥推 (Bench Press)」
3. 輸入重量：60
4. 輸入次數：10
5. 點擊「記錄」

### 2. 查看數據

1. 點擊頂部導航的「分析」
2. 查看訓練頻率圖表
3. 選擇不同運動查看重量趨勢

### 3. 測試離線功能

1. 開啟瀏覽器開發者工具（F12）
2. 切換到「Network」分頁
3. 選擇「Offline」模式
4. 嘗試記錄訓練 → 仍然可以正常記錄！
5. 切換回「Online」→ 資料會自動同步

---

## 常見問題

### Q: 不設定 Supabase 可以用嗎？

**A:** 可以！所有功能都能正常使用，資料儲存在本地。但缺點是：
- 無法在多個裝置間同步
- 清除瀏覽器資料會遺失所有記錄
- 無法備份

### Q: 如何在手機上使用？

**A:**
1. 部署到 Vercel（見 DEPLOYMENT.md）
2. 在手機瀏覽器開啟部署後的網址
3. 安裝 PWA 到主畫面
4. 像 App 一樣使用！

### Q: 資料儲存在哪裡？

**A:**
- **本地**：瀏覽器的 IndexedDB（每個瀏覽器獨立）
- **雲端**：Supabase PostgreSQL（如果有設定）

### Q: 如何匯出資料？

**A:** 目前版本尚未支援匯出功能。如果需要，可以：
1. 從 Supabase Dashboard 直接匯出 SQL
2. 或在瀏覽器 Console 執行：
   ```javascript
   // 匯出所有訓練記錄
   const db = await window.indexedDB.open('GymLoggerDB')
   // 然後使用開發者工具查看資料
   ```

---

## 下一步

- 📖 閱讀 [README.md](./README.md) 了解完整功能
- 📋 查看 [PLAN.md](./PLAN.md) 了解架構設計
- 🚀 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 學習部署

---

**開始健身，記錄進步！** 💪
