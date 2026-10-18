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

			<div className="relative z-10 p-4 sm:p-5 flex flex-col gap-3">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<span className="text-2xl">{icon}</span>
						<h3 className="font-primary font-bold text-white text-base sm:text-lg">{prayerName}</h3>
					</div>
					{isUpcoming ? (
						<span className="text-[10px] font-bold uppercase tracking-wide bg-amber-400 text-amber-950 rounded-full px-2 py-0.5">
							Next
						</span>
					) : null}
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div className="rounded-xl bg-black/35 backdrop-blur-sm border border-white/15 px-2 py-1.5 text-center">
						<p className="text-[9px] font-semibold uppercase tracking-widest text-white/60">Adhan</p>
						<p className="text-white font-primary font-semibold text-sm tabular-nums whitespace-nowrap">
							{adhan}
						</p>
					</div>
					<div className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 px-2 py-1.5 text-center">
						<p className="text-[9px] font-semibold uppercase tracking-widest text-white/60">Iqamah</p>
						<p className="text-white font-primary font-semibold text-sm tabular-nums whitespace-nowrap">
							{iqamah}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
