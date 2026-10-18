import { Arabic } from "./Arabic";

type Tone = "primary" | "amber" | "emerald" | "slate" | "rose";

const tones: Record<Tone, string> = {
	primary: "from-primary-500/10 to-primary-700/5 text-primary-700 border-primary-100",
	amber: "from-amber-500/10 to-amber-600/5 text-amber-700 border-amber-100",
	emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-700 border-emerald-100",
	slate: "from-slate-500/10 to-slate-600/5 text-slate-700 border-slate-100",
	rose: "from-rose-500/10 to-rose-600/5 text-rose-700 border-rose-100",
};

interface StatCardProps {
	label: string;
	labelAr?: string;
	value: string | number;
	hint?: string;
	tone?: Tone;
}

/**
 * Small metric tile used across the dashboard and manager overview.
 */
export function StatCard({ label, labelAr = "", value, hint = "", tone = "primary" }: StatCardProps) {
	return (
		<div className={`rounded-xl border bg-gradient-to-br p-4 shadow-sm ${tones[tone]}`}>
			<p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
			{labelAr ? <Arabic className="mt-0.5 block text-sm opacity-90">{labelAr}</Arabic> : null}
			<p className="mt-1 font-secondary text-2xl font-bold">{value}</p>
			{hint ? <p className="mt-0.5 text-xs opacity-70">{hint}</p> : null}
		</div>
	);
}
