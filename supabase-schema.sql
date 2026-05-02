-- Gym Logger Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
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

-- Gym zones table
CREATE TABLE IF NOT EXISTS gym_zones (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  cols INTEGER NOT NULL DEFAULT 6,
  rows INTEGER NOT NULL DEFAULT 5,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gym equipment table
CREATE TABLE IF NOT EXISTS gym_equipment (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  zone_id UUID NOT NULL REFERENCES gym_zones(id) ON DELETE CASCADE,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Equipment-exercise junction table (one machine can have multiple exercises)
CREATE TABLE IF NOT EXISTS gym_equipment_exercises (
  id UUID PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES gym_equipment(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  UNIQUE(equipment_id, exercise_id)
);

-- Gym walkways table
CREATE TABLE IF NOT EXISTS gym_walkways (
  id UUID PRIMARY KEY,
  zone_id UUID NOT NULL REFERENCES gym_zones(id) ON DELETE CASCADE,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(zone_id, grid_x, grid_y)
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

ALTER TABLE gym_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON gym_zones FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all" ON gym_equipment FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE gym_equipment_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON gym_equipment_exercises FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE gym_walkways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON gym_walkways FOR ALL USING (true) WITH CHECK (true);

-- Show tables
SELECT 'Schema created successfully!' as status;
