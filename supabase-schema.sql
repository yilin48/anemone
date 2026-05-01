-- Gym Logger Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
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

-- Insert default exercises (optional)
INSERT INTO exercises (id, name, created_at) VALUES
  (uuid_generate_v4(), '深蹲 (Squat)', NOW()),
  (uuid_generate_v4(), '臥推 (Bench Press)', NOW()),
  (uuid_generate_v4(), '硬舉 (Deadlift)', NOW()),
  (uuid_generate_v4(), '肩推 (Overhead Press)', NOW()),
  (uuid_generate_v4(), '槓鈴划船 (Barbell Row)', NOW()),
  (uuid_generate_v4(), '引體向上 (Pull-up)', NOW()),
  (uuid_generate_v4(), '二頭彎舉 (Bicep Curl)', NOW()),
  (uuid_generate_v4(), '三頭下推 (Tricep Pushdown)', NOW()),
  (uuid_generate_v4(), '腿推 (Leg Press)', NOW()),
  (uuid_generate_v4(), '啞鈴飛鳥 (Dumbbell Fly)', NOW())
ON CONFLICT (id) DO NOTHING;

-- Show tables
SELECT 'Schema created successfully!' as status;
