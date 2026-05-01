# 健身房地圖功能計劃

## 概念

用格線地圖代替下拉選單選擇運動，點擊器材方塊直接進入記錄。

## 使用流程

```
平常使用：
點地圖上的器材方塊 → 自動選好運動 → 進入重量/次數輸入

編輯模式：
點「編輯」→ 選擇器材名稱 → 點格子放置 → 點已放置的器材可移除 → 儲存
```

---

## 資料模型

新增 `gym_equipment` 資料表：

```typescript
{
  id: string
  name: string       // 顯示在方塊上的名稱（例如：深蹲架）
  exercise_id: string // 對應的運動
  grid_x: number     // 格子 X 座標
  grid_y: number     // 格子 Y 座標
}
```

### IndexedDB
新增 `gym_equipment` table

### Supabase SQL
```sql
CREATE TABLE IF NOT EXISTS gym_equipment (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE POLICY "Allow all" ON gym_equipment FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE gym_equipment ENABLE ROW LEVEL SECURITY;
```

---

## UI 設計

### 地圖規格
- 格線大小：10 x 8（可橫向捲動）
- 每格大小：64px x 64px
- 器材方塊：佔 1 格，深色背景 + 白字

### 兩種模式

**瀏覽模式（預設）**
- 已放置的器材顯示為深色方塊 + 名稱
- 空格子顯示為暗色格線
- 點器材方塊 → 選中該運動 → 跳回記錄頁

**編輯模式**
- 右上角「編輯」按鈕切換
- 頂部出現器材選擇列（從現有 exercises 選）
- 點空格子 → 放置選中的器材
- 點已放置的器材 → 移除
- 「完成」按鈕儲存並切回瀏覽模式

---

## 檔案異動清單

| 檔案 | 動作 |
|------|------|
| `app/map/page.tsx` | 新增（地圖頁面） |
| `components/GymMap/GymMap.tsx` | 新增（地圖主元件） |
| `components/GymMap/MapGrid.tsx` | 新增（格線渲染） |
| `components/GymMap/EquipmentBlock.tsx` | 新增（器材方塊） |
| `lib/db/index.ts` | 修改（加 gym_equipment table） |
| `lib/db/operations.ts` | 修改（加 CRUD） |
| `lib/db/types.ts` | 修改（加 GymEquipment type） |
| `lib/sync/sync-engine.ts` | 修改（同步 gym_equipment） |
| `app/page.tsx` | 修改（nav 加地圖入口） |

---

## 實作順序

1. 資料層（types、db、operations）
2. Supabase schema 更新
3. MapGrid 格線元件
4. EquipmentBlock 器材方塊
5. GymMap 主元件（含兩種模式）
6. 地圖頁面 + nav 入口
7. 同步引擎加入 gym_equipment
