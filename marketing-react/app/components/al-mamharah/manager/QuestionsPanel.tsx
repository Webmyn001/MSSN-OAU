import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
	AlertCircle,
	Check,
	Eye,
	EyeOff,
	Loader2,
	Pencil,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
	listPlacementQuestions,
	createPlacementQuestion,
	updatePlacementQuestion,
	deletePlacementQuestion,
	AlMamharahError,
	type PlacementQuestion,
	type PlacementQuestionInput,
	type PlacementQuestionTrack,
} from "~/lib/api/al-mamharah";
import { tajweedTrackLabel } from "~/lib/data/al-mamharah";

const TRACKS: PlacementQuestionTrack[] = ["TUHFATUL_ATFAL", "JAZARIYYAH"];

type TrackFilter = PlacementQuestionTrack | "ALL";

interface QuestionDraft extends PlacementQuestionInput {
	id?: string;
	track: PlacementQuestionTrack;
}

function emptyDraft(track: PlacementQuestionTrack): QuestionDraft {
	return {
		track,
		question: "",
		options: ["", ""],
		answer: 0,
		active: true,
	};
}

function draftFromQuestion(question: PlacementQuestion): QuestionDraft {
	return {
		id: question.id,
		track: question.track,
		question: question.question,
		options: [...question.options],
		answer: question.answer,
		active: question.active,
	};
}

export function QuestionsPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
	const [filter, setFilter] = useState<TrackFilter>("ALL");
	const [search, setSearch] = useState("");
	const [draft, setDraft] = useState<QuestionDraft | null>(null);
	const [saving, setSaving] = useState(false);
	const [acting, setActing] = useState<string | null>(null);
	const [deleting, setDeleting] = useState<string | null>(null);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await listPlacementQuestions(undefined, token);
			setQuestions(result.data ?? []);
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			setError(err instanceof Error ? err.message : "Unable to load the question bank.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function addQuestion() {
		setDraft(emptyDraft(filter === "ALL" ? "TUHFATUL_ATFAL" : filter));
	}

	async function save(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!draft) return;

		const question = draft.question.trim();
		const options = draft.options.map((option) => option.trim());
		if (question.length < 5) {
			toast.error("Enter the question text.");
			return;
		}
		if (options.some((option) => !option)) {
			toast.error("Every option needs text.");
			return;
		}
		if (draft.answer < 0 || draft.answer >= options.length) {
			toast.error("Choose which option is correct.");
			return;
		}

		setSaving(true);
		try {
			if (draft.id) {
				await updatePlacementQuestion(
					draft.id,
					{ question, options, answer: draft.answer, active: draft.active },
					token,
				);
				toast.success("Question updated.");
			} else {
				await createPlacementQuestion(
					{ track: draft.track, question, options, answer: draft.answer, active: draft.active },
					token,
				);
				toast.success("Question added.");
			}
			setDraft(null);
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save the question.");
		} finally {
			setSaving(false);
		}
	}

	async function deleteQuestion(question: PlacementQuestion) {
		const confirmed = window.confirm(
			`Delete this ${tajweedTrackLabel(question.track)} question?\n\n"${question.question}"\n\nThis cannot be undone.`,
		);
		if (!confirmed) return;

		setDeleting(question.id);
		try {
			await deletePlacementQuestion(question.id, token);
			setQuestions((current) => current.filter((item) => item.id !== question.id));
			toast.success("Question deleted.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not delete the question.");
		} finally {
			setDeleting(null);
		}
	}

	async function toggleActive(question: PlacementQuestion) {
		setActing(question.id);
		try {
			await updatePlacementQuestion(
				question.id,
				{
					question: question.question,
					options: question.options,
					answer: question.answer,
					active: !question.active,
				},
				token,
			);
			setQuestions((current) =>
				current.map((item) =>
					item.id === question.id ? { ...item, active: !item.active } : item,
				),
			);
			toast.success(question.active ? "Question deactivated." : "Question activated.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not update the question.");
		} finally {
			setActing(null);
		}
	}

	function updateOption(index: number, value: string) {
		if (!draft) return;
		const options = [...draft.options];
		options[index] = value;
		setDraft({ ...draft, options });
	}

	function removeOption(index: number) {
		if (!draft || draft.options.length <= 2) return;
		const options = draft.options.filter((_, i) => i !== index);
		const answer = draft.answer === index ? 0 : draft.answer > index ? draft.answer - 1 : draft.answer;
		setDraft({ ...draft, options, answer });
	}

	const query = search.trim().toLowerCase();
	const visible = questions
		.filter((question) => {
			if (filter !== "ALL" && question.track !== filter) return false;
			if (!query) return true;
			return (
				question.question.toLowerCase().includes(query) ||
				question.options.some((option) => option.toLowerCase().includes(query))
			);
		})
		.sort((a, b) => TRACKS.indexOf(a.track) - TRACKS.indexOf(b.track));
	const activeCount = visible.filter((question) => question.active).length;

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="font-secondary text-base font-semibold text-gray-800">
						Placement questions
					</h3>
					<p className="mt-1 text-xs text-gray-500">
						{visible.length} shown · {activeCount} active. Students receive two random active
						questions from the relevant matn.
					</p>
				</div>
				<Button size="sm" onClick={addQuestion}>
					<Plus className="size-4" /> Add question
				</Button>
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
					<Input
						className="pl-9"
						placeholder="Search questions or options..."
						value={search}
						onChange={(event) => setSearch(event.target.value)}
					/>
				</div>
				<div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
					{(["ALL", ...TRACKS] as TrackFilter[]).map((value) => (
						<button
							key={value}
							type="button"
							onClick={() => setFilter(value)}
							className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
								filter === value
									? "bg-primary-600 text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							{value === "ALL" ? "All" : tajweedTrackLabel(value)}
						</button>
					))}
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center py-16">
					<Loader2 className="size-8 animate-spin text-primary-600" />
				</div>
			) : error ? (
				<div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					<AlertCircle className="size-4" />
					<p>{error}</p>
				</div>
			) : visible.length === 0 ? (
				<p className="py-16 text-center text-sm text-gray-500">No questions match this view.</p>
			) : (
				<ul className="grid gap-3 lg:grid-cols-2">
					{visible.map((question) => (
						<li
							key={question.id}
							className={`rounded-xl border bg-white/90 p-4 shadow-sm ${
								question.active ? "border-primary-100" : "border-gray-200 opacity-75"
							}`}
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary-700 uppercase">
											{tajweedTrackLabel(question.track)}
										</span>
										<span
											className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
												question.active
													? "bg-emerald-100 text-emerald-700"
													: "bg-gray-200 text-gray-600"
											}`}
										>
											{question.active ? "Active" : "Inactive"}
										</span>
									</div>
									<p className="mt-2 text-sm font-medium text-gray-800">{question.question}</p>
								</div>
								<div className="flex shrink-0 gap-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setDraft(draftFromQuestion(question))}
										title="Edit question"
									>
										<Pencil className="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => toggleActive(question)}
										disabled={acting === question.id}
										title={question.active ? "Deactivate" : "Activate"}
									>
										{acting === question.id ? (
											<Loader2 className="size-4 animate-spin" />
										) : question.active ? (
											<EyeOff className="size-4" />
										) : (
											<Eye className="size-4" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="text-red-600 hover:bg-red-50 hover:text-red-700"
										onClick={() => deleteQuestion(question)}
										disabled={deleting === question.id || acting === question.id}
										title="Delete question"
									>
										{deleting === question.id ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Trash2 className="size-4" />
										)}
									</Button>
								</div>
							</div>

							<ul className="mt-3 space-y-1.5">
								{question.options.map((option, index) => (
									<li
										key={index}
										className={`flex items-start gap-2 rounded-md px-2 py-1 text-sm ${
											index === question.answer
												? "bg-emerald-50 text-emerald-800"
												: "text-gray-600"
										}`}
									>
										{index === question.answer ? (
											<Check className="mt-0.5 size-4 shrink-0" />
										) : (
											<span className="mt-0.5 size-4 shrink-0 text-center text-xs text-gray-400">
												{String.fromCharCode(65 + index)}
											</span>
										)}
										<span>{option}</span>
									</li>
								))}
							</ul>

							<p className="mt-3 border-t border-gray-100 pt-2 text-[11px] text-gray-400">
								{question.updatedBy ? `Last edited by ${question.updatedBy}` : "Original question"}
							</p>
						</li>
					))}
				</ul>
			)}

			<Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>{draft?.id ? "Edit question" : "Add question"}</DialogTitle>
						<DialogDescription>
							The correct answer is highlighted for managers; students only see the options.
						</DialogDescription>
					</DialogHeader>

					{draft ? (
						<form onSubmit={save} className="space-y-4">
							<div>
								<label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="q-track">
									Matn
								</label>
								<select
									id="q-track"
									className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
									value={draft.track}
									disabled={Boolean(draft.id)}
									onChange={(event) =>
										setDraft({ ...draft, track: event.target.value as PlacementQuestionTrack })
									}
								>
									{TRACKS.map((track) => (
										<option key={track} value={track}>
											{tajweedTrackLabel(track)}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="q-text">
									Question
								</label>
								<Textarea
									id="q-text"
									rows={3}
									value={draft.question}
									onChange={(event) => setDraft({ ...draft, question: event.target.value })}
									placeholder="What does iẓhār mean?"
								/>
							</div>

							<div>
								<span className="mb-1 block text-xs font-medium text-gray-600">
									Options — select the correct one
								</span>
								<div className="space-y-2">
									{draft.options.map((option, index) => (
										<div key={index} className="flex items-center gap-2">
											<input
												type="radio"
												name="correct-option"
												checked={draft.answer === index}
												onChange={() => setDraft({ ...draft, answer: index })}
												className="size-4 shrink-0 text-primary-600 focus:ring-primary-600"
												aria-label={`Option ${String.fromCharCode(65 + index)} is correct`}
											/>
											<Input
												value={option}
												onChange={(event) => updateOption(index, event.target.value)}
												placeholder={`Option ${String.fromCharCode(65 + index)}`}
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => removeOption(index)}
												disabled={draft.options.length <= 2}
												title="Remove option"
											>
												<Trash2 className="size-4" />
											</Button>
										</div>
									))}
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="mt-2"
									onClick={() => setDraft({ ...draft, options: [...draft.options, ""] })}
									disabled={draft.options.length >= 6}
								>
									<Plus className="size-4" /> Add option
								</Button>
							</div>

							<label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
								<input
									type="checkbox"
									className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
									checked={draft.active}
									onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
								/>
								Include this question in placement quizzes
							</label>

							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setDraft(null)}>
									Cancel
								</Button>
								<Button type="submit" disabled={saving}>
									{saving ? <Loader2 className="size-4 animate-spin" /> : null}
									{draft.id ? "Save changes" : "Add question"}
								</Button>
							</DialogFooter>
						</form>
					) : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}
