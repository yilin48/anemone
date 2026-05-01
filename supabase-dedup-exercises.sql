-- One-time migration: deduplicate exercises and add UNIQUE(name)
-- Run this in Supabase SQL Editor BEFORE re-applying supabase-schema.sql
--
-- Strategy: for each duplicate name, keep the exercise with the most
-- workout_set references (most "used"). All FK references are updated
-- to the surviving row before duplicates are deleted.

BEGIN;

-- 1. For each duplicate name, find the "winner" (most workout_sets, then oldest)
CREATE TEMP TABLE exercise_winners AS
SELECT DISTINCT ON (name)
  id AS winner_id,
  name
FROM exercises
ORDER BY
  name,
  (SELECT COUNT(*) FROM workout_sets WHERE exercise_id = exercises.id) DESC,
  created_at ASC;

-- 2. For every duplicate, remap FKs to the winner

UPDATE workout_sets ws
SET exercise_id = w.winner_id
FROM exercises ex
JOIN exercise_winners w ON ex.name = w.name
WHERE ws.exercise_id = ex.id
  AND ex.id <> w.winner_id;

UPDATE plan_exercises pe
SET exercise_id = w.winner_id
FROM exercises ex
JOIN exercise_winners w ON ex.name = w.name
WHERE pe.exercise_id = ex.id
  AND ex.id <> w.winner_id;

UPDATE gym_equipment ge
SET exercise_id = w.winner_id
FROM exercises ex
JOIN exercise_winners w ON ex.name = w.name
WHERE ge.exercise_id = ex.id
  AND ex.id <> w.winner_id;

-- 3. Delete duplicates (non-winners)
DELETE FROM exercises
WHERE id NOT IN (SELECT winner_id FROM exercise_winners);

-- 4. Add unique constraint
ALTER TABLE exercises ADD CONSTRAINT exercises_name_unique UNIQUE (name);

COMMIT;

-- Verify
SELECT name, COUNT(*) FROM exercises GROUP BY name HAVING COUNT(*) > 1;
-- Should return 0 rows
