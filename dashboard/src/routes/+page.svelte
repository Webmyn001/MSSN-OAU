<script lang="ts">
	import { onMount } from 'svelte';
	import { loadExcosData } from '$lib/stores/excoStore';
	import type { ExcosData } from '$lib/data/sampleExcos';
	import {
		Users, UserCheck, ShieldCheck, ArrowRight, PlusCircle, Building2, CheckCircle2,
		Calendar, Clock, GraduationCap, BookUser, BookOpen, Mail, Newspaper,
		Link, CreditCard, ExternalLink
	} from '@lucide/svelte';

	let excosData: ExcosData = $state({ sessions: [] });

	onMount(() => {
		excosData = loadExcosData();
	});

	const activeSession = $derived(excosData.sessions[0]?.session || 'N/A');
	const totalSessions = $derived(excosData.sessions.length);

	const stats = $derived(() => {
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
					if (m.gender === 'female') femaleCount++;
					else maleCount++;
				}
			}
		}
		return { totalMembers, maleCount, femaleCount, committeeCount };
	});

	type SectionCard = {
		title: string;
		description: string;
		icon: any;
		href: string;
		linkText: string;
		bgColor: string;
		iconColor: string;
	};

	const sections: SectionCard[] = [
		{
			title: 'Excos Manager',
			description: 'Add or update executive member profiles, assign positions, upload photos, and import/export session records in JSON format.',
			icon: Users,
			href: '/excos',
			linkText: 'Open Excos Manager',
			bgColor: 'bg-green-100',
			iconColor: 'text-green-800'
		},
		{
			title: 'Prayer Times & Hijri Date',
			description: 'Set exact Adhan and Iqamah times for Subhi, Dhuhr, Asr, Maghrib, Isha & Jumuah. Auto-fetch or customize the current Hijri date.',
			icon: Clock,
			href: '/prayer-times',
			linkText: 'Open Prayer Times',
			bgColor: 'bg-emerald-100',
			iconColor: 'text-emerald-800'
		},
		{
			title: 'Events & Registrations',
			description: 'Post upcoming paid or free events with image banners. View total registrations, confirm payments, and check in attendees.',
			icon: Calendar,
			href: '/events',
			linkText: 'Open Events Manager',
			bgColor: 'bg-amber-100',
			iconColor: 'text-amber-800'
		},
		{
			title: 'Past Ameers & Ameerahs',
			description: 'Manage past Ameers and Ameerahs by academic session. Track their current roles, departments, and contact information.',
			icon: GraduationCap,
			href: '/alumni',
			linkText: 'Open Past Ameers & Ameerahs',
			bgColor: 'bg-green-100',
			iconColor: 'text-green-800'
		},
		{
			title: 'Advisors Manager',
			description: 'Add or update advisor profiles for each session. Track their departments, contact info, and social links.',
			icon: BookUser,
			href: '/advisors',
			linkText: 'Open Advisors Manager',
			bgColor: 'bg-emerald-100',
			iconColor: 'text-emerald-800'
		},
		{
			title: 'Programmes Manager',
			description: 'Add or update programme details, schedules, descriptions, and images. Each programme has a Contact us button.',
			icon: BookOpen,
			href: '/programmes',
			linkText: 'Open Programmes Manager',
			bgColor: 'bg-teal-100',
			iconColor: 'text-teal-800'
		},
		{
			title: 'Contact Messages',
			description: 'Read and respond to messages from the Contact Us form. Mark as read, add internal notes, and track reply status.',
			icon: Mail,
			href: '/contacts',
			linkText: 'Open Contact Messages',
			bgColor: 'bg-amber-100',
			iconColor: 'text-amber-800'
		},
		{
			title: 'Latest News',
			description: 'Manage news articles displayed on the marketing homepage. Create, edit, and organise news with images and summaries.',
			icon: Newspaper,
			href: '/latest-news',
			linkText: 'Open Latest News',
			bgColor: 'bg-rose-100',
			iconColor: 'text-rose-800'
		},
		{
			title: 'Blog Posts',
			description: 'Sync and approve blog posts from An-Nuur Press. Approved posts appear on the marketing site blog.',
			icon: Newspaper,
			href: '/blog',
			linkText: 'Open Blog Posts',
			bgColor: 'bg-purple-100',
			iconColor: 'text-purple-800'
		},
		{
			title: 'Newsletter',
			description: 'Manage newsletter subscribers, send broadcast emails, and track subscriber growth. Powered by Brevo email service.',
			icon: Mail,
			href: '/newsletter',
			linkText: 'Open Newsletter',
			bgColor: 'bg-indigo-100',
			iconColor: 'text-indigo-800'
		},
		{
			title: 'Musollahs',
			description: 'Manage musollah listings with descriptions, images, and Google Maps links displayed on the marketing site.',
			icon: Building2,
			href: '/mosques',
			linkText: 'Open Musollahs Manager',
			bgColor: 'bg-cyan-100',
			iconColor: 'text-cyan-800'
		},
		{
			title: 'Annual Dues',
			description: 'Track annual dues payments via Paystack. View all transactions, search by name/email, export CSV, and print receipts.',
			icon: CreditCard,
			href: '/annual-dues',
			linkText: 'Open Annual Dues',
			bgColor: 'bg-orange-100',
			iconColor: 'text-orange-800'
		}
	];
</script>

<div class="space-y-8">
	<!-- Hero Banner -->
	<div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-8 shadow-xl text-white">
		<div class="absolute -right-16 -top-16 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
		<div class="relative z-10 max-w-2xl space-y-3">
			<div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold border border-white/15">
				<ShieldCheck class="w-4 h-4" />
				<span>Official Executive Portal</span>
			</div>
			<h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
				Dashboard Overview
			</h2>
			<p class="text-primary-100 text-sm leading-relaxed">
				Complete management system for MSSN OAU. Manage executives, events, programmes, content, and community from one place.
			</p>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		<div class="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-primary-900">Current Session</span>
				<div class="p-2 rounded-xl bg-primary-100 text-primary-800">
					<UserCheck class="w-5 h-5" />
				</div>
			</div>
			<p class="text-2xl font-extrabold text-primary-950 mt-2">{activeSession}</p>
			<p class="text-xs text-gray-500 mt-1">Active Executive Year</p>
		</div>

		<div class="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-primary-900">Total Excos</span>
				<div class="p-2 rounded-xl bg-amber-100 text-amber-800">
					<Users class="w-5 h-5" />
				</div>
			</div>
			<p class="text-2xl font-extrabold text-primary-950 mt-2">{stats().totalMembers}</p>
			<p class="text-xs text-gray-500 mt-1">Brothers: {stats().maleCount} &bull; Sisters: {stats().femaleCount}</p>
		</div>

		<div class="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-primary-900">Committees</span>
				<div class="p-2 rounded-xl bg-emerald-100 text-emerald-800">
					<Building2 class="w-5 h-5" />
				</div>
			</div>
			<p class="text-2xl font-extrabold text-primary-950 mt-2">{stats().committeeCount}</p>
			<p class="text-xs text-gray-500 mt-1">Active committees</p>
		</div>

		<div class="bg-white border border-primary-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-primary-900">Sessions</span>
				<div class="p-2 rounded-xl bg-teal-100 text-teal-800">
					<Calendar class="w-5 h-5" />
				</div>
			</div>
			<p class="text-2xl font-extrabold text-primary-950 mt-2">{totalSessions}</p>
			<p class="text-xs text-gray-500 mt-1">Historical & current</p>
		</div>
	</div>

	<!-- All Sections Grid -->
	<div>
		<h3 class="text-lg font-bold text-primary-950 mb-4">All Dashboard Sections</h3>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{#each sections as section}
				{@const Icon = section.icon}
				<div class="bg-white border border-primary-100 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all group">
					<div class="flex items-center space-x-3">
						<div class="p-3 rounded-2xl {section.bgColor} {section.iconColor}">
							<Icon class="w-6 h-6" />
						</div>
						<div>
							<h4 class="text-base font-bold text-primary-950">{section.title}</h4>
						</div>
					</div>
					<p class="text-xs text-gray-600 leading-relaxed">
						{section.description}
					</p>
					<a
						href={section.href}
						class="inline-flex items-center space-x-2 text-xs font-bold text-primary-700 hover:text-primary-900 transition-colors group-hover:translate-x-0.5 transform"
					>
						<span>{section.linkText}</span>
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			{/each}
		</div>
	</div>
</div>
