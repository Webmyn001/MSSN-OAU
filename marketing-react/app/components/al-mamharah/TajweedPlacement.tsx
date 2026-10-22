import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { AlertCircle, GraduationCap, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { chooseTajweedTrack, getPlacementQuiz, submitPlacementQuiz } from "~/lib/api/al-mamharah";

interface TajweedPlacementProps {
	displayName: string;
	trackLabel: string;
	prerequisiteTrack: string;
	prerequisiteLabel: string;
	onPassed: () => Promise<void> | void;
	onMovedDown: () => Promise<void> | void;
	onLogout: () => Promise<void> | void;
}

/**
 * Full-page gate shown instead of the dashboard until a participant passes the
 * placement check. A failed attempt is discarded and a fresh set is served.
 */
export function TajweedPlacement({
	displayName,
	trackLabel,
	prerequisiteTrack,
	prerequisiteLabel,
	onPassed,
	onMovedDown,
	onLogout,
}: TajweedPlacementProps) {
	const [quiz, setQuiz] = useState<any>(null);
	const [answers, setAnswers] = useState<Record<string, number>>({});
	const [failure, setFailure] = useState<any>(null);
	const [quizBusy, setQuizBusy] = useState(false);
	const [moveBusy, setMoveBusy] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const fetchQuiz = useCallback(async (exclude: string[] = []) => {
		setQuizBusy(true);
		setLoadError(null);
		try {
			const res = await getPlacementQuiz(exclude);
			setQuiz(res.data);
		} catch (err) {
			setLoadError(err instanceof Error ? err.message : "Could not load the placement check.");
		} finally {
			setQuizBusy(false);
		}
	}, []);

	useEffect(() => {
		void fetchQuiz();
	}, [fetchQuiz]);

	async function submitAnswers() {
		if (!quiz) return;
		const payload = quiz.questions
			.map((question: any) => ({ questionId: question.id, choice: answers[question.id] }))
			.filter((answer: any) => Number.isInteger(answer.choice));
		if (payload.length !== quiz.questions.length) {
			toast.error("Please answer every question.");
			return;
		}

		const usedIds = quiz.questions.map((question: any) => question.id);
		setQuizBusy(true);
		try {
			const res = await submitPlacementQuiz(payload);
			if (res.data?.passed) {
				toast.success("Placement passed. You can now record your daily line.");
				setQuiz(null);
				setAnswers({});
				setFailure(null);
				await onPassed();
				return;
			}

			// * The attempt is spent: drop it and serve different questions. The
			// * participant can also accept the lower class instead.
			setFailure(res.data);
			setQuiz(null);
			setAnswers({});
			await fetchQuiz(usedIds);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not submit your answers.");
		} finally {
			setQuizBusy(false);
		}
	}

	async function moveDown() {
		setMoveBusy(true);
		try {
			await chooseTajweedTrack(prerequisiteTrack);
			toast.success(`Tajweed track set to ${prerequisiteLabel}.`);
			setFailure(null);
			setQuiz(null);
			setAnswers({});
			await onMovedDown();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not change your tajweed track.");
		} finally {
			setMoveBusy(false);
		}
	}

	return (
		<div className="mx-auto max-w-3xl">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="text-sm text-primary-600">As salāmu ʿalaykum,</p>
					<h1 className="font-secondary text-2xl font-bold text-primary-800 sm:text-3xl">{displayName}</h1>
					<p className="mt-2 text-sm text-gray-600">
						Your dashboard opens once you pass the placement check for <strong>{trackLabel}</strong>.
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={onLogout}>
					<LogOut className="size-4" />
					Log out
				</Button>
			</div>

			<div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
				<h2 className="flex items-center gap-2 font-secondary text-lg font-semibold text-amber-900">
					<GraduationCap className="size-5" />
					Placement check
				</h2>
				<p className="mt-1 text-sm text-amber-900">
					To study <strong>{trackLabel}</strong>, you must have mastered <strong>{prerequisiteLabel}</strong>. Answer
					both questions correctly to unlock your dashboard. Each attempt uses different questions, and a wrong answer
					cannot be resubmitted.
				</p>

				{failure ? (
					<div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
						<p className="flex items-start gap-2">
							<AlertCircle className="mt-0.5 size-4 shrink-0" />
							<span>
								{failure.recommendation?.message ?? `You scored ${failure.correct}/${failure.total}.`} Fresh questions
								have been loaded below. You can also agree to start with {prerequisiteLabel}.
							</span>
						</p>
						<Button variant="outline" size="sm" className="mt-3" onClick={moveDown} disabled={moveBusy || quizBusy}>
							{moveBusy ? <Loader2 className="size-4 animate-spin" /> : null}
							Move me to {prerequisiteLabel}
						</Button>
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
												checked={answers[question.id] === optionIndex}
												onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
											/>
											<span>{option}</span>
										</label>
									))}
								</div>
							</fieldset>
						))}
						<Button onClick={submitAnswers} disabled={quizBusy}>
							{quizBusy ? <Loader2 className="size-4 animate-spin" /> : null}
							Submit answers
						</Button>
					</div>
				) : quizBusy ? (
					<div className="mt-4 flex items-center gap-2 text-sm text-amber-900">
						<Loader2 className="size-4 animate-spin" />
						Loading fresh questions...
					</div>
				) : (
					<div className="mt-4 space-y-3">
						{loadError ? (
							<p className="flex items-center gap-2 text-sm text-red-700">
								<AlertCircle className="size-4" />
								{loadError}
							</p>
						) : null}
						<Button onClick={() => fetchQuiz()} disabled={quizBusy}>
							{failure ? "Load new questions" : "Start placement check"}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
