import { and, asc, count, eq, inArray } from 'drizzle-orm'
import { db } from '../../lib/db'
import { alMamharahPlacementQuestions } from '../../db/schema'
import { NotFoundError, ValidationError } from '../../lib/errors'
import {
	QUIZ_BANK,
	QUIZ_LENGTH,
	gradeQuizFromBank,
	sampleQuizFromBank,
	type QuizAnswer,
	type QuizGrade,
	type QuizQuestion
} from './tajweed'

// * Manager-editable placement question bank. The shipped questions are
// * seeded from QUIZ_BANK the first time the table is read.

export type PlacementQuestionTrack = 'TUHFATUL_ATFAL' | 'JAZARIYYAH'

export interface PlacementQuestion extends QuizQuestion {
	track: PlacementQuestionTrack
	active: boolean
	updatedBy: string | null
	createdAt: Date
	updatedAt: Date
}

export interface PlacementQuestionInput {
	question: string
	options: string[]
	answer: number
	active?: boolean
}

function toRecord(row: typeof alMamharahPlacementQuestions.$inferSelect): PlacementQuestion {
	return {
		id: row.id,
		track: row.track as PlacementQuestionTrack,
		question: row.question,
		options: row.options,
		answer: row.answer,
		active: row.active,
		updatedBy: row.updatedBy,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	}
}

let seedPromise: Promise<void> | null = null

async function seedQuestionBank(): Promise<void> {
	const [row] = await db.select({ total: count() }).from(alMamharahPlacementQuestions)
	if (Number(row?.total ?? 0) > 0) return

	const values = (['TUHFATUL_ATFAL', 'JAZARIYYAH'] as const).flatMap(track =>
		QUIZ_BANK[track].map(question => ({
			id: question.id,
			track,
			question: question.question,
			options: question.options,
			answer: question.answer,
			active: true
		}))
	)
	if (values.length === 0) return
	await db.insert(alMamharahPlacementQuestions).values(values).onConflictDoNothing()
}

async function ensureSeeded(): Promise<void> {
	if (!seedPromise) {
		seedPromise = seedQuestionBank().catch(error => {
			seedPromise = null
			throw error
		})
	}
	return seedPromise
}

/** Manager view: every question, including inactive ones. */
export async function listPlacementQuestions(
	track?: PlacementQuestionTrack
): Promise<PlacementQuestion[]> {
	await ensureSeeded()
	const rows = await db
		.select()
		.from(alMamharahPlacementQuestions)
		.where(track ? eq(alMamharahPlacementQuestions.track, track) : undefined)
		.orderBy(asc(alMamharahPlacementQuestions.track), asc(alMamharahPlacementQuestions.createdAt))
	return rows.map(toRecord)
}

/** Active questions for a quiz attempt, excluding previously served ids. */
export async function getQuizBank(
	track: PlacementQuestionTrack,
	exclude: string[] = []
): Promise<QuizQuestion[]> {
	await ensureSeeded()
	const rows = await db
		.select({
			id: alMamharahPlacementQuestions.id,
			question: alMamharahPlacementQuestions.question,
			options: alMamharahPlacementQuestions.options,
			answer: alMamharahPlacementQuestions.answer
		})
		.from(alMamharahPlacementQuestions)
		.where(
			and(
				eq(alMamharahPlacementQuestions.track, track),
				eq(alMamharahPlacementQuestions.active, true)
			)
		)
	return sampleQuizFromBank(rows, QUIZ_LENGTH, exclude)
}

/** Grades answers against the live bank (including recently deactivated rows). */
export async function gradePlacementAnswers(
	track: PlacementQuestionTrack,
	answers: QuizAnswer[]
): Promise<QuizGrade> {
	await ensureSeeded()
	const ids = [...new Set(answers.map(answer => answer.questionId))]
	const rows = ids.length
		? await db
				.select({
					id: alMamharahPlacementQuestions.id,
					question: alMamharahPlacementQuestions.question,
					options: alMamharahPlacementQuestions.options,
					answer: alMamharahPlacementQuestions.answer
				})
				.from(alMamharahPlacementQuestions)
				.where(
					and(
						eq(alMamharahPlacementQuestions.track, track),
						inArray(alMamharahPlacementQuestions.id, ids)
					)
				)
		: []
	return gradeQuizFromBank(rows, answers)
}

export async function createPlacementQuestion(
	track: PlacementQuestionTrack,
	input: PlacementQuestionInput,
	actor: string
): Promise<PlacementQuestion> {
	await ensureSeeded()
	const prefix = track === 'TUHFATUL_ATFAL' ? 'ta' : 'ja'
	const [row] = await db
		.insert(alMamharahPlacementQuestions)
		.values({
			id: `${prefix}-${crypto.randomUUID()}`,
			track,
			question: input.question,
			options: input.options,
			answer: input.answer,
			active: input.active ?? true,
			updatedBy: actor
		})
		.returning()
	return toRecord(row)
}

export async function updatePlacementQuestion(
	id: string,
	input: PlacementQuestionInput,
	actor: string
): Promise<PlacementQuestion> {
	await ensureSeeded()
	const [existing] = await db
		.select()
		.from(alMamharahPlacementQuestions)
		.where(eq(alMamharahPlacementQuestions.id, id))
	if (!existing) throw new NotFoundError('Question not found')

	if (existing.active && input.active === false) {
		const [row] = await db
			.select({ total: count() })
			.from(alMamharahPlacementQuestions)
			.where(
				and(
					eq(alMamharahPlacementQuestions.track, existing.track),
					eq(alMamharahPlacementQuestions.active, true)
				)
			)
		if (Number(row?.total ?? 0) <= QUIZ_LENGTH) {
			throw new ValidationError(`Keep at least ${QUIZ_LENGTH} active questions for this matn.`)
		}
	}

	const [row] = await db
		.update(alMamharahPlacementQuestions)
		.set({
			question: input.question,
			options: input.options,
			answer: input.answer,
			active: input.active ?? true,
			updatedBy: actor,
			updatedAt: new Date()
		})
		.where(eq(alMamharahPlacementQuestions.id, id))
		.returning()
	if (!row) throw new NotFoundError('Question not found')
	return toRecord(row)
}

export async function deletePlacementQuestion(id: string): Promise<PlacementQuestion> {
	await ensureSeeded()
	const [existing] = await db
		.select()
		.from(alMamharahPlacementQuestions)
		.where(eq(alMamharahPlacementQuestions.id, id))
	if (!existing) throw new NotFoundError('Question not found')

	if (existing.active) {
		const [row] = await db
			.select({ total: count() })
			.from(alMamharahPlacementQuestions)
			.where(
				and(
					eq(alMamharahPlacementQuestions.track, existing.track),
					eq(alMamharahPlacementQuestions.active, true)
				)
			)
		if (Number(row?.total ?? 0) <= QUIZ_LENGTH) {
			throw new ValidationError(`Keep at least ${QUIZ_LENGTH} active questions for this matn.`)
		}
	}

	const [row] = await db
		.delete(alMamharahPlacementQuestions)
		.where(eq(alMamharahPlacementQuestions.id, id))
		.returning()
	if (!row) throw new NotFoundError('Question not found')
	return toRecord(row)
}
