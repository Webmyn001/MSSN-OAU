-- * Enable PostgreSQL extensions for search functionality
-- * This migration should be run before creating tables that use these extensions

-- * Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- * Enable pgvector for semantic/vector search
CREATE EXTENSION IF NOT EXISTS vector;
