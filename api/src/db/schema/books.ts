import { pgTable, uuid, varchar, text, integer, timestamp, index, customType } from 'drizzle-orm/pg-core'
import { users } from './users.js'

// * Custom vector type for pgvector (1536 dimensions for OpenAI embeddings)
// * Note: The actual vector type will be created via SQL migration
// * This is a placeholder that stores as text and converts
const vector = customType<{ data: number[]; driverData: string }>({
	dataType: () => 'vector(1536)',
	toDriver: (value: number[]) => `[${value.join(',')}]`,
	fromDriver: (value: string) => {
		if (typeof value === 'string') {
			return value
				.replace(/[\[\]]/g, '')
				.split(',')
				.map((v) => parseFloat(v.trim()))
				.filter((v) => !isNaN(v))
		}
		return []
	}
})

// * Books table with vector embedding field
export const books = pgTable(
	'books',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: varchar('title', { length: 255 }).notNull(),
		author: varchar('author', { length: 255 }).notNull(),
		description: text('description'),
		isbn: varchar('isbn', { length: 50 }),
		category: varchar('category', { length: 100 }),
		coverImageUrl: text('cover_image_url'), // * R2 URL
		fileUrl: text('file_url').notNull(), // * R2 URL
		fileSize: integer('file_size'), // * Size in bytes
		fileType: varchar('file_type', { length: 20 }), // * pdf, epub, docx
		downloadCount: integer('download_count').notNull().default(0),
		// * Vector embedding for semantic search (1536 dimensions for OpenAI, 768 for some others)
		embedding: vector('embedding', { dimensions: 1536 }),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		// * Indexes for search optimization
		titleIdx: index('books_title_idx').on(table.title),
		authorIdx: index('books_author_idx').on(table.author),
		categoryIdx: index('books_category_idx').on(table.category),
		// * Vector index will be created via migration SQL (HNSW)
		// * Note: Drizzle doesn't support HNSW index syntax directly, create via migration
		embeddingIdx: index('books_embedding_idx').on(table.embedding)
	})
)

// * Export types
export type Book = typeof books.$inferSelect
export type NewBook = typeof books.$inferInsert
