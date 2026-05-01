# 🚀 部署指南

## 部署到 Vercel（推薦）

### 步驟 1: 準備 Supabase

1. 前往 [Supabase](https://supabase.com) 註冊並建立新專案
2. 在專案設定中找到：
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon/public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. 進入 SQL Editor，執行 `supabase-schema.sql` 中的所有 SQL 語句

### 步驟 2: 推送到 GitHub

```bash
# 初始化 git（如果還沒有）
git init

# 加入所有檔案
git add .

# 提交
git commit -m "Initial commit: Gym Logger PWA"

# 連結到你的 GitHub repository
git remote add origin https://github.com/your-username/your-repo.git

# 推送
git push -u origin main
```

### 步驟 3: 部署到 Vercel

1. 前往 [Vercel](https://vercel.com) 並登入
2. 點擊「Add New Project」
3. 從 GitHub 匯入你的 repository
4. 設定環境變數：
   - `NEXT_PUBLIC_SUPABASE_URL`: 你的 Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 你的 Supabase anon key
5. 點擊「Deploy」

### 步驟 4: 驗證部署

部署完成後：
1. 訪問你的 Vercel URL
2. 測試記錄一組訓練
3. 在手機上開啟網站並測試「安裝」功能

---

## 部署到其他平台

### Netlify

1. 建置指令：`npm run build`
2. 輸出目錄：`.next`
3. 環境變數設定同 Vercel

### 自架伺服器

```bash
# 建置
npm run build

# 啟動（需要 Node.js 環境）
npm start
```

或使用 PM2：

```bash
npm install -g pm2
pm2 start npm --name "gym-logger" -- start
pm2 save
```

---

## PWA 安裝說明

### iOS (Safari)

1. 在 Safari 中開啟網站
2. 點擊分享按鈕（向上箭頭）
3. 選擇「加入主畫面」
4. 命名並確認

### Android (Chrome)

1. 在 Chrome 中開啟網站
2. 點擊右上角選單（⋮）
3. 選擇「安裝應用程式」或「加到主畫面」
4. 確認安裝

---

## 環境變數

### 必要變數

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 專案 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名金鑰

### 本地開發

在專案根目錄建立 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 驗證清單

部署後請檢查：

- [ ] 網站可正常訪問
- [ ] 可以選擇運動
- [ ] 可以記錄訓練組數
- [ ] 記錄會顯示在「今日訓練」中
- [ ] 數據會同步到 Supabase
- [ ] PWA 可以安裝到主畫面
- [ ] 離線狀態下仍可記錄（會在恢復網路後同步）
- [ ] 分析頁面圖表正常顯示

---

## 故障排除

### 建置失敗

```bash
# 清除快取並重新安裝依賴
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Supabase 連線失敗

1. 檢查環境變數是否正確設定
2. 確認 Supabase 專案處於啟用狀態
3. 檢查瀏覽器 Console 的錯誤訊息

### PWA 無法安裝

1. 確認網站使用 HTTPS（Vercel 自動提供）
2. 檢查 `manifest.json` 是否可存取
3. 確認 Service Worker 已註冊（開發者工具 → Application → Service Workers）

---

## 效能最佳化建議

1. **圖片最佳化**：使用 Next.js Image 組件
2. **程式碼分割**：已自動啟用
3. **快取策略**：Service Worker 已配置
4. **CDN**：Vercel 自動提供全球 CDN

---

## 安全性注意事項

⚠️ **重要**：當前版本允許匿名存取

建議在生產環境實作：
1. Supabase 身份驗證
2. Row Level Security (RLS) 政策
3. API Rate Limiting
4. 資料加密

---

## 更新部署

```bash
# 推送更新
git add .
git commit -m "Update: description"
git push

# Vercel 會自動重新部署
```

---

## 監控與分析

### Vercel Analytics

在專案設定中啟用 Vercel Analytics 以追蹤：
- 頁面瀏覽量
- 效能指標
- Web Vitals

### Supabase Logs

在 Supabase Dashboard 查看：
- API 請求
- 資料庫查詢
- 錯誤日誌

---

**祝部署順利！** 🚀
