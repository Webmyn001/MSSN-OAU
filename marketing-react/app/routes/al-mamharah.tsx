import { useEffect, useState } from "react";
import { PageHeader } from "~/components/layout/PageHeader";
import { Seo } from "~/components/seo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { MasarCard } from "~/components/al-mamharah/MasarCard";
import { ApplicationForm } from "~/components/al-mamharah/ApplicationForm";
import { EnterProgramme } from "~/components/al-mamharah/EnterProgramme";
import {
	CalendarDays,
	BookOpen,
	Phone,
	ListChecks,
	Trophy,
	Sparkles,
} from "lucide-react";
import { getProgrammeInfo } from "~/lib/api/al-mamharah";
import { Arabic } from "~/components/al-mamharah/Arabic";
import {
	PROGRAMME_INFO,
	PROGRAMME_CONTACTS,
	PROGRAMME_GUIDELINES,
	MASAR_OPTIONS,
	ARABIC,
	formatISODate,
	phaseLabel,
} from "~/lib/data/al-mamharah";

const benefits = [
	{
		icon: BookOpen,
		title: "Structured revision",
		text: "A clear daily target keeps your revision consistent from the first day to the last.",
	},
	{
		icon: ListChecks,
		title: "Daily accountability",
		text: "Record your muroja'ah each day and watch your streak grow.",
	},
	{
		icon: Trophy,
		title: "Friendly motivation",
		text: "A leaderboard celebrates consistency — not just speed — across all masār tracks.",
	},
	{
		icon: Sparkles,
		title: "Guided support",
		text: "The Programme Manager and instructors monitor progress and offer help where needed.",
	},
];

export default function AlMamharahPage() {
	const [tab, setTab] = useState("apply");
	const [info, setInfo] = useState<any>(null);

	useEffect(() => {
		let cancelled = false;
		getProgrammeInfo()
			.then((result) => {
				if (!cancelled) setInfo(result.data);
			})
			.catch(() => {
				if (!cancelled) setInfo(null);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const startLabel = formatISODate(info?.start ?? PROGRAMME_INFO.defaultStart);
	const endLabel = formatISODate(info?.end ?? PROGRAMME_INFO.defaultEnd);
	const phase = info?.phase ? phaseLabel(info.phase) : "In progress";

	return (
		<>
			<Seo
				title="Al-Mamharah — Qur'an Revision Programme"
				description="Al-Mamharah (الممهرة) is a structured Qur'an revision and retention programme for the MSSN-OAU family. Apply, choose your daily masār, and track your muroja'ah."
				path="/al-mamharah/"
				type="WebPage"
				keywords={[
					"al-mamharah",
					"mamharah",
					"quran revision programme",
					"murojaah",
					"quran retention",
					"mssn oau programmes",
					"hifz revision",
				]}
			/>

			<PageHeader subtitle="A Qur'an revision & retention programme for the MSSN-OAU family — organised by the Islamic Affairs Board.">
				Al-Mamharah · الممهرة
			</PageHeader>

			<section className="relative overflow-hidden py-10 sm:py-14">
				<div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary-500/10 blur-3xl" />
				<div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-primary-700/10 blur-3xl" />

				<div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					<div className="animate-fly-in mx-auto max-w-3xl text-center">
						<div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-primary-100 bg-primary-50/70 px-4 py-1.5 text-sm text-primary-700">
							<CalendarDays className="size-4" />
							<span>
								{startLabel} – {endLabel}
							</span>
							<span className="text-primary-300">•</span>
							<span>{phase}</span>
						</div>
						<p className="mt-6 text-base leading-relaxed text-gray-700 sm:text-lg">
							{PROGRAMME_INFO.description}
						</p>
						<Arabic className="mt-2 block text-lg font-medium text-primary-700">
							{ARABIC.quranRevision}
						</Arabic>
					</div>

					<div className="animate-fade-in mt-10 overflow-hidden rounded-2xl border border-primary-100 shadow-sm">
						<div className="relative">
							<img
								src="/images/al-mamharah/mushaf.webp"
								alt="An open Qur'an (mushaf) resting open"
								className="h-52 w-full object-cover object-center sm:h-72 lg:h-80"
								loading="lazy"
								decoding="async"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-primary-950/75 via-primary-900/20 to-transparent" />
							<div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
								<Arabic className="block text-xl font-semibold text-white sm:text-2xl">
									{ARABIC.quranRevision}
								</Arabic>
								<p className="mt-1 text-sm text-white/85">
									Qur'an revision &amp; retention — one day at a time.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{benefits.map((benefit, i) => {
							const Icon = benefit.icon;
							return (
								<div
									key={benefit.title}
									className="animate-fade-in rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm"
									style={{ animationDelay: `${100 + i * 120}ms` }}
								>
									<div className="flex size-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
										<Icon className="size-5" />
									</div>
									<h3 className="mt-3 font-secondary text-sm font-semibold text-primary-800">
										{benefit.title}
									</h3>
									<p className="mt-1 text-sm leading-relaxed text-gray-600">{benefit.text}</p>
								</div>
							);
						})}
					</div>

					<div className="mt-14">
						<h2 className="text-center font-secondary text-xl font-bold text-primary-800 sm:text-2xl">
							Choose your masār
							<Arabic className="ms-2 font-normal text-primary-600">{ARABIC.masar}</Arabic>
						</h2>
						<p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-600">
							Your masār is your daily revision target for the programme. Pick the pace you can
							sustain.
						</p>
						<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{MASAR_OPTIONS.map((option) => (
								<MasarCard key={option.value} option={option} />
							))}
						</div>
					</div>

					<div className="mt-14">
						<h2 className="text-center font-secondary text-xl font-bold text-primary-800 sm:text-2xl">
							Guidelines
						</h2>
						<div className="mx-auto mt-6 max-w-3xl rounded-xl border border-primary-100 bg-white/90 p-6 shadow-sm">
							<ul className="space-y-3">
								{PROGRAMME_GUIDELINES.map((guideline) => (
									<li key={guideline} className="flex items-start gap-3 text-sm text-gray-700">
										<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-500" />
										<span>{guideline}</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div id="join" className="mt-14">
						<Tabs value={tab} onValueChange={setTab}>
							<TabsList className="mx-auto grid !h-auto w-full max-w-md grid-cols-2 gap-1 p-1">
								<TabsTrigger
									value="apply"
									className="!h-auto !whitespace-normal px-2 py-2.5 text-center"
								>
									Apply
								</TabsTrigger>
								<TabsTrigger
									value="enter"
									className="!h-auto !whitespace-normal px-2 py-2.5 text-center"
								>
									<span className="flex flex-col items-center gap-0.5 leading-tight">
										<span>Enter Programme</span>
										<Arabic className="text-xs font-normal text-primary-600 sm:text-sm">
											{ARABIC.enterProgramme}
										</Arabic>
									</span>
								</TabsTrigger>
							</TabsList>
							<TabsContent value="apply" className="mt-6">
								<div className="mx-auto max-w-2xl">
									<ApplicationForm />
								</div>
							</TabsContent>
							<TabsContent value="enter" className="mt-6">
								<div className="mx-auto max-w-md">
									<EnterProgramme />
								</div>
							</TabsContent>
						</Tabs>
					</div>

					<div className="mt-14 rounded-xl border border-primary-100 bg-primary-50/50 p-6">
						<h2 className="flex items-center gap-2 font-secondary text-lg font-semibold text-primary-800">
							<Phone className="size-5" />
							Need help?
						</h2>
						<p className="mt-1 text-sm text-gray-600">
							Contact the programme team for enquiries about your application or access.
						</p>
						<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
							{PROGRAMME_CONTACTS.map((contact) => (
								<a
									key={contact.phone}
									href={`tel:${contact.phone}`}
									className="flex flex-col rounded-lg border border-primary-100 bg-white p-3 text-center transition-colors hover:border-primary-300"
								>
									<span className="text-xs font-medium uppercase tracking-wide text-primary-600">
										{contact.name}
									</span>
									<span className="mt-1 font-mono text-sm text-gray-800">{contact.phone}</span>
								</a>
							))}
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
