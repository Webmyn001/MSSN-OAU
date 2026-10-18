import { BookOpen } from "lucide-react";
import type { MasarOption } from "~/lib/data/al-mamharah";

export function MasarCard({ option }: { option: MasarOption }) {
	return (
		<div className="group flex h-full flex-col rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-md">
			<div className="flex items-start justify-between gap-3">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
					<BookOpen className="size-5" />
				</div>
				<span className="font-secondary text-lg text-primary-600" dir="rtl" lang="ar">
					{option.labelAr}
				</span>
			</div>
			<h3 className="mt-4 font-secondary text-base font-semibold text-primary-800">
				{option.label}
			</h3>
			<p className="mt-1 text-xs font-medium text-primary-600">{option.daily}</p>
			<p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{option.description}</p>
		</div>
	);
}
