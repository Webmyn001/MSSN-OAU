<script>
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import MasarCard from '$lib/components/al-mamharah/MasarCard.svelte';
	import ApplicationForm from '$lib/components/al-mamharah/ApplicationForm.svelte';
	import EnterProgramme from '$lib/components/al-mamharah/EnterProgramme.svelte';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import {
		CalendarDays,
		BookOpen,
		Phone,
		ListChecks,
		Trophy,
		Sparkles
	} from '@lucide/svelte';
	import { getProgrammeInfo } from '$lib/api/al-mamharah.js';
	import {
		PROGRAMME_INFO,
		PROGRAMME_CONTACTS,
		PROGRAMME_GUIDELINES,
		MASAR_OPTIONS,
		formatISODate,
		phaseLabel
	} from '$lib/data/al-mamharah.js';

	let visible = $state(false);
	let tab = $state('apply');
	let info = $state(/** @type {any} */ (null));

	onMount(async () => {
		visible = true;
		try {
			const result = await getProgrammeInfo();
			info = result.data;
		} catch {
			info = null;
		}
	});

	const startLabel = $derived(formatISODate(info?.start ?? PROGRAMME_INFO.defaultStart));
	const endLabel = $derived(formatISODate(info?.end ?? PROGRAMME_INFO.defaultEnd));
	const phase = $derived(info?.phase ? phaseLabel(info.phase) : 'In progress');

	const benefits = [
		{
			icon: BookOpen,
			title: 'Structured revision',
			text: 'A clear daily target keeps your revision consistent from the first day to the last.'
		},
		{
			icon: ListChecks,
			title: 'Daily accountability',
			text: "Record your muroja'ah each day and watch your streak grow."
		},
		{
			icon: Trophy,
			title: 'Friendly motivation',
			text: 'A leaderboard celebrates consistency — not just speed — across all masār tracks.'
		},
		{
			icon: Sparkles,
			title: 'Guided support',
			text: 'The Programme Manager and instructors monitor progress and offer help where needed.'
		}
	];
</script>

<SEO
	title="Al-Mamharah — Qur'an Revision Programme"
	description="Al-Mamharah (الممهرة) is a structured Qur'an revision and retention programme for the MSSN-OAU family. Apply, choose your daily masār, and track your muroja'ah."
	path="/al-mamharah/"
	type="WebPage"
	keywords={[
		'al-mamharah',
		'mamharah',
		'quran revision programme',
		'murojaah',
		'quran retention',
		'mssn oau programmes',
		'hifz revision'
	]}
/>

<PageHeader
	subtitle="A Qur'an revision & retention programme for the MSSN-OAU family — organised by the Islamic Affairs Board."
>
	Al-Mamharah · الممهرة
</PageHeader>

<section class="relative overflow-hidden py-10 sm:py-14">
	<div class="absolute -top-24 -right-24 size-96 rounded-full bg-primary-500/10 blur-3xl"></div>
	<div class="absolute -bottom-32 -left-32 size-96 rounded-full bg-primary-700/10 blur-3xl"></div>

	<div class="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		{#if visible}
			<div in:fly={{ y: 30, duration: 700 }} class="mx-auto max-w-3xl text-center">
				<div
					class="mx-auto flex w-fit items-center gap-2 rounded-full border border-primary-100 bg-primary-50/70 px-4 py-1.5 text-sm text-primary-700"
				>
					<CalendarDays class="size-4" />
					<span>{startLabel} – {endLabel}</span>
					<span class="text-primary-300">•</span>
					<span>{phase}</span>
				</div>
				<p class="mt-6 text-base leading-relaxed text-gray-700 sm:text-lg">
					{PROGRAMME_INFO.description}
				</p>
			</div>

			<div class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{#each benefits as benefit, i (benefit.title)}
					{@const Icon = benefit.icon}
					<div
						in:fade={{ duration: 600, delay: 100 + i * 120 }}
						class="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm"
					>
						<div class="flex size-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
							<Icon class="size-5" />
						</div>
						<h3 class="mt-3 font-secondary text-sm font-semibold text-primary-800">{benefit.title}</h3>
						<p class="mt-1 text-sm leading-relaxed text-gray-600">{benefit.text}</p>
					</div>
				{/each}
			</div>

			<div class="mt-14">
				<h2 class="text-center font-secondary text-xl font-bold text-primary-800 sm:text-2xl">
					Choose your masār
				</h2>
				<p class="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-600">
					Your masār is your daily revision target for the programme. Pick the pace you can sustain.
				</p>
				<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each MASAR_OPTIONS as option (option.value)}
						<MasarCard {option} />
					{/each}
				</div>
			</div>

			<div class="mt-14">
				<h2 class="text-center font-secondary text-xl font-bold text-primary-800 sm:text-2xl">
					Guidelines
				</h2>
				<div class="mx-auto mt-6 max-w-3xl rounded-xl border border-primary-100 bg-white/90 p-6 shadow-sm">
					<ul class="space-y-3">
						{#each PROGRAMME_GUIDELINES as guideline (guideline)}
							<li class="flex items-start gap-3 text-sm text-gray-700">
								<span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-500"></span>
								<span>{guideline}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div id="join" class="mt-14">
				<Tabs bind:value={tab}>
					<TabsList class="mx-auto grid w-full max-w-md grid-cols-2">
						<TabsTrigger value="apply">Apply</TabsTrigger>
						<TabsTrigger value="enter">Enter Programme</TabsTrigger>
					</TabsList>
					<TabsContent value="apply" class="mt-6">
						<div class="mx-auto max-w-2xl">
							<ApplicationForm />
						</div>
					</TabsContent>
					<TabsContent value="enter" class="mt-6">
						<div class="mx-auto max-w-md">
							<EnterProgramme />
						</div>
					</TabsContent>
				</Tabs>
			</div>

			<div class="mt-14 rounded-xl border border-primary-100 bg-primary-50/50 p-6">
				<h2 class="flex items-center gap-2 font-secondary text-lg font-semibold text-primary-800">
					<Phone class="size-5" />
					Need help?
				</h2>
				<p class="mt-1 text-sm text-gray-600">
					Contact the programme team for enquiries about your application or access.
				</p>
				<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
					{#each PROGRAMME_CONTACTS as contact (contact.phone)}
						<a
							href="tel:{contact.phone}"
							class="flex flex-col rounded-lg border border-primary-100 bg-white p-3 text-center transition-colors hover:border-primary-300"
						>
							<span class="text-xs font-medium uppercase tracking-wide text-primary-600">{contact.name}</span>
							<span class="mt-1 font-mono text-sm text-gray-800">{contact.phone}</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>
