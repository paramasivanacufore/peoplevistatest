-- Migration: Add status_id, created_at, updated_at to positions table
-- Run this against your MySQL database manually or via your migration tooling.

-- Add columns if they do not exist
ALTER TABLE positions
  ADD COLUMN IF NOT EXISTS status_id INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Ensure existing rows have status_id set to 1
UPDATE positions SET status_id = 1 WHERE status_id IS NULL;

-- If you want to backfill created_at/updated_at for existing rows to now:
UPDATE positions SET created_at = COALESCE(created_at, NOW()), updated_at = COALESCE(updated_at, NOW());

-- Optional: verify structure
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'positions'
ORDER BY ORDINAL_POSITION;
