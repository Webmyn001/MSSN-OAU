import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, updateSettings, AlMamharahError } from "~/lib/api/al-mamharah";
import { TASK_LABELS } from "~/lib/data/al-mamharah";

const TASKS: Array<"MUROJAAH" | "TAJWEED_QIRAAT"> = ["MUROJAAH", "TAJWEED_QIRAAT"];
const inputClass =
	"w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600";

function toggleTask(list: string[], value: string, checked: boolean, update: (next: string[]) => void) {
	if (checked) {
		update(list.includes(value) ? list : [...list, value]);
	} else {
		update(list.filter((t) => t !== value));
	}
}

export function SettingsPanel({
	token,
	onExpired,
	onSaved,
}: {
	token: string;
	onExpired: () => void;
	onSaved?: (s: any) => void;
}) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");
	const [timezone, setTimezone] = useState("");
	const [tasks, setTasks] = useState<string[]>([]);
	const [streakTasks, setStreakTasks] = useState<string[]>([]);
	const [acceptingApplications, setAcceptingApplications] = useState(true);
	const [maxMissedDaysPerMonth, setMaxMissedDaysPerMonth] = useState(4);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await getSettings(token);
			const s = result.data;
			setStart(s.start);
			setEnd(s.end);
			setTimezone(s.timezone);
			setTasks([...s.tasks]);
			setStreakTasks([...s.streakTasks]);
			setAcceptingApplications(s.acceptingApplications ?? true);
			setMaxMissedDaysPerMonth(s.maxMissedDaysPerMonth ?? 4);
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			setError(err instanceof Error ? err.message : "Unable to load settings.");
		} finally {
			setLoading(false);
		}
	}

	async function save() {
		if (tasks.length === 0) {
			toast.error("Select at least one task.");
			return;
		}
		setSaving(true);
		setSaved(false);
		try {
			const result = await updateSettings(
				{
					start,
					end,
					timezone: timezone.trim(),
					tasks,
					streakTasks,
					acceptingApplications,
					maxMissedDaysPerMonth,
				},
				token
			);
			toast.success("Settings saved.");
			setSaved(true);
			onSaved?.(result.data);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save settings.");
		} finally {
			setSaving(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center py-16">
				<Loader2 className="size-8 animate-spin text-primary-600" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				<AlertCircle className="size-4" />
				<p>{error}</p>
			</div>
		);
	}

	return (
		<div className="max-w-2xl space-y-6 rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
			<div>
				<h3 className="font-secondary text-base font-semibold text-gray-800">Programme window</h3>
				<div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="set-start">
							Start date
						</label>
						<input
							id="set-start"
							type="date"
							className={inputClass}
							value={start}
							onChange={(e) => setStart(e.target.value)}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="set-end">
							End date
						</label>
						<input
							id="set-end"
							type="date"
							className={inputClass}
							value={end}
							onChange={(e) => setEnd(e.target.value)}
						/>
					</div>
				</div>
				<div className="mt-4">
					<label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="set-tz">
						Timezone (IANA)
					</label>
					<input
						id="set-tz"
						type="text"
						className={inputClass}
						value={timezone}
						onChange={(e) => setTimezone(e.target.value)}
						placeholder="Africa/Lagos"
					/>
				</div>
			</div>

			<div>
				<h3 className="font-secondary text-base font-semibold text-gray-800">Daily tasks</h3>
				<p className="mt-1 text-xs text-gray-500">Tasks participants can record each day.</p>
				<div className="mt-3 space-y-2">
					{TASKS.map((task) => (
						<label
							key={task}
							className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
						>
							<input
								type="checkbox"
								className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
								checked={tasks.includes(task)}
								onChange={(e) => toggleTask(tasks, task, e.target.checked, setTasks)}
							/>
							{TASK_LABELS[task]}
						</label>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-secondary text-base font-semibold text-gray-800">Streak tasks</h3>
				<p className="mt-1 text-xs text-gray-500">
					Tasks that must be completed for a day to count toward the streak.
				</p>
				<div className="mt-3 space-y-2">
					{TASKS.filter((t) => tasks.includes(t)).map((task) => (
						<label
							key={task}
							className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
						>
							<input
								type="checkbox"
								className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
								checked={streakTasks.includes(task)}
								onChange={(e) => toggleTask(streakTasks, task, e.target.checked, setStreakTasks)}
							/>
							{TASK_LABELS[task]}
						</label>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-secondary text-base font-semibold text-gray-800">Applications</h3>
				<p className="mt-1 text-xs text-gray-500">
					When closed, new applications are blocked and the public form is hidden.
				</p>
				<label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-gray-700">
					<input
						type="checkbox"
						className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
						checked={acceptingApplications}
						onChange={(e) => setAcceptingApplications(e.target.checked)}
					/>
					Accepting new applications
				</label>
			</div>

			<div>
				<h3 className="font-secondary text-base font-semibold text-gray-800">Auto-suspension</h3>
				<p className="mt-1 text-xs text-gray-500">
					Participants who miss this many days in a calendar month are suspended automatically.
				</p>
				<div className="mt-3 max-w-xs">
					<label className="mb-1 block text-xs font-medium text-gray-600" htmlFor="set-missed">
						Max missed days per month
					</label>
					<input
						id="set-missed"
						type="number"
						min={1}
						max={31}
						className={inputClass}
						value={maxMissedDaysPerMonth}
						onChange={(e) => setMaxMissedDaysPerMonth(Number(e.target.value))}
					/>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<Button onClick={save} disabled={saving}>
					{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
					Save settings
				</Button>
				{saved ? (
					<span className="inline-flex items-center gap-1 text-sm text-emerald-600">
						<CheckCircle2 className="size-4" /> Saved
					</span>
				) : null}
			</div>
		</div>
	);
}
