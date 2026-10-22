import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { successResponse, errorResponse } from '../lib/response'
import { NotFoundError, AuthorizationError } from '../lib/errors'
import { logger } from '../lib/logger'
import { participantAuth, requireParticipant } from '../middleware/al-mamharah'
import {
	chooseTajweedTrackSchema,
	leaderboardQuerySchema,
	placementQuizAnswersSchema,
	recordCompletionSchema
} from '../schemas/al-mamharah'
import {
	deleteCompletion,
	getParticipantReport,
	listCompletions,
	recordCompletion
} from '../services/al-mamharah/progress'
import { getLeaderboard, getParticipantById } from '../services/al-mamharah/participants'
import { revokeParticipantSession } from '../services/al-mamharah/verification'
import { getSettings } from '../services/al-mamharah/settings'
import { todayInTimeZone } from '../services/al-mamharah/dates'
import {
	buildPlacementQuiz,
	chooseTajweedTrack,
	getTajweedStatus,
	submitPlacementQuiz
} from '../services/al-mamharah/placement'

// * Participant dashboard endpoints — all require a participant session.

const alMamharahParticipantRoute = new Hono()

alMamharahParticipantRoute.use('*', participantAuth)

/** GET / — dashboard report (streaks, tasks, recent completions). */
alMamharahParticipantRoute.get('/', async c => {
	const participant = requireParticipant(c)
	const report = await getParticipantReport(participant)
	return successResponse(c, report)
})

/** POST /complete — record today's muroja'ah. */
alMamharahParticipantRoute.post(
	'/complete',
	zValidator('json', recordCompletionSchema),
	async c => {
		const participant = requireParticipant(c)
		const input = c.req.valid('json')
		const result = await recordCompletion(
			participant,
			{
				taskType: input.taskType,
				matn: input.matn,
				lineNumber: input.lineNumber,
				note: input.note
			},
			{ allowPast: false }
		)

		const isTajweed = result.completion.taskType === 'TAJWEED_QIRAAT'
		return successResponse(
			c,
			{
				alreadyRecorded: result.alreadyRecorded,
				date: result.date,
				taskType: result.completion.taskType,
				matn: result.completion.matn,
				lineNumber: result.completion.lineNumber,
				stats: result.stats,
				message: result.alreadyRecorded
					? 'You already recorded this task today.'
					: isTajweed
						? `Line ${result.completion.lineNumber} recorded. Jazākallāhu khayran!`
						: "Jazākallāhu khayran! Today's muroja'ah has been recorded."
			},
			undefined,
			result.alreadyRecorded ? 200 : 201
		)
	}
)

/** GET /completions — recent completion history. */
alMamharahParticipantRoute.get('/completions', async c => {
	const participant = requireParticipant(c)
	const limitRaw = Number(c.req.query('limit'))
	const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 200) : 60
	const completions = await listCompletions(participant.id, { limit })
	return successResponse(c, completions)
})

/** DELETE /completions/:id — undo today's accidental entry (today only). */
alMamharahParticipantRoute.delete('/completions/:id', async c => {
	const participant = requireParticipant(c)
	const completionId = c.req.param('id')
	const settings = await getSettings()
	const today = todayInTimeZone(settings.timezone)

	const completions = await listCompletions(participant.id, { limit: 200 })
	const target = completions.find(item => item.id === completionId)
	if (!target) throw new NotFoundError('Completion not found')
	if (target.date !== today) {
		throw new AuthorizationError(
			"You can only undo today's entry from your dashboard. Contact the Programme Manager to correct older records."
		)
	}

	try {
		await deleteCompletion(completionId, {
			actor: `participant:${participant.id}`,
			reason: 'Undone by participant on the same day'
		})
	} catch (error) {
		logger.error({ error, completionId }, 'Failed to undo participant completion')
		return errorResponse(c, 'Could not undo this entry', 'WRITE_ERROR', 500)
	}

	const report = await getParticipantReport(participant)
	return successResponse(c, { message: "Today's entry has been removed.", stats: report.stats })
})

/** GET /leaderboard — ranked streaks for authenticated participants. */
alMamharahParticipantRoute.get(
	'/leaderboard',
	zValidator('query', leaderboardQuerySchema),
	async c => {
		const participant = requireParticipant(c)
		const { limit, scope } = c.req.valid('query')
		const leaderboard = await getLeaderboard(participant.id, { limit, scope })
		return successResponse(c, leaderboard)
	}
)

/** GET /tajweed — optional tajweed track status and line progress. */
alMamharahParticipantRoute.get('/tajweed', async c => {
	const participant = requireParticipant(c)
	const status = await getTajweedStatus(participant)
	return successResponse(c, status)
})

/** GET /tajweed/quiz — placement quiz on the preceding matn. */
alMamharahParticipantRoute.get('/tajweed/quiz', async c => {
	const participant = requireParticipant(c)
	const quiz = buildPlacementQuiz(participant)
	return successResponse(c, quiz)
})

/** POST /tajweed/quiz — grade the placement attempt. */
alMamharahParticipantRoute.post(
	'/tajweed/quiz',
	zValidator('json', placementQuizAnswersSchema),
	async c => {
		const participant = requireParticipant(c)
		const { answers } = c.req.valid('json')
		const result = await submitPlacementQuiz(participant, answers)
		const fresh = await getParticipantById(participant.id)
		const status = await getTajweedStatus(fresh)
		return successResponse(c, { ...result, status })
	}
)

/** PUT /tajweed — choose or change the optional tajweed track (null = none). */
alMamharahParticipantRoute.put(
	'/tajweed',
	zValidator('json', chooseTajweedTrackSchema),
	async c => {
		const participant = requireParticipant(c)
		const { track } = c.req.valid('json')
		const status = await chooseTajweedTrack(participant, track)
		return successResponse(c, status)
	}
)

/** POST /logout — revoke the current session. */
alMamharahParticipantRoute.post('/logout', async c => {
	const token = c.get('almamharahParticipantToken')
	await revokeParticipantSession(token)
	return successResponse(c, { message: 'You have been logged out.' })
})

export default alMamharahParticipantRoute
