import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Seo } from "~/components/seo";
import { Button } from "~/components/ui/button";
import { StatCard } from "~/components/al-mamharah/StatCard";
import { Leaderboard } from "~/components/al-mamharah/Leaderboard";
import {
	Loader2,
	Flame,
	Trophy,
	CalendarCheck,
	CheckCircle2,
	Undo2,
	LogOut,
	AlertCircle,
	Target,
	BadgeCheck,
	BookOpen,
	GraduationCap,
	BookMarked,
} from "lucide-react";
import { toast } from "sonner";
import {
	getParticipantToken,
	getParticipantDashboard,
	getParticipantLeaderboard,
	recordToday,
	undoToday,
	logoutParticipant,
	clearParticipantSession,
	getPlacementQuiz,
	submitPlacementQuiz,
	chooseTajweedTrack,
	AlMamharahError,
} from "~/lib/api/al-mamharah";
import {
	masarLabel,
	masarDaily,
	taskLabel,
	formatISODate,
	phaseLabel,
	ARABIC,
	TAJWEED_TRACK_OPTIONS,
	tajweedTrackLabel,
} from "~/lib/data/al-mamharah";
import { Arabic } from "~/components/al-mamharah/Arabic";

export default function AlMamharahDashboardPage() {
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [signedOut, setSignedOut] = useState(false);
	const [report, setReport] = useState<any>(null);
	const [leaderboard, setLeaderboard] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState<string | null>(null);
	const [note, setNote] = useState("");
	const [scope, setScope] = useState<"OVERALL" | "QURAN" | "TAJWEED">("OVERALL");
	const [quiz, setQuiz] = useState<any>(null);
	const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
	const [quizResult, setQuizResult] = useState<any>(null);
	const [quizBusy, setQuizBusy] = useState(false);
	const [lineInput, setLineInput] = useState("");
	const [trackBusy, setTrackBusy] = useState(false);

	const load = useCallback(async () => {
		const token = getParticipantToken();
		if (!token) {
			setSignedOut(true);
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const dashboard = await getParticipantDashboard(token);
			setReport(dashboard.data);
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				clearParticipantSession();
				setSignedOut(true);
			} else {
				setError(err instanceof Error ? err.message : "Unable to load your dashboard.");
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const loadBoard = useCallback(async (nextScope: "OVERALL" | "QURAN" | "TAJWEED") => {
		const token = getParticipantToken();
		if (!token) return;
		try {
			const board = await getParticipantLeaderboard(50, token, nextScope);
			setLeaderboard(board.data);
		} catch {
			// * A failed board refresh must never block the dashboard.
		}
	}, []);

	useEffect(() => {
		if (report) loadBoard(scope);
	}, [scope, report, loadBoard]);

	async function complete(taskType: string) {
		setBusy(taskType);
		try {
			const result = await recordToday({ taskType, note: note.trim() || undefined });
			toast.success(result.data?.message ?? "Today's muroja'ah recorded.");
			setNote("");
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not record your entry.");
		} finally {
			setBusy(null);
		}
	}

	async function startQuiz() {
		setQuizBusy(true);
		setQuizResult(null);
		setQuizAnswers({});
		try {
			const res = await getPlacementQuiz();
			setQuiz(res.data);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Could not load the placement check.",
			);
		} finally {
			setQuizBusy(false);
		}
	}

	async function submitQuizAnswers() {
		if (!quiz) return;
		const answers = quiz.questions
			.map((question: any) => ({ questionId: question.id, choice: quizAnswers[question.id] }))
			.filter((answer: any) => Number.isInteger(answer.choice));
		if (answers.length !== quiz.questions.length) {
			toast.error("Please answer every question.");
			return;
		}
		setQuizBusy(true);
		try {
			const res = await submitPlacementQuiz(answers);
			setQuizResult(res.data);
			if (res.data?.passed) {
				toast.success("Placement passed — you can now record your daily line.");
				setQuiz(null);
				setQuizAnswers({});
				await load();
			} else {
				toast.error(
					res.data?.recommendation?.message ?? "Not quite yet — please try again.",
				);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not submit your answers.");
		} finally {
			setQuizBusy(false);
		}
	}

	async function moveTrack(track: string | null) {
		setTrackBusy(true);
		try {
			await chooseTajweedTrack(track);
			setQuiz(null);
			setQuizResult(null);
			setQuizAnswers({});
			toast.success(
				track
					? `Tajweed track set to ${tajweedTrackLabel(track)}.`
					: "Tajweed track removed — you will only record muroja'ah.",
			);
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not change your tajweed track.");
		} finally {
			setTrackBusy(false);
		}
	}

	async function recordTajweedLine() {
		if (!report?.tajweed?.track) return;
		const lineNumber = lineInput.trim() ? Number(lineInput) : undefined;
		if (lineNumber !== undefined && (!Number.isInteger(lineNumber) || lineNumber < 1)) {
			toast.error("Enter a valid line number.");
			return;
		}
		setBusy("TAJWEED_QIRAAT");
		try {
			const result = await recordToday({
				taskType: "TAJWEED_QIRAAT",
				matn: report.tajweed.track,
				lineNumber,
			});
			toast.success(result.data?.message ?? "Line recorded.");
			setLineInput("");
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not record your line.");
		} finally {
			setBusy(null);
		}
	}

	async function undo(completionId: string) {
		setBusy(completionId);
		try {
			await undoToday(completionId);
			toast.success("Today's entry has been removed.");
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not undo this entry.");
		} finally {
			setBusy(null);
		}
	}

	async function logout() {
		try {
			await logoutParticipant();
		} catch {
			clearParticipantSession();
		}
		toast.success("You have been logged out.");
		await navigate("/al-mamharah");
	}

	return (
		<>
			<Seo
				title="Al-Mamharah Dashboard"
				description="Record your daily muroja'ah, track your streak and see the Al-Mamharah leaderboard."
				path="/al-mamharah/dashboard/"
			/>

			<section className="relative min-h-[60vh] overflow-hidden py-10 sm:py-12">
				<div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary-500/10 blur-3xl" />
				<div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-24">
							<Loader2 className="size-10 animate-spin text-primary-600" />
							<p className="mt-4 text-sm text-gray-500">Loading your dashboard...</p>
						</div>
					) : signedOut ? (
						<div className="mx-auto max-w-md rounded-xl border border-primary-100 bg-white/90 p-8 text-center shadow-sm">
							<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
								<BookOpen className="size-7" />
							</div>
							<h1 className="mt-4 font-secondary text-xl font-semibold text-primary-800">
								Sign in to Al-Mamharah
							</h1>
							<p className="mt-2 text-sm text-gray-600">
								You need to enter the programme to access your dashboard.
							</p>
							<div className="mt-6">
								<Button asChild className="w-full">
									<Link to="/al-mamharah/#join">Go to Enter Programme</Link>
								</Button>
							</div>
						</div>
					) : error ? (
						<div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
							<AlertCircle className="mx-auto size-8 text-red-500" />
							<p className="mt-3 text-sm text-red-700">{error}</p>
							<div className="mt-4">
								<Button variant="outline" onClick={load}>
									Try again
								</Button>
							</div>
						</div>
					) : report ? (
						<>
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="text-sm text-primary-600">As-salāmu ʿalaykum,</p>
									<h1 className="font-secondary text-2xl font-bold text-primary-800 sm:text-3xl">
										{report.participant.displayName}
									</h1>
									<p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-gray-600">
										<Arabic className="text-primary-600">{ARABIC.masar}</Arabic>
											<span>
												· {masarLabel(report.participant.masar)}
											</span>
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="rounded-full border border-primary-100 bg-primary-50/70 px-3 py-1 text-xs text-primary-700">
										{phaseLabel(
											report.today < report.programme.start
												? "UPCOMING"
												: report.today > report.programme.end
													? "ENDED"
													: "ACTIVE",
										)}
									</span>
									<Arabic className="rounded-full border border-primary-100 bg-primary-50/70 px-3 py-1 text-xs text-primary-700">
										{ARABIC.dashboard}
									</Arabic>
									<Button variant="outline" size="sm" onClick={logout}>
										<LogOut className="size-4" />
										Log out
									</Button>
								</div>
							</div>

							<p className="mt-2 text-xs text-gray-500">
								Programme window: {formatISODate(report.programme.start)} –{" "}
								{formatISODate(report.programme.end)} · Today: {formatISODate(report.today)}
							</p>

							{report.tajweed?.track && !report.tajweed.placementPassed ? (
								<div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
									<h2 className="flex items-center gap-2 font-secondary text-lg font-semibold text-amber-900">
										<GraduationCap className="size-5" />
										Placement check
									</h2>
									<p className="mt-1 text-sm text-amber-900">
										To study <strong>{report.tajweed.label}</strong>, you must have
										mastered{" "}
										<strong>{report.tajweed.prerequisite?.label}</strong>. Answer the
										questions below to confirm your placement.
									</p>

									{quizResult && !quizResult.passed ? (
										<div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
											{quizResult.recommendation?.message ??
												`You scored ${quizResult.correct}/${quizResult.total}.`}{" "}
											You may retake the check, or move down to{" "}
											{report.tajweed.prerequisite?.label}.
										</div>
									) : null}

									{quiz ? (
										<div className="mt-4 space-y-4">
											{quiz.questions.map((question: any, index: number) => (
												<fieldset key={question.id}>
													<legend className="text-sm font-medium text-gray-800">
														{index + 1}. {question.question}
													</legend>
													<div className="mt-2 grid gap-1.5 sm:grid-cols-2">
														{question.options.map((option: string, optionIndex: number) => (
															<label
																key={optionIndex}
																className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:border-primary-300"
															>
																<input
																	type="radio"
																	name={`almh-quiz-${question.id}`}
																	className="size-4 border-gray-300 text-primary-600 focus:ring-primary-600"
																	checked={quizAnswers[question.id] === optionIndex}
																	onChange={() =>
																		setQuizAnswers((prev) => ({
																			...prev,
																			[question.id]: optionIndex,
																		}))
																	}
																/>
																<span>{option}</span>
															</label>
														))}
													</div>
												</fieldset>
											))}
											<div className="flex flex-wrap gap-2">
												<Button onClick={submitQuizAnswers} disabled={quizBusy}>
													{quizBusy ? (
														<Loader2 className="size-4 animate-spin" />
													) : null}
													Submit answers
												</Button>
												<Button variant="outline" onClick={startQuiz} disabled={quizBusy}>
													New questions
												</Button>
												<Button
													variant="ghost"
													onClick={() =>
														moveTrack(report.tajweed.prerequisite?.track ?? null)
													}
													disabled={trackBusy}
												>
													Move me to {report.tajweed.prerequisite?.label}
												</Button>
											</div>
										</div>
									) : (
										<Button className="mt-3" onClick={startQuiz} disabled={quizBusy}>
											{quizBusy ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												<GraduationCap className="size-4" />
											)}
											Start placement check
										</Button>
									)}
								</div>
							) : null}

							{!report.tajweed?.track ? (
								<div className="mt-6 rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
									<h2 className="flex items-center gap-2 font-secondary text-lg font-semibold text-primary-800">
										<BookMarked className="size-5" />
										Optional tajweed track
									</h2>
									<p className="mt-1 text-sm text-gray-600">
										Study one of the three mutūn alongside your muroja&apos;ah — one line
										per day. This is optional and does not change your muroja&apos;ah
										streak.
									</p>
									<div className="mt-3 flex flex-wrap gap-2">
										{TAJWEED_TRACK_OPTIONS.map((option) => (
											<Button
												key={option.value}
												variant="outline"
												size="sm"
												onClick={() => moveTrack(option.value)}
												disabled={trackBusy}
											>
												{option.label} · {option.lines} lines
											</Button>
										))}
									</div>
									{TAJWEED_TRACK_OPTIONS.some((option) => option.prerequisite) ? (
										<p className="mt-2 text-xs text-gray-500">
											Al-Jazariyyah and Shaṭibiyyah require passing a short placement
											check on the preceding matn first.
										</p>
									) : null}
								</div>
							) : null}

							<div className="mt-6 overflow-hidden rounded-xl border border-primary-100 shadow-sm">
								<div className="relative">
									<img
										src="/images/al-mamharah/mushaf.webp"
										alt="An open Qur'an (mushaf) resting open"
										className="h-36 w-full object-cover object-center sm:h-44"
										loading="lazy"
										decoding="async"
									/>
									<div className="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-primary-900/30 to-transparent" />
									<div className="absolute inset-y-0 left-0 flex flex-col justify-center p-4 sm:p-6">
										<Arabic className="text-lg font-semibold text-white sm:text-xl">
											{ARABIC.dashboard}
										</Arabic>
										<p className="mt-1 text-xs text-white/80">Your muroja'ah at a glance.</p>
									</div>
								</div>
							</div>

							<h2 className="mt-8 flex items-baseline gap-2 font-secondary text-lg font-semibold text-primary-800">
							My Progress
							<Arabic className="text-primary-600">{ARABIC.myProgress}</Arabic>
						</h2>
						<div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
								<StatCard
									label="Current streak"
									labelAr={ARABIC.currentStreak}
									value={report.stats.current}
									hint="consecutive days"
									tone="amber"
								/>
								<StatCard
									label="Longest streak"
									labelAr={ARABIC.longestStreak}
									value={report.stats.longest}
									hint="personal best"
									tone="emerald"
								/>
								<StatCard
									label="Total days"
									value={report.stats.total}
									hint="days recorded"
									tone="primary"
								/>
								<StatCard
									label="Completion"
									value={`${Math.round((report.stats.completionRate ?? 0) * 100)}%`}
									hint={`${report.stats.missedDays} missed`}
									tone="slate"
								/>
							</div>

							<div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
								<div className="lg:col-span-2">
									<div className="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
										<div className="flex items-center justify-between">
											<h2 className="flex items-center gap-2 font-secondary text-lg font-semibold text-primary-800">
												<Target className="size-5" />
												Today's Revision <Arabic className="text-primary-600">{ARABIC.todaysRevision}</Arabic>
											</h2>
											<span className="text-xs text-gray-500">
												{formatISODate(report.today)}
											</span>
										</div>

										{report.dailyTarget ? (
											<div className="mt-3 rounded-lg border border-primary-100 bg-primary-50/60 px-3 py-2">
												<p className="text-xs font-medium uppercase tracking-wide text-primary-600">
													Your daily target
												</p>
											<p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm font-semibold text-primary-800">
												<span>{masarDaily(report.participant.masar)}</span>
												{report.dailyTarget.fromPage && report.dailyTarget.toPage ? (
													<>
														<span className="text-primary-400">·</span>
														<span>
															Surat {report.dailyTarget.surah}
														</span>
														<span className="text-primary-400">·</span>
														<span className="font-mono">
															pg {report.dailyTarget.fromPage}
															{report.dailyTarget.toPage !== report.dailyTarget.fromPage
																? `–${report.dailyTarget.toPage}`
																: ""}
														</span>
													</>
												) : null}
											</p>
											</div>
										) : null}

										{!report.todayEligible ? (
											<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
												Today is not an eligible day for your programme window.
											</div>
										) : (
											<div className="mt-4 space-y-3">
												{report.tasks.map((task: any) => (
													<div
														key={task.taskType}
														className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 p-3"
													>
														<div className="flex items-center gap-2">
															{task.completedToday ? (
																<CheckCircle2 className="size-5 text-emerald-600" />
															) : (
																<span className="size-5 rounded-full border-2 border-gray-300" />
															)}
															<span className="text-sm font-medium text-gray-800">
																{taskLabel(task.taskType)}
															</span>
															{task.requiredForStreak ? (
																<span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
																	Streak
																</span>
															) : null}
														</div>
														{task.completedToday ? (
															<span className="text-xs font-medium text-emerald-600">
																Recorded
															</span>
														) : (
															<Button
																size="sm"
																onClick={() => complete(task.taskType)}
																disabled={busy === task.taskType}
															>
																{busy === task.taskType ? (
																	<Loader2 className="size-4 animate-spin" />
																) : (
																	<CalendarCheck className="size-4" />
																)}
																Record
															</Button>
														)}
													</div>
												))}

												{!report.stats.todayCompleted ? (
													<div>
														<label
															className="mb-1 block text-xs font-medium text-gray-500"
															htmlFor="almh-note"
														>
															Optional note (e.g. what you revised)
														</label>
														<input
															id="almh-note"
															type="text"
															maxLength={500}
															className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
															value={note}
															onChange={(e) => setNote(e.target.value)}
															placeholder="Optional"
														/>
													</div>
												) : null}
											</div>
										)}

										{report.tajweed?.track && report.tajweed.placementPassed ? (
											<div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
												<div className="flex items-center justify-between gap-2">
													<div>
														<p className="text-sm font-medium text-gray-800">
															{report.tajweed.label}
														</p>
														<p className="text-xs text-gray-500">
															Line {report.tajweed.completedLines} of{" "}
															{report.tajweed.totalLines} · one line per day
														</p>
													</div>
													{report.tajweed.completed ? (
														<span className="text-xs font-medium text-emerald-600">
															Matn completed
														</span>
													) : report.tajweed.todayRecorded ? (
														<span className="text-xs font-medium text-emerald-600">
															Line {report.tajweed.todayLine} recorded
														</span>
													) : null}
												</div>
												{!report.tajweed.completed && !report.tajweed.todayRecorded ? (
													<div className="mt-2 flex flex-wrap items-end gap-2">
														<div>
															<label
																className="mb-1 block text-[11px] font-medium text-gray-500"
																htmlFor="almh-line"
															>
																Line
															</label>
															<input
																id="almh-line"
																type="number"
																min={report.tajweed.nextLine ?? 1}
																max={report.tajweed.totalLines}
																className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
																value={lineInput}
																onChange={(e) => setLineInput(e.target.value)}
																placeholder={String(report.tajweed.nextLine ?? "")}
															/>
														</div>
														<Button
															size="sm"
															onClick={recordTajweedLine}
															disabled={busy === "TAJWEED_QIRAAT"}
														>
															{busy === "TAJWEED_QIRAAT" ? (
																<Loader2 className="size-4 animate-spin" />
															) : (
																<BookMarked className="size-4" />
															)}
															Record line {lineInput || report.tajweed.nextLine}
														</Button>
													</div>
												) : null}
												<p className="mt-2 text-[11px] text-gray-500">
													Optional — does not affect your muroja&apos;ah streak.
												</p>
											</div>
										) : null}
									</div>

									<div className="mt-6 rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
										<h2 className="flex items-baseline gap-2 font-secondary text-lg font-semibold text-primary-800">
											Revision History
											<Arabic className="text-primary-600">{ARABIC.revisionHistory}</Arabic>
										</h2>
										{report.completions.length === 0 ? (
											<p className="mt-3 text-sm text-gray-500">
												No entries yet — record today's muroja'ah to begin your streak.
											</p>
										) : (
											<ul className="mt-3 divide-y divide-gray-100">
												{report.completions.map((completion: any) => (
													<li
														key={completion.id}
														className="flex items-center justify-between gap-3 py-2.5"
													>
														<div className="min-w-0">
															<div className="flex items-center gap-2">
																<span className="text-sm font-medium text-gray-800">
																	{formatISODate(completion.date)}
																</span>
																<span className="text-xs text-gray-500">
																	{taskLabel(completion.taskType)}
																	{completion.taskType === "TAJWEED_QIRAAT" &&
																	completion.matn
																		? ` · ${tajweedTrackLabel(completion.matn)}${
																				completion.lineNumber
																					? ` · line ${completion.lineNumber}`
																					: ""
																			}`
																		: ""}
																</span>
																{completion.verified ? (
																	<span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase text-emerald-600">
																		<BadgeCheck className="size-3" />
																		verified
																	</span>
																) : null}
															</div>
															{completion.note ? (
																<p className="truncate text-xs text-gray-500">
																	{completion.note}
																</p>
															) : null}
														</div>
														{completion.date === report.today ? (
															<Button
																variant="ghost"
																size="sm"
																onClick={() => undo(completion.id)}
																disabled={busy === completion.id}
															>
																{busy === completion.id ? (
																	<Loader2 className="size-4 animate-spin" />
																) : (
																	<Undo2 className="size-4" />
																)}
																Undo
															</Button>
														) : null}
													</li>
												))}
											</ul>
										)}
									</div>
								</div>

								<div className="lg:col-span-3">
									<div className="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
										<h2 className="flex items-center gap-2 font-secondary text-lg font-semibold text-primary-800">
											<Trophy className="size-5 text-amber-500" />
											Leaderboard
											<Arabic className="text-primary-600">{ARABIC.leaderboard}</Arabic>
										</h2>
										<div className="mb-3 mt-3 flex flex-wrap items-center justify-between gap-2">
											<div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
												{(
													[
														["OVERALL", "Overall"],
														["QURAN", "Qur'an"],
														["TAJWEED", "Tajweed"],
													] as const
												).map(([value, label]) => (
													<button
														key={value}
														type="button"
														onClick={() => setScope(value)}
														className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
															scope === value
																? "bg-white text-primary-700 shadow-sm"
																: "text-gray-500 hover:text-gray-700"
														}`}
													>
														{label}
													</button>
												))}
											</div>
											<span className="text-xs text-gray-500">
												{leaderboard?.totalParticipants ?? 0}{" "}
												{scope === "TAJWEED" ? "on a tajweed track" : "active"}
											</span>
										</div>
										<Leaderboard
											entries={leaderboard?.entries ?? []}
											selfId={report.participant.id}
											caption={
												scope === "TAJWEED"
													? "Ranked by tajweed line streak, then longest streak, then total lines."
													: "Ranked by current streak, then longest streak, then total days."
											}
											emptyText={
												scope === "TAJWEED"
													? "No tajweed lines recorded yet."
													: scope === "QURAN"
														? "No muroja'ah records yet."
														: "No rankings yet."
											}
										/>
										{leaderboard?.self &&
										leaderboard.self.rank > (leaderboard.entries?.length ?? 0) ? (
											<div className="mt-4 border-t border-gray-100 pt-3">
												<p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
													<Flame className="size-3.5 text-orange-500" /> Your position
												</p>
												<Leaderboard entries={[leaderboard.self]} selfId={report.participant.id} />
											</div>
										) : null}
									</div>
								</div>
							</div>
						</>
					) : null}
				</div>
			</section>
		</>
	);
}
