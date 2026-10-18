import { useEffect, useState } from "react";
import { Link } from "react-router";
import { loadExcosData } from "~/lib/stores/excoStore";
import type { ExcosData } from "~/lib/data/sampleExcos";
import {
	Users,
	UserCheck,
	ShieldCheck,
	ArrowRight,
	Building2,
	Calendar,
	Clock,
	GraduationCap,
	BookUser,
	BookOpen,
	Mail,
	Newspaper,
	CreditCard,
	type LucideIcon,
} from "lucide-react";

type SectionCard = {
	title: string;
	description: string;
	icon: LucideIcon;
	href: string;
	linkText: string;
	bgColor: string;
	iconColor: string;
};

const sections: SectionCard[] = [
	{
		title: "Excos Manager",
		description:
			"Add or update executive member profiles, assign positions, upload photos, and import/export session records in JSON format.",
		icon: Users,
		href: "/excos",
		linkText: "Open Excos Manager",
		bgColor: "bg-green-100",
		iconColor: "text-green-800",
	},
	{
		title: "Prayer Times & Hijri Date",
		description:
			"Set exact Adhan and Iqamah times for Subhi, Dhuhr, Asr, Maghrib, Isha & Jumuah. Auto-fetch or customize the current Hijri date.",
		icon: Clock,
		href: "/prayer-times",
		linkText: "Open Prayer Times",
		bgColor: "bg-emerald-100",
		iconColor: "text-emerald-800",
	},
	{
		title: "Events & Registrations",
		description:
			"Post upcoming paid or free events with image banners. View total registrations, confirm payments, and check in attendees.",
		icon: Calendar,
		href: "/events",
		linkText: "Open Events Manager",
		bgColor: "bg-amber-100",
		iconColor: "text-amber-800",
	},
	{
		title: "Past Ameers & Ameerahs",
		description:
			"Manage past Ameers and Ameerahs by academic session. Track their current roles, departments, and contact information.",
		icon: GraduationCap,
		href: "/alumni",
		linkText: "Open Past Ameers & Ameerahs",
		bgColor: "bg-green-100",
		iconColor: "text-green-800",
	},
	{
		title: "Advisors Manager",
		description:
			"Add or update advisor profiles for each session. Track their departments, contact info, and social links.",
		icon: BookUser,
		href: "/advisors",
		linkText: "Open Advisors Manager",
		bgColor: "bg-emerald-100",
		iconColor: "text-emerald-800",
	},
	{
		title: "Programmes Manager",
		description:
			"Add or update programme details, schedules, descriptions, and images. Each programme has a Contact us button.",
		icon: BookOpen,
		href: "/programmes",
		linkText: "Open Programmes Manager",
		bgColor: "bg-teal-100",
		iconColor: "text-teal-800",
	},
	{
		title: "Contact Messages",
		description:
			"Read and respond to messages from the Contact Us form. Mark as read, add internal notes, and track reply status.",
		icon: Mail,
		href: "/contacts",
		linkText: "Open Contact Messages",
		bgColor: "bg-amber-100",
		iconColor: "text-amber-800",
	},
	{
		title: "Latest News",
		description:
			"Manage news articles displayed on the marketing homepage. Create, edit, and organise news with images and summaries.",
		icon: Newspaper,
		href: "/latest-news",
		linkText: "Open Latest News",
		bgColor: "bg-rose-100",
		iconColor: "text-rose-800",
	},
	{
		title: "Blog Posts",
		description:
			"Manage blog posts and press releases synced from WordPress. Approve, edit, and publish content to the marketing site.",
		icon: Newspaper,
		href: "/blog",
		linkText: "Open Blog Posts",
		bgColor: "bg-rose-100",
		iconColor: "text-rose-800",
	},
	{
		title: "Newsletter",
		description:
			"Manage newsletter subscribers and broadcast emails to your audience through Resend.",
		icon: Mail,
		href: "/newsletter",
		linkText: "Open Newsletter",
		bgColor: "bg-amber-100",
		iconColor: "text-amber-800",
	},
	{
		title: "Musollahs",
		description:
			"Manage mosque/musollah locations displayed on the marketing site. Add images, descriptions, and coordinates.",
		icon: Building2,
		href: "/mosques",
		linkText: "Open Musollahs",
		bgColor: "bg-cyan-100",
		iconColor: "text-cyan-800",
	},
	{
		title: "Annual Dues",
		description:
			"Track annual dues payments via Paystack. View all transactions, search by name/email, export CSV, and print receipts.",
		icon: CreditCard,
		href: "/annual-dues",
		linkText: "Open Annual Dues",
		bgColor: "bg-orange-100",
		iconColor: "text-orange-800",
	},
];

export default function Overview() {
	const [excosData, setExcosData] = useState<ExcosData>({ sessions: [] });

	useEffect(() => {
		setExcosData(loadExcosData());
	}, []);

	const activeSession = excosData.sessions[0]?.session || "N/A";
	const totalSessions = excosData.sessions.length;

	let totalMembers = 0;
	let maleCount = 0;
	let femaleCount = 0;
	let committeeCount = 0;
	if (excosData.sessions.length > 0) {
		const current = excosData.sessions[0];
		committeeCount = current.executives.length;
		for (const c of current.executives) {
			for (const m of c.members) {
				totalMembers++;
				if (m.gender === "female") femaleCount++;
				else maleCount++;
			}
		}
	}

	return (
		<div className="space-y-8">
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-8 shadow-xl">
				<div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
				<div className="relative z-10">
					<div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
						<ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
						<span className="text-[10px] font-semibold text-amber-300 uppercase tracking-widest">
							Admin Control Centre
						</span>
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold text-white font-secondary tracking-tight">
						Welcome back, Admin
					</h1>
					<p className="text-primary-100 mt-2 text-sm sm:text-base">
						Manage content, community, and operations for MSSN OAU.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<div className="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-primary-900">Current Session</span>
						<div className="p-2 rounded-xl bg-primary-100 text-primary-800">
							<UserCheck className="w-5 h-5" />
						</div>
					</div>
					<p className="text-2xl font-extrabold text-primary-950 mt-2">{activeSession}</p>
					<p className="text-xs text-gray-500 mt-1">Active Executive Year</p>
				</div>

				<div className="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-primary-900">Total Excos</span>
						<div className="p-2 rounded-xl bg-amber-100 text-amber-800">
							<Users className="w-5 h-5" />
						</div>
					</div>
					<p className="text-2xl font-extrabold text-primary-950 mt-2">{totalMembers}</p>
					<p className="text-xs text-gray-500 mt-1">
						Brothers: {maleCount} &bull; Sisters: {femaleCount}
					</p>
				</div>

				<div className="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-primary-900">Committees</span>
						<div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
							<Building2 className="w-5 h-5" />
						</div>
					</div>
					<p className="text-2xl font-extrabold text-primary-950 mt-2">{committeeCount}</p>
					<p className="text-xs text-gray-500 mt-1">Active committees</p>
				</div>

				<div className="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-xs font-semibold text-primary-900">Sessions</span>
						<div className="p-2 rounded-xl bg-teal-100 text-teal-800">
							<Calendar className="w-5 h-5" />
						</div>
					</div>
					<p className="text-2xl font-extrabold text-primary-950 mt-2">{totalSessions}</p>
					<p className="text-xs text-gray-500 mt-1">Active sessions</p>
				</div>
			</div>

			<div>
				<h2 className="text-lg font-bold text-primary-950 mb-4 font-secondary">Management Sections</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{sections.map((section) => {
						const Icon = section.icon;
						return (
							<Link
								key={section.href}
								to={section.href}
								className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all"
							>
								<div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${section.bgColor}`}>
									<Icon className={`w-5 h-5 ${section.iconColor}`} />
								</div>
								<h3 className="font-bold text-gray-900 text-sm">{section.title}</h3>
								<p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-3">
									{section.description}
								</p>
								<span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary-700 mt-3 group-hover:text-primary-800">
									<span>{section.linkText}</span>
									<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
