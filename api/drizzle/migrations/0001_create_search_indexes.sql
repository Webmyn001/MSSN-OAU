-- * Create advanced search indexes using pg_trgm and pgvector
-- * This migration should be run after all tables are created

-- * GIN indexes for fuzzy text search using pg_trgm
-- * Books table
CREATE INDEX IF NOT EXISTS books_title_trgm_idx ON books USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS books_author_trgm_idx ON books USING gin (author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS books_description_trgm_idx ON books USING gin (description gin_trgm_ops);

-- * Articles table
CREATE INDEX IF NOT EXISTS articles_title_trgm_idx ON article USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS articles_content_trgm_idx ON article USING gin (content gin_trgm_ops);

-- * HNSW index for vector similarity search using pgvector
-- * Books embedding index (for semantic search)
CREATE INDEX IF NOT EXISTS books_embedding_hnsw_idx ON books 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- * Note: These indexes will be created automatically by Drizzle when generating migrations
-- * This file serves as a reference for manual index creation if needed
