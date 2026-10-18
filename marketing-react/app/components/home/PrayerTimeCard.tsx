import { formatTime } from "~/lib/utils/prayer";

export interface PrayerTimeCardProps {
	prayerName?: string;
	adhanTime?: string | number;
	iqamahTime?: string | number;
	background?: string;
	isUpcoming?: boolean;
	gradientColor?: string;
	icon?: string;
}

function toTime(val: unknown): string | number | null {
	if (val == null || val === "") return null;
	if (typeof val === "string" && /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(val.trim())) return val.trim();
	if (typeof val === "number") return val;
	if (typeof val === "string") {
		const asNum = Number(val);
		if (!Number.isNaN(asNum) && val.trim() !== "") return asNum;
	}
	return val as string;
}

export function PrayerTimeCard({
	prayerName = "",
	adhanTime = "",
	iqamahTime = "",
	background = "",
	isUpcoming = false,
	gradientColor = "from-blue-500/80 to-purple-600/80",
	icon = "🕌",
}: PrayerTimeCardProps) {
	const adhan = formatTime(toTime(adhanTime));
	const iqamah = formatTime(toTime(iqamahTime));

	return (
		<div
			className={`relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:-translate-y-1 ${
				isUpcoming
					? "border-amber-300 ring-2 ring-amber-300/60 ring-offset-1"
					: "border-white/20"
			}`}
		>
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url('${background || "/images/placeholder.webp"}')` }}
			/>
			<div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}`} />
			<div className="absolute inset-0 bg-black/25" />

			<div className="relative z-10 flex h-full min-h-[126px] flex-col justify-between gap-3 p-3.5 sm:p-5">
				<div className="flex items-center justify-between gap-2">
					<div className="flex min-w-0 items-center gap-2">
						<span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-base backdrop-blur-sm sm:size-9">
							{icon}
						</span>
						<h3 className="truncate font-primary text-sm font-bold leading-tight text-white drop-shadow sm:text-lg">
							{prayerName}
						</h3>
					</div>
					{isUpcoming ? (
						<span className="hidden shrink-0 items-center rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black sm:inline-flex">
							Next
						</span>
					) : null}
				</div>

				<div className="grid grid-cols-2 gap-1.5 sm:gap-2">
					<div className="min-w-0 rounded-xl border border-white/15 bg-black/35 px-1.5 py-1.5 text-center backdrop-blur-sm sm:px-2.5 sm:py-2">
						<p className="truncate text-[8px] font-semibold uppercase tracking-widest text-white/60 sm:text-[9px]">
							Adhan
						</p>
						<p className="whitespace-nowrap font-primary text-[11px] font-semibold tabular-nums text-white sm:text-sm">
							{adhan}
						</p>
					</div>
					<div
						className={`min-w-0 rounded-xl border px-1.5 py-1.5 text-center backdrop-blur-sm sm:px-2.5 sm:py-2 ${
							isUpcoming ? "border-amber-300/40 bg-amber-300/25" : "border-white/25 bg-white/15"
						}`}
					>
						<p className="truncate text-[8px] font-semibold uppercase tracking-widest text-white/60 sm:text-[9px]">
							Iqamah
						</p>
						<p className="whitespace-nowrap font-primary text-[11px] font-semibold tabular-nums text-white sm:text-sm">
							{iqamah}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
