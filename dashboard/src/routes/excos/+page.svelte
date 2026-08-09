<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { page } from '$app/state';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { loadExcosData, saveExcosData, resetExcosDataToEmpty, fetchExcosDataFromApi } from '$lib/stores/excoStore';
	import type { ExcosData, ExecutiveMember, ExecutiveCommittee, ExecutiveSession } from '$lib/data/sampleExcos';
	import {
		Users,
		Plus,
		Edit,
		Trash2,
		Code,
		RotateCcw,
		Save,
		AlertCircle,
		Search,
		UserPlus,
		X,
		FileCode,
		Phone,
		Mail,
		MessageSquareText,
		Smartphone,
		Copy,
		ChevronDown
	} from '@lucide/svelte';

	// Main Reactive State
	let excosData: ExcosData = $state({ sessions: [] });
	let selectedSession = $state<string>('');
	let selectedCommittee = $state<string>('All');
	let searchQuery = $state<string>('');

	// Active tab: 'cards' | 'table' | 'json'
	let activeTab = $state<'cards' | 'json'>('cards');

	// Notification banner state
	let isSaving = $state(false);

	// JSON Editor State
	let jsonText = $state<string>('');
	let jsonError = $state<string | null>(null);

	// Member Add/Edit Form Modal State
	let isFormModalOpen = $state<boolean>(false);
	let formModalMode = $state<'add' | 'edit'>('add');
	let editingMemberId = $state<string | null>(null);

	// Form fields
	let formSession = $state<string>('');
	let formCommittee = $state<string>('Executive Council');
	let formName = $state<string>('');
	let formPosition = $state<string>('');
	let formGender = $state<'male' | 'female'>('male');
	let formPhone = $state<string>('');
	let formEmail = $state<string>('');
	let formPhoto = $state<string>('');
	let formBio = $state<string>('');

	// Details View Modal State (Matching User Page)
	let activeMemberDetails = $state<{ member: ExecutiveMember; committee: string } | null>(null);
	let isDetailsModalOpen = $state<boolean>(false);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	onMount(async () => {
		excosData = loadExcosData();
		sortSessionsNewestFirst();
		if (excosData.sessions.length > 0) {
			selectedSession = excosData.sessions[0].session;
		}
		jsonText = JSON.stringify(excosData, null, 2);

		const remoteData = await fetchExcosDataFromApi();
		if (remoteData && remoteData.sessions && remoteData.sessions.length > 0) {
			excosData = remoteData;
			sortSessionsNewestFirst();
			if (!excosData.sessions.some((s) => s.session === selectedSession)) {
				selectedSession = excosData.sessions[0].session;
			}
			jsonText = JSON.stringify(excosData, null, 2);
		}

		// Check query params for tab
		const urlTab = page.url.searchParams.get('tab');
		if (urlTab === 'json') {
			activeTab = 'json';
		}
	});

	// Derived current session data
	const currentSessionObj = $derived(
		excosData.sessions.find((s) => s.session === selectedSession)
	);

	// Available committees in selected session
	const availableCommittees = $derived(() => {
		if (!currentSessionObj) return [];
		return currentSessionObj.executives.map((c) => c.committee);
	});

	// Grouped committees & members for rendering (user page layout format)
	const displayedCommittees = $derived(() => {
		if (!currentSessionObj) return [];
		let list: { committee: string; members: ExecutiveMember[] }[] = [];

		for (const comm of currentSessionObj.executives) {
			if (selectedCommittee !== 'All' && comm.committee !== selectedCommittee) {
				continue;
			}
			let matchingMembers = comm.members;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				matchingMembers = comm.members.filter(
					(m) =>
						m.name.toLowerCase().includes(q) ||
						m.position.toLowerCase().includes(q) ||
						comm.committee.toLowerCase().includes(q)
				);
			}

			if (matchingMembers.length > 0) {
				list.push({ committee: comm.committee, members: matchingMembers });
			}
		}

		return list;
	});

	// Total count of displayed members
	const totalDisplayedMembersCount = $derived(() => {
		return displayedCommittees().reduce((sum, c) => sum + c.members.length, 0);
	});

	// Helper for gender placeholder images matching user page
	function getMemberPlaceholder(gender?: string) {
		if (gender === 'female') return '/images/user/female.jpg';
		return '/images/user/male.jpg';
	}

	// Sort sessions so the latest (newest) year appears first
	function sortSessionsNewestFirst() {
		excosData.sessions = [...excosData.sessions].sort((a, b) => {
			const aYear = parseInt(String(a.session || '').split('/')[0]) || 0;
			const bYear = parseInt(String(b.session || '').split('/')[0]) || 0;
			return bYear - aYear;
		});
	}

	// --- Actions & Handlers ---

	// Apply & Save JSON
	async function handleApplyJson() {
		jsonError = null;
		try {
			const parsed = JSON.parse(jsonText);
			if (!parsed || !Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
				throw new Error('Invalid JSON: Must contain a "sessions" array with executive data.');
			}
			excosData = parsed;
			sortSessionsNewestFirst();
			if (excosData.sessions.length > 0 && !excosData.sessions.some((s) => s.session === selectedSession)) {
				selectedSession = excosData.sessions[0].session;
			}
			isSaving = true;
			toast('success', 'Saving & syncing to marketing site…');
			await saveExcosData(parsed);
			isSaving = false;
			toast('success', '✅ JSON saved & synced! The marketing site will now reflect these changes.');
		} catch (err: any) {
			isSaving = false;
			jsonError = err.message || 'Invalid JSON format';
			toast('error', `JSON Error: ${jsonError}`);
		}
	}

	// Reset dataset to empty
	async function handleResetToEmpty() {
		if (confirm('Clear all Exco data? This removes every session from the site.')) {
			isSaving = true;
			toast('success', 'Clearing & syncing…');
			excosData = await resetExcosDataToEmpty();
			selectedSession = '';
			jsonText = JSON.stringify(excosData, null, 2);
			isSaving = false;
			toast('success', '✅ All Exco data cleared & synced to marketing site.');
		}
	}

	// Open Details Modal
	function openMemberDetails(member: ExecutiveMember, committee: string) {
		activeMemberDetails = { member, committee };
		isDetailsModalOpen = true;
	}

	// Copy Details string matching user page format
	function copyMemberContactDetails(member: ExecutiveMember, committee: string) {
		const details = `${member.name}\n${member.position}, ${committee}, MSSNOAU${
			member.phone ? `\nPhone: ${member.phone}` : ''
		}${member.email ? `\nEmail: ${member.email}` : ''}`;

		if (navigator.clipboard) {
			navigator.clipboard.writeText(details);
			toast('success', `Copied details for ${member.name}.`);
		}
	}

	// Open Modal for Add
	function openAddModal() {
		formModalMode = 'add';
		editingMemberId = null;
		formSession = selectedSession || excosData.sessions[0]?.session || '2024/2025';
		formCommittee = availableCommittees()[0] || 'Executive Council';
		formName = '';
		formPosition = '';
		formGender = 'male';
		formPhone = '';
		formEmail = '';
		formPhoto = '';
		formBio = '';
		isFormModalOpen = true;
	}

	// Open Modal for Edit
	function openEditModal(committee: string, member: ExecutiveMember) {
		formModalMode = 'edit';
		editingMemberId = member.id;
		formSession = selectedSession;
		formCommittee = committee;
		formName = member.name;
		formPosition = member.position;
		formGender = member.gender || 'male';
		formPhone = member.phone || '';
		formEmail = member.email || '';
		formPhoto = member.photo || '';
		formBio = member.bio || '';
		isFormModalOpen = true;
	}

	// Save Member Form
	async function handleSaveMember(e: Event) {
		e.preventDefault();
		if (!formName.trim() || !formPosition.trim()) {
			toast('error', 'Name and Position are required fields.');
			return;
		}

		const dataCopy: ExcosData = JSON.parse(JSON.stringify(excosData));

		// Target session
		let sessionObj = dataCopy.sessions.find((s) => s.session === formSession);
		if (!sessionObj) {
			const startYear = parseInt(formSession.split('/')[0]) || new Date().getFullYear();
			sessionObj = {
				session: formSession,
				start_year: startYear,
				end_year: startYear + 1,
				executives: []
			};
			dataCopy.sessions.unshift(sessionObj);
		}

		// Target committee
		let committeeObj = sessionObj.executives.find((c) => c.committee === formCommittee);
		if (!committeeObj) {
			committeeObj = { committee: formCommittee, members: [] };
			sessionObj.executives.push(committeeObj);
		}

		let successMsg = '';
		if (formModalMode === 'add') {
			const newMember: ExecutiveMember = {
				id: `exco-${Date.now()}`,
				name: formName.trim(),
				position: formPosition.trim(),
				gender: formGender,
				phone: formPhone.trim() || undefined,
				email: formEmail.trim() || undefined,
				photo: formPhoto.trim() || undefined,
				bio: formBio.trim() || undefined
			};
			committeeObj.members.push(newMember);
			successMsg = `✅ Added "${newMember.name}" — synced to marketing site!`;
		} else if (formModalMode === 'edit' && editingMemberId) {
			// Remove from current place
			for (const s of dataCopy.sessions) {
				for (const c of s.executives) {
					c.members = c.members.filter((m) => m.id !== editingMemberId);
				}
			}
			const updatedMember: ExecutiveMember = {
				id: editingMemberId,
				name: formName.trim(),
				position: formPosition.trim(),
				gender: formGender,
				phone: formPhone.trim() || undefined,
				email: formEmail.trim() || undefined,
				photo: formPhoto.trim() || undefined,
				bio: formBio.trim() || undefined
			};
			committeeObj.members.push(updatedMember);
			successMsg = `✅ Updated "${updatedMember.name}" — synced to marketing site!`;
		}

		excosData = dataCopy;
		selectedSession = formSession;
		jsonText = JSON.stringify(excosData, null, 2);
		isFormModalOpen = false;

		isSaving = true;
		toast('success', 'Saving & syncing to marketing site…');
		await saveExcosData(excosData);
		isSaving = false;
		if (successMsg) toast('success', successMsg);
	}

	// Delete Member
	function requestDeleteMember(committee: string, memberId: string, memberName: string) {
		confirmState = {
			open: true,
			title: 'Delete Executive Member?',
			message: `Remove "${memberName}" from ${committee}? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const dataCopy: ExcosData = JSON.parse(JSON.stringify(excosData));
				const sessionObj = dataCopy.sessions.find((s) => s.session === selectedSession);
				if (sessionObj) {
					const commObj = sessionObj.executives.find((c) => c.committee === committee);
					if (commObj) {
						commObj.members = commObj.members.filter((m) => m.id !== memberId);
					}
				}
				excosData = dataCopy;
				jsonText = JSON.stringify(excosData, null, 2);
				isSaving = true;
				toast('success', 'Deleting & syncing…');
				await saveExcosData(excosData);
				isSaving = false;
				toast('success', `✅ Removed "${memberName}" — synced to marketing site!`);
			}
		};
	}

	// Delete Entire Session
	function requestDeleteSession() {
		const session = selectedSession;
		if (!session) return;
		if (excosData.sessions.length <= 1) {
			toast('error', 'You cannot delete the last remaining session.');
			return;
		}
		const memberCount = currentSessionObj?.executives.reduce((sum, c) => sum + c.members.length, 0) ?? 0;
		confirmState = {
			open: true,
			title: 'Delete Entire Session?',
			message: `Delete the ${session} session? This will remove ALL ${memberCount} executive members across ${currentSessionObj?.executives.length ?? 0} committees and sync the change to the marketing site.`,
			action: async () => {
				const dataCopy: ExcosData = JSON.parse(JSON.stringify(excosData));
				const index = dataCopy.sessions.findIndex((s) => s.session === session);
				if (index === -1) return;
				dataCopy.sessions.splice(index, 1);
				excosData = dataCopy;
				sortSessionsNewestFirst();
				selectedSession = excosData.sessions[0]?.session || '';
				selectedCommittee = 'All';
				jsonText = JSON.stringify(excosData, null, 2);
				isSaving = true;
				toast('success', 'Deleting session & syncing…');
				await saveExcosData(excosData);
				isSaving = false;
				toast('success', `✅ ${session} session deleted — synced to marketing site!`);
			}
		};
	}
</script>

<div class="space-y-6">
	<!-- Page Title & Top Actions -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<Users class="w-7 h-7 text-green-700" />
				Our Executives (Admin Portal)
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">
				Manage, edit, or add executive members for all sessions. Uses the exact design format & colors as the main user page.
			</p>
		</div>

		<div class="flex items-center space-x-2">
			<button
				onclick={handleResetToEmpty}
				class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
				title="Clear all exco data"
			>
				<RotateCcw class="w-4 h-4 text-gray-500" />
				<span class="hidden sm:inline">Clear All Data</span>
			</button>
			<button
				onclick={openAddModal}
				class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all hover:scale-[1.02]"
			>
				<UserPlus class="w-4 h-4" />
				<span>Add Exco Member</span>
			</button>
		</div>
	</div>

	<!-- Tab Switcher -->
	<div class="flex items-center space-x-2 border-b border-gray-200 pb-2">
		<button
			onclick={() => (activeTab = 'cards')}
			class={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
				activeTab === 'cards'
					? 'bg-green-700 text-white shadow-sm'
					: 'text-gray-600 hover:bg-gray-100'
			}`}
		>
			<Users class="w-4 h-4" />
			<span>Cards & Edit View ({totalDisplayedMembersCount()})</span>
		</button>
		<button
			onclick={() => (activeTab = 'json')}
			class={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
				activeTab === 'json'
					? 'bg-green-700 text-white shadow-sm'
					: 'text-gray-600 hover:bg-gray-100'
			}`}
		>
			<Code class="w-4 h-4" />
			<span>JSON Bulk Input & Template</span>
		</button>
	</div>

	<!-- TAB 1: CARDS & EDIT VIEW (USER PAGE STYLING) -->
	{#if activeTab === 'cards'}
		<div class="space-y-8">
			<!-- Filters & Controls Bar -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
				<!-- Session Selector -->
				<div>
					<label for="session-select" class="block text-xs font-semibold text-green-900 mb-1.5">Academic Session</label>
					<div class="flex items-center gap-2">
						<select
							id="session-select"
							bind:value={selectedSession}
							class="flex-1 bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs font-medium text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
						>
							{#each excosData.sessions as sessionObj}
								<option value={sessionObj.session}>{sessionObj.session} Session</option>
							{/each}
						</select>
						<button
							onclick={requestDeleteSession}
							disabled={excosData.sessions.length <= 1 || !selectedSession}
							title="Delete this whole session (all committees & members)"
							class="flex items-center gap-1.5 shrink-0 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<Trash2 class="w-3.5 h-3.5" />
							<span class="hidden sm:inline">Delete Session</span>
						</button>
					</div>
					<p class="text-[11px] text-gray-500 mt-1.5">
						Switch sessions above to view or manage executives from previous years.
					</p>
				</div>

				<!-- Committee Filter -->
				<div>
					<label for="committee-select" class="block text-xs font-semibold text-green-900 mb-1.5">Filter by Committee</label>
					<select
						id="committee-select"
						bind:value={selectedCommittee}
						class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs font-medium text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
					>
						<option value="All">All Committees ({availableCommittees().length})</option>
						{#each availableCommittees() as comm}
							<option value={comm}>{comm}</option>
						{/each}
					</select>
				</div>

				<!-- Search Input -->
				<div>
					<label for="search-input" class="block text-xs font-semibold text-green-900 mb-1.5">Search Excos</label>
					<div class="relative">
						<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
						<input
							id="search-input"
							type="text"
							placeholder="Search name, position..."
							bind:value={searchQuery}
							class="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>
				</div>
			</div>

			<!-- Exco Members grouped by Committee (User Page Header Divider & Layout Format) -->
			{#if displayedCommittees().length === 0}
				<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
					<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
						<Users class="w-6 h-6" />
					</div>
					<h3 class="text-base font-semibold text-green-950">No Executives Found</h3>
					<p class="text-xs text-gray-500 max-w-sm mx-auto">
						No members matched your selection. Click below to add a member to this session.
					</p>
					<button
						onclick={openAddModal}
						class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
					>
						<Plus class="w-4 h-4" />
						<span>Add Executive Member</span>
					</button>
				</div>
			{:else}
				{#each displayedCommittees() as { committee, members } (committee)}
					<div class="mb-12">
						<!-- User Page Styled Committee Divider -->
						<div class="text-lg text-green-800 font-semibold text-center py-3 flex items-center before:flex-1 before:border-t before:border-green-300 before:me-4 after:flex-1 after:border-t after:border-green-300 after:ms-4">
							<span class="relative px-4 py-1.5 bg-green-50 rounded-lg border border-green-200/60 shadow-xs">
								{committee} ({members.length})
							</span>
						</div>

						<!-- Grid of Member Profile Cards (Matching User Page Format) -->
						<div class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mt-6">
							{#each members as member (member.id)}
								<div class="group text-center relative flex flex-col justify-between p-3 bg-white hover:bg-green-50/40 rounded-2xl border border-transparent hover:border-green-200/80 transition-all duration-300 shadow-xs hover:shadow-md">
									<div>
										<!-- Avatar Image with Green Ring -->
										<div class="relative mb-3 mx-auto w-24 h-24">
											<img
												src={member.photo || getMemberPlaceholder(member.gender)}
												alt={`${member.name} - ${member.position}`}
												class="w-24 h-24 object-cover rounded-full shadow-md border-2 border-white ring-2 ring-green-300 group-hover:ring-4 group-hover:ring-green-500/70 transition-all duration-300 mx-auto"
												onerror={(e) => {
													(e.currentTarget as HTMLImageElement).src = getMemberPlaceholder(member.gender);
												}}
											/>
										</div>

										<h3 class="text-sm font-bold text-green-950 group-hover:text-green-700 transition-colors line-clamp-1">
											{member.name}
										</h3>
										<p class="text-xs text-gray-600 group-hover:text-green-600 font-medium transition-colors line-clamp-2 mt-0.5">
											{member.position}
										</p>

										{#if member.bio}
											<p class="text-[11px] text-gray-400 mt-1.5 line-clamp-1 italic">{member.bio}</p>
										{/if}
									</div>

									<!-- Action Buttons for Admin -->
									<div class="flex items-center justify-center space-x-1 pt-3 mt-2 border-t border-gray-100">
										<button
											onclick={() => openMemberDetails(member, committee)}
											class="px-2 py-1 text-[11px] font-semibold text-green-800 bg-green-100/80 hover:bg-green-200 rounded-md transition-colors"
											title="View Details"
										>
											View
										</button>
										<button
											onclick={() => openEditModal(committee, member)}
											class="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors"
											title="Edit Member"
										>
											<Edit class="w-3.5 h-3.5" />
										</button>
										<button
											onclick={() => requestDeleteMember(committee, member.id, member.name)}
											class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
											title="Delete Member"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}

	<!-- TAB 2: JSON RAW EDIT & TEMPLATE (MATCHING ALL EXCOS) -->
	{#if activeTab === 'json'}
		<div class="space-y-4">
			<div class="bg-white p-5 rounded-2xl border border-green-100 shadow-sm space-y-3">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div>
						<h3 class="text-sm font-bold text-green-950 flex items-center gap-2">
							<FileCode class="w-4 h-4 text-green-700" />
							JSON Raw Data Editor
						</h3>
						<p class="text-xs text-gray-500">
							Paste or edit the complete JSON payload, then click "Apply & Save JSON" to sync it to the site.
						</p>
					</div>

					<div class="flex items-center space-x-2">
						<button
							onclick={handleApplyJson}
							class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
						>
							<Save class="w-4 h-4" />
							<span>Apply & Save JSON</span>
						</button>
					</div>
				</div>

				{#if jsonError}
					<div class="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2">
						<AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
						<span>{jsonError}</span>
					</div>
				{/if}

				<textarea
					bind:value={jsonText}
					rows="18"
					class="w-full font-mono text-xs bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-600 leading-relaxed"
					placeholder="Paste Exco JSON payload here..."
				></textarea>
			</div>
		</div>
	{/if}
</div>

<!-- MODAL 1: MEMBER DETAILS VIEW (MATCHING USER PAGE RESPONSIVE MODAL) -->
{#if isDetailsModalOpen && activeMemberDetails}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-base font-bold text-green-950">{activeMemberDetails.member.name}</h3>
					<p class="text-xs text-gray-500">{activeMemberDetails.member.position}, {activeMemberDetails.committee}</p>
				</div>
				<button onclick={() => (isDetailsModalOpen = false)} class="text-gray-400 hover:text-gray-700">
					<X class="w-5 h-5" />
				</button>
			</div>

			<div class="space-y-4">
				<div class="flex justify-center">
					<img
						src={activeMemberDetails.member.photo || getMemberPlaceholder(activeMemberDetails.member.gender)}
						alt={activeMemberDetails.member.name}
						class="w-28 h-28 object-cover rounded-full shadow-md border-4 border-white ring-2 ring-green-200"
					/>
				</div>

				{#if activeMemberDetails.member.bio}
					<p class="text-xs text-gray-600 text-center bg-green-50/50 p-3 rounded-xl border border-green-100 italic">
						{activeMemberDetails.member.bio}
					</p>
				{/if}

				<div class="space-y-2 text-xs border-t pt-3">
					{#if activeMemberDetails.member.phone}
						<a
							href={`tel:${activeMemberDetails.member.phone}`}
							class="flex items-center text-green-700 hover:underline justify-start font-medium"
						>
							<Phone class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Call: {activeMemberDetails.member.phone}
						</a>
						<a
							href={`https://wa.me/${activeMemberDetails.member.phone.replace(/\D/g, '')}`}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center text-green-700 hover:underline justify-start font-medium"
						>
							<MessageSquareText class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Chat on WhatsApp
						</a>
						<a
							href={`sms:${activeMemberDetails.member.phone}`}
							class="flex items-center text-green-700 hover:underline justify-start font-medium"
						>
							<Smartphone class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Send SMS
						</a>
					{/if}
					{#if activeMemberDetails.member.email}
						<a
							href={`mailto:${activeMemberDetails.member.email}`}
							class="flex items-center text-green-700 hover:underline justify-start font-medium"
						>
							<Mail class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> {activeMemberDetails.member.email}
						</a>
					{/if}
				</div>
			</div>

			<div class="flex items-center space-x-2 pt-3 border-t border-gray-100">
				<button
					onclick={() => (isDetailsModalOpen = false)}
					class="flex-1 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
				>
					Close
				</button>
				<button
					onclick={() => {
						if (activeMemberDetails) {
							copyMemberContactDetails(activeMemberDetails.member, activeMemberDetails.committee);
						}
					}}
					class="flex-1 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5"
				>
					<Copy class="w-3.5 h-3.5" />
					<span>Copy Details</span>
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- MODAL 2: ADD / EDIT MEMBER FORM -->
{#if isFormModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100 text-xs">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<h3 class="text-base font-bold text-green-950 flex items-center gap-2">
					<UserPlus class="w-5 h-5 text-green-700" />
					{formModalMode === 'add' ? 'Add Executive Member' : 'Edit Executive Member'}
				</h3>
				<button onclick={() => (isFormModalOpen = false)} class="text-gray-400 hover:text-gray-700">
					<X class="w-5 h-5" />
				</button>
			</div>

			<form onsubmit={handleSaveMember} class="space-y-3">
				<!-- Session & Committee -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-session" class="block font-semibold text-gray-700 mb-1">Academic Session *</label>
						<input
							id="form-session"
							type="text"
							required
							placeholder="2024/2025"
							bind:value={formSession}
							class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>

					<div>
						<label for="form-committee" class="block font-semibold text-gray-700 mb-1">Committee Name *</label>
						<input
							id="form-committee"
							type="text"
							required
							placeholder="Executive Council"
							bind:value={formCommittee}
							class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>
				</div>

				<!-- Name & Position -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-name" class="block font-semibold text-gray-700 mb-1">Full Name *</label>
						<input
							id="form-name"
							type="text"
							required
							placeholder="Amoo Fareed"
							bind:value={formName}
							class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>

					<div>
						<label for="form-position" class="block font-semibold text-gray-700 mb-1">Position *</label>
						<input
							id="form-position"
							type="text"
							required
							placeholder="Ameer"
							bind:value={formPosition}
							class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>
				</div>

				<!-- Gender & Phone -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-gender" class="block font-semibold text-gray-700 mb-1">Gender</label>
						<select
							id="form-gender"
							bind:value={formGender}
							class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
						>
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</div>

					<div>
						<label for="form-phone" class="block font-semibold text-gray-700 mb-1">Phone Number</label>
						<input
							id="form-phone"
							type="text"
							placeholder="+2347035427158"
							bind:value={formPhone}
							class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>
				</div>

				<!-- Email & Photo -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-email" class="block font-semibold text-gray-700 mb-1">Email Address</label>
						<input
							id="form-email"
							type="email"
							placeholder="ameer@mssnoau.org"
							bind:value={formEmail}
							class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>

					<div>
						<label for="form-photo" class="block font-semibold text-gray-700 mb-1">Photo URL (Optional)</label>
						<input
							id="form-photo"
							type="text"
							placeholder="/images/user/male.jpg"
							bind:value={formPhoto}
							class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
						/>
					</div>
				</div>

				<!-- Bio / Department -->
				<div>
					<label for="form-bio" class="block font-semibold text-gray-700 mb-1">Bio / Department & Level</label>
					<textarea
						id="form-bio"
						rows="2"
						placeholder="Department: Mechanical Engineering • Level: 400"
						bind:value={formBio}
						class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
					></textarea>
				</div>

				<!-- Form Actions -->
				<div class="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
					<button
						type="button"
						onclick={() => (isFormModalOpen = false)}
						class="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-semibold"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white font-bold shadow-md"
					>
						Save Member
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- CONFIRM DIALOG -->
<ConfirmDialog
	open={confirmState?.open ?? false}
	title={confirmState?.title ?? 'Are you sure?'}
	message={confirmState?.message ?? ''}
	confirmLabel="Yes, Delete"
	cancelLabel="No, Cancel"
	onconfirm={() => {
		const action = confirmState?.action;
		confirmState = null;
		action?.();
	}}
	oncancel={() => {
		confirmState = null;
	}}
/>
