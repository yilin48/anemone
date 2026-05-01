# 用戶認證實施計劃

## 背景

目前 RLS 完全開放匿名存取，任何人拿到 anon key 都能寫入資料。
加入 Supabase Auth 後，每筆資料綁定用戶，RLS 只允許本人讀寫。

## 目標

- 只有登入用戶才能讀寫資料
- 每個用戶只能看到自己的資料
- 支援帳號密碼登入（email + password）

---

## 技術方案

### 登入方式
**帳號密碼（Email + Password）**

### 套件
- `@supabase/supabase-js`（已安裝）
- `@supabase/ssr`（處理 Next.js App Router 的 session）

---

## 實施步驟

### 步驟 1：Supabase 設定

**1-1. 開啟 Email Auth**
- Supabase → Authentication → Providers → Email → 啟用
- 關閉「Confirm email」（個人 app 不需要信箱驗證流程）

**1-2. 修改資料庫 Schema**

在 SQL Editor 執行：

```sql
-- 在 workout_sets 加入 user_id 欄位
ALTER TABLE workout_sets ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE exercises ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 更新 RLS 政策：只允許本人讀寫
DROP POLICY "Allow all" ON workout_sets;
DROP POLICY "Allow all" ON exercises;

CREATE POLICY "Own data only" ON workout_sets
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own data only" ON exercises
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

### 步驟 2：前端 - Auth 頁面

建立 `app/login/page.tsx`：
- 輸入 email + 密碼
- 登入按鈕 → `supabase.auth.signInWithPassword()`
- 錯誤處理（帳號不存在、密碼錯誤）
- 導向首頁

---

### 步驟 3：前端 - Session 管理

**3-1. 安裝 SSR 套件**
```bash
npm install @supabase/ssr
```

**3-2. 建立 Supabase Client（Browser）**
`lib/supabase/client.ts`

**3-3. 建立 Middleware**
`middleware.ts` — 攔截每個請求，檢查 session，未登入導向 `/login`

---

### 步驟 4：資料同步加入 user_id

修改 `lib/sync/sync-engine.ts`：
- 同步前取得目前登入用戶的 `user_id`
- 每筆 `exercises` 和 `workout_sets` 寫入時帶上 `user_id`

---

### 步驟 5：UI 調整

- Header 加入登出按鈕
- 未登入時顯示登入頁，已登入才顯示 app

---

## 檔案異動清單

| 檔案 | 動作 |
|------|------|
| `app/login/page.tsx` | 新增 |
| `middleware.ts` | 新增 |
| `lib/supabase/client.ts` | 新增 |
| `lib/sync/sync-engine.ts` | 修改（加 user_id） |
| `app/layout.tsx` | 修改（加登出按鈕） |
| `supabase-schema.sql` | 修改（加 user_id、更新 RLS） |

---

## 資料流

```
用戶輸入 email + 密碼
    ↓
signInWithPassword()
    ↓
Session 建立，導向首頁
    ↓
Middleware 每次請求驗證 session
    ↓
同步時帶上 auth.uid() 作為 user_id
    ↓
RLS 確保只能讀寫自己的資料
```

---

## 注意事項

- 現有本地 IndexedDB 資料不會自動綁定 user_id，需要處理遷移
- 部署後需在 Supabase → Authentication → URL Configuration 設定正確的 redirect URL（Vercel 網址）
- 因為只有自己用，直接在 Supabase Dashboard 手動建立帳號即可，不需要做註冊頁面
