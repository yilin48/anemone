-- Gym Logger Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  equipment_type TEXT CHECK (equipment_type IN ('槓鈴', '啞鈴', '纜繩', '機械')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workout sets table
CREATE TABLE IF NOT EXISTS workout_sets (
  id UUID PRIMARY KEY,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  reps INTEGER NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'lb')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced BOOLEAN NOT NULL DEFAULT true
);

-- Workout plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plan exercises table (junction table)
CREATE TABLE IF NOT EXISTS plan_exercises (
  id UUID PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  UNIQUE(plan_id, exercise_id)
);

-- Gym equipment table
CREATE TABLE IF NOT EXISTS gym_equipment (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_id ON workout_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_created_at ON workout_sets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_synced ON workout_sets(synced);
CREATE INDEX IF NOT EXISTS idx_plan_exercises_plan_id ON plan_exercises(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_exercises_order ON plan_exercises(plan_id, "order");

-- Enable Row Level Security (RLS)
-- Note: For MVP v1, we're allowing anonymous access
-- In production, you should implement proper authentication

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_equipment ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (v1 only)
-- WARNING: This allows anyone to read/write data. Use only for testing!

CREATE POLICY "Allow anonymous read exercises" ON exercises
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert exercises" ON exercises
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read workout_sets" ON workout_sets
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert workout_sets" ON workout_sets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update workout_sets" ON workout_sets
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read workout_plans" ON workout_plans
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert workout_plans" ON workout_plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read plan_exercises" ON plan_exercises
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert plan_exercises" ON plan_exercises
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all" ON gym_equipment FOR ALL USING (true) WITH CHECK (true);

-- Insert default exercises
INSERT INTO exercises (id, name, tags, equipment_type, created_at) VALUES
  -- 胸
  (uuid_generate_v4(), '臥推',           ARRAY['胸'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '上斜臥推',       ARRAY['胸'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '下斜臥推',       ARRAY['胸'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '啞鈴臥推',       ARRAY['胸'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '上斜啞鈴臥推',   ARRAY['胸'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '啞鈴飛鳥',       ARRAY['胸'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '上斜啞鈴飛鳥',   ARRAY['胸'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '繩索飛鳥',       ARRAY['胸'],         '纜繩', NOW()),
  (uuid_generate_v4(), '繩索上斜飛鳥',   ARRAY['胸'],         '纜繩', NOW()),
  (uuid_generate_v4(), '繩索下斜飛鳥',   ARRAY['胸'],         '纜繩', NOW()),
  (uuid_generate_v4(), '蝴蝶機夾胸',     ARRAY['胸'],         '機械', NOW()),
  (uuid_generate_v4(), '機械臥推',       ARRAY['胸'],         '機械', NOW()),
  (uuid_generate_v4(), '伏地挺身',       ARRAY['胸'],         NULL,   NOW()),
  -- 背
  (uuid_generate_v4(), '硬舉',           ARRAY['背','腿'],    '槓鈴', NOW()),
  (uuid_generate_v4(), '羅馬尼亞硬舉',   ARRAY['背','腿'],    '槓鈴', NOW()),
  (uuid_generate_v4(), '槓鈴划船',       ARRAY['背'],         '槓鈴', NOW()),
  (uuid_generate_v4(), 'T槓划船',        ARRAY['背'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '啞鈴划船',       ARRAY['背'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '滑輪下拉',       ARRAY['背'],         '纜繩', NOW()),
  (uuid_generate_v4(), '坐姿划船',       ARRAY['背'],         '纜繩', NOW()),
  (uuid_generate_v4(), '直臂下壓',       ARRAY['背'],         '纜繩', NOW()),
  (uuid_generate_v4(), '面拉',           ARRAY['背','肩'],    '纜繩', NOW()),
  (uuid_generate_v4(), '機械划船',       ARRAY['背'],         '機械', NOW()),
  (uuid_generate_v4(), '引體向上',       ARRAY['背'],         NULL,   NOW()),
  (uuid_generate_v4(), '反手引體向上',   ARRAY['背'],         NULL,   NOW()),
  -- 腿
  (uuid_generate_v4(), '深蹲',           ARRAY['腿'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '前蹲舉',         ARRAY['腿'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '羅馬尼亞單腿硬舉', ARRAY['腿'],       '槓鈴', NOW()),
  (uuid_generate_v4(), '臀推',           ARRAY['腿'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '啞鈴弓步',       ARRAY['腿'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '啞鈴深蹲',       ARRAY['腿'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '保加利亞分腿蹲', ARRAY['腿'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '腿推',           ARRAY['腿'],         '機械', NOW()),
  (uuid_generate_v4(), '腿伸展',         ARRAY['腿'],         '機械', NOW()),
  (uuid_generate_v4(), '腿彎舉',         ARRAY['腿'],         '機械', NOW()),
  (uuid_generate_v4(), '坐姿小腿提踵',   ARRAY['腿'],         '機械', NOW()),
  (uuid_generate_v4(), '站姿小腿提踵',   ARRAY['腿'],         '機械', NOW()),
  (uuid_generate_v4(), '深蹲機',         ARRAY['腿'],         '機械', NOW()),
  -- 肩
  (uuid_generate_v4(), '槓鈴肩推',       ARRAY['肩'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '直立划船',       ARRAY['肩'],         '槓鈴', NOW()),
  (uuid_generate_v4(), '啞鈴肩推',       ARRAY['肩'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '啞鈴側平舉',     ARRAY['肩'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '啞鈴前平舉',     ARRAY['肩'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '俯身啞鈴飛鳥',   ARRAY['肩'],         '啞鈴', NOW()),
  (uuid_generate_v4(), '繩索側平舉',     ARRAY['肩'],         '纜繩', NOW()),
  (uuid_generate_v4(), '繩索前平舉',     ARRAY['肩'],         '纜繩', NOW()),
  (uuid_generate_v4(), '機械肩推',       ARRAY['肩'],         '機械', NOW()),
  (uuid_generate_v4(), '機械側平舉',     ARRAY['肩'],         '機械', NOW()),
  -- 手臂
  (uuid_generate_v4(), 'EZ槓彎舉',       ARRAY['手臂'],       '槓鈴', NOW()),
  (uuid_generate_v4(), '槓鈴二頭彎舉',   ARRAY['手臂'],       '槓鈴', NOW()),
  (uuid_generate_v4(), '槓鈴三頭伸展',   ARRAY['手臂'],       '槓鈴', NOW()),
  (uuid_generate_v4(), '窄距臥推',       ARRAY['手臂','胸'],  '槓鈴', NOW()),
  (uuid_generate_v4(), '啞鈴二頭彎舉',   ARRAY['手臂'],       '啞鈴', NOW()),
  (uuid_generate_v4(), '錘式彎舉',       ARRAY['手臂'],       '啞鈴', NOW()),
  (uuid_generate_v4(), '集中彎舉',       ARRAY['手臂'],       '啞鈴', NOW()),
  (uuid_generate_v4(), '啞鈴三頭伸展',   ARRAY['手臂'],       '啞鈴', NOW()),
  (uuid_generate_v4(), '三頭下推',       ARRAY['手臂'],       '纜繩', NOW()),
  (uuid_generate_v4(), '繩索二頭彎舉',   ARRAY['手臂'],       '纜繩', NOW()),
  (uuid_generate_v4(), '繩索錘式彎舉',   ARRAY['手臂'],       '纜繩', NOW()),
  (uuid_generate_v4(), '繩索三頭伸展',   ARRAY['手臂'],       '纜繩', NOW()),
  (uuid_generate_v4(), '牧師椅彎舉',     ARRAY['手臂'],       '機械', NOW()),
  (uuid_generate_v4(), '機械三頭伸展',   ARRAY['手臂'],       '機械', NOW()),
  (uuid_generate_v4(), '雙槓撐體',       ARRAY['手臂','胸'],  NULL,   NOW()),
  -- 核心
  (uuid_generate_v4(), '捲腹',           ARRAY['核心'],       NULL,   NOW()),
  (uuid_generate_v4(), '反向捲腹',       ARRAY['核心'],       NULL,   NOW()),
  (uuid_generate_v4(), '平板支撐',       ARRAY['核心'],       NULL,   NOW()),
  (uuid_generate_v4(), '側棒式',         ARRAY['核心'],       NULL,   NOW()),
  (uuid_generate_v4(), '懸掛抬腿',       ARRAY['核心'],       NULL,   NOW()),
  (uuid_generate_v4(), '俄羅斯轉體',     ARRAY['核心'],       '啞鈴', NOW()),
  (uuid_generate_v4(), '繩索捲腹',       ARRAY['核心'],       '纜繩', NOW()),
  (uuid_generate_v4(), '腹肌機',         ARRAY['核心'],       '機械', NOW())
ON CONFLICT (id) DO NOTHING;

-- Show tables
SELECT 'Schema created successfully!' as status;
