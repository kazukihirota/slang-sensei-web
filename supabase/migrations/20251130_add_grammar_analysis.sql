-- Add grammar analysis support to existing tables
-- This migration extends explanation_cache and search_history tables
-- to support both slang and grammar analysis types

-- Add analysis_type column to explanation_cache
ALTER TABLE explanation_cache
ADD COLUMN analysis_type TEXT DEFAULT 'slang'
CHECK (analysis_type IN ('slang', 'grammar'));

-- Create index for faster queries by analysis type
CREATE INDEX idx_explanation_cache_analysis_type
ON explanation_cache(analysis_type);

-- Add search_type column to search_history
ALTER TABLE search_history
ADD COLUMN search_type TEXT DEFAULT 'slang'
CHECK (search_type IN ('slang', 'grammar'));

-- Create index for faster queries by search type
CREATE INDEX idx_search_history_search_type
ON search_history(search_type);

-- Backfill existing data (ensure all existing rows are marked as 'slang')
UPDATE explanation_cache SET analysis_type = 'slang' WHERE analysis_type IS NULL;
UPDATE search_history SET search_type = 'slang' WHERE search_type IS NULL;
