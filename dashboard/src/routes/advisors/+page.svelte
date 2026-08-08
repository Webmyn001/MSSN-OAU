<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { page } from '$app/state';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { loadAdvisorData, saveAdvisorData, clearAdvisorData, fetchAdvisorsDataFromApi } from '$lib/stores/advisorStore';
	import type { AdvisorData, Advisor } from '$lib/data/sampleAdvisors';
	import {
		BookUser,
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
		Link
	} from '@lucide/svelte';

	let advisorData: AdvisorData = $state({ advisors: [] });
	let searchQuery = $state<string>('');
	let activeTab = $state<'cards' | 'json'>('cards');

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	let isSaving = $state(false);

	let jsonText = $state<string>('');
	let jsonError = $state<string | null>(null);

	let isFormModalOpen = $state<boolean>(false);
	let formModalMode = $state<'add' | 'edit'>('add');
	let editingAdvisorId = $state<string | null>(null);

	let formName = $state<string>('');
	let formTitle = $state<string>('');
	let formPosition = $state<string>('');
	let formGender = $state<'male' | 'female'>('male');
	let formDepartment = $state<string>('');
	let formPhone = $state<string>('');
	let formEmail = $state<string>('');
	let formPhoto = $state<string>('');
	let formSummary = $state<string>('');
	let formWhatsapp = $state<string>('');
	let formLinkedin = $state<string>('');

	let activeAdvisorDetails = $state<{ advisor: Advisor } | null>(null);
	let isDetailsModalOpen = $state<boolean>(false);

	onMount(async () => {
		advisorData = loadAdvisorData();

		const remoteData = await fetchAdvisorsDataFromApi();
		if (remoteData) {
			advisorData = remoteData;
		}

		jsonText = JSON.stringify(advisorData, null, 2);

		const urlTab = page.url.searchParams.get('tab');
		if (urlTab === 'json') activeTab = 'json';
	});

	const displayedAdvisors = $derived.by(() => {
		let list = advisorData.advisors;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(a) =>
					a.name.toLowerCase().includes(q) ||
					(a.position && a.position.toLowerCase().includes(q)) ||
					(a.department && a.department.toLowerCase().includes(q))
			);
		}
		return list;
	});

	const totalDisplayedCount = $derived(displayedAdvisors.length);

	function getPlaceholder(gender?: string) {
		return gender === 'female' ? '/images/user/female.jpg' : '/images/user/male.jpg';
	}

	async function handleApplyJson() {
		jsonError = null;
		try {
			const parsed = JSON.parse(jsonText);
			if (!parsed || !Array.isArray(parsed.advisors)) {
				throw new Error('Invalid JSON: Must contain an "advisors" array.');
			}
			advisorData = parsed;
			isSaving = true;
			toast('success', 'Saving…');
			await saveAdvisorData(parsed);
			isSaving = false;
			toast('success', 'JSON saved!');
		} catch (err: any) {
			isSaving = false;
			jsonError = err.message || 'Invalid JSON';
			toast('error', `JSON Error: ${jsonError}`);
		}
	}

	async function handleReset() {
		if (confirm('Clear all advisor data?')) {
			isSaving = true;
			advisorData = await clearAdvisorData();
			jsonText = JSON.stringify(advisorData, null, 2);
			isSaving = false;
			toast('success', 'Advisor data cleared.');
		}
	}

	function openDetails(advisor: Advisor) {
		activeAdvisorDetails = { advisor };
		isDetailsModalOpen = true;
	}

	function copyDetails(advisor: Advisor) {
		const details = `${advisor.title || ''} ${advisor.name}\n${advisor.position || ''}, MSSN-OAU${
			advisor.department ? `\nDept: ${advisor.department}` : ''
		}${advisor.phone ? `\nPhone: ${advisor.phone}` : ''}${advisor.email ? `\nEmail: ${advisor.email}` : ''}`;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(details);
			toast('success', `Copied details for ${advisor.name}.`);
		}
	}

	function openAddModal() {
		formModalMode = 'add';
		editingAdvisorId = null;
		formName = '';
		formTitle = '';
		formPosition = '';
		formGender = 'male';
		formDepartment = '';
		formPhone = '';
		formEmail = '';
		formPhoto = '';
		formSummary = '';
		formWhatsapp = '';
		formLinkedin = '';
		isFormModalOpen = true;
	}

	function openEditModal(advisor: Advisor) {
		formModalMode = 'edit';
		editingAdvisorId = advisor.id;
		formName = advisor.name;
		formTitle = advisor.title || '';
		formPosition = advisor.position || '';
		formGender = advisor.gender || 'male';
		formDepartment = advisor.department || '';
		formPhone = advisor.phone || '';
		formEmail = advisor.email || '';
		formPhoto = advisor.photo || '';
		formSummary = advisor.summary || '';
		formWhatsapp = advisor.socials?.whatsapp || '';
		formLinkedin = advisor.socials?.linkedin || '';
		isFormModalOpen = true;
	}

	async function handleSaveAdvisor(e: Event) {
		e.preventDefault();
		if (!formName.trim()) {
			toast('error', 'Name is required.');
			return;
		}

		const dataCopy: AdvisorData = JSON.parse(JSON.stringify(advisorData));

		let successMsg = '';
		const newAdvisor: Advisor = {
			id: editingAdvisorId || `advisor-${Date.now()}`,
			name: formName.trim(),
			title: formTitle.trim() || undefined,
			gender: formGender,
			position: formPosition.trim() || undefined,
			department: formDepartment.trim() || undefined,
			phone: formPhone.trim() || undefined,
			email: formEmail.trim() || undefined,
			photo: formPhoto.trim() || undefined,
			summary: formSummary.trim() || undefined,
			socials: {
				whatsapp: formWhatsapp.trim() || undefined,
				linkedin: formLinkedin.trim() || undefined
			}
		};

		if (formModalMode === 'add') {
			dataCopy.advisors.push(newAdvisor);
			successMsg = `Added "${newAdvisor.name}"`;
		} else if (formModalMode === 'edit' && editingAdvisorId) {
			dataCopy.advisors = dataCopy.advisors.map((a) => (a.id === editingAdvisorId ? newAdvisor : a));
			successMsg = `Updated "${newAdvisor.name}"`;
		}

		advisorData = dataCopy;
		jsonText = JSON.stringify(advisorData, null, 2);
		isFormModalOpen = false;
		isSaving = true;
		await saveAdvisorData(advisorData);
		isSaving = false;
		if (successMsg) toast('success', successMsg);
	}

	async function handleDeleteAdvisor(advisorId: string, advisorName: string) {
		confirmState = {
			open: true,
			title: 'Delete Advisor?',
			message: `Remove advisor "${advisorName}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const dataCopy: AdvisorData = JSON.parse(JSON.stringify(advisorData));
				dataCopy.advisors = dataCopy.advisors.filter((a) => a.id !== advisorId);
				advisorData = dataCopy;
				jsonText = JSON.stringify(advisorData, null, 2);
				isSaving = true;
				await saveAdvisorData(advisorData);
				isSaving = false;
				toast('success', `Removed "${advisorName}"`);
			}
		};
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<BookUser class="w-7 h-7 text-green-700" />
				Advisors Management
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">Manage advisory board members.</p>
		</div>
		<div class="flex items-center space-x-2">
			<button onclick={handleReset} class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
				<RotateCcw class="w-4 h-4 text-gray-500" />
				<span class="hidden sm:inline">Reset</span>
			</button>
			<button onclick={openAddModal} class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all hover:scale-[1.02]">
				<UserPlus class="w-4 h-4" />
				<span>Add Advisor</span>
			</button>
		</div>
	</div>

	<div class="flex items-center space-x-2 border-b border-gray-200 pb-2">
		<button onclick={() => (activeTab = 'cards')} class={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'cards' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
			<BookUser class="w-4 h-4" /><span>Cards ({totalDisplayedCount})</span>
		</button>
		<button onclick={() => (activeTab = 'json')} class={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'json' ? 'bg-green-700 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
			<Code class="w-4 h-4" /><span>JSON Bulk Input</span>
		</button>
	</div>

	{#if activeTab === 'cards'}
		<div class="space-y-8">
			<div class="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
				<div class="relative">
					<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
					<input type="text" placeholder="Search name, position, dept…" bind:value={searchQuery} class="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
			</div>

			{#if displayedAdvisors.length === 0}
				<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
					<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto"><BookUser class="w-6 h-6" /></div>
					<h3 class="text-base font-semibold text-green-950">No Advisors Found</h3>
					<p class="text-xs text-gray-500 max-w-sm mx-auto">No advisors matched your search.</p>
					<button onclick={openAddModal} class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all">
						<Plus class="w-4 h-4" /><span>Add Advisor</span>
					</button>
				</div>
			{:else}
				<div>
					<div class="text-lg text-green-800 font-semibold text-center py-3 flex items-center before:flex-1 before:border-t before:border-green-300 before:me-4 after:flex-1 after:border-t after:border-green-300 after:ms-4">
						<span class="relative px-4 py-1.5 bg-green-50 rounded-lg border border-green-200/60 shadow-xs">All Advisors ({displayedAdvisors.length})</span>
					</div>
					<div class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mt-6">
						{#each displayedAdvisors as advisor (advisor.id)}
							<div class="group text-center relative flex flex-col justify-between p-3 bg-white hover:bg-green-50/40 rounded-2xl border border-transparent hover:border-green-200/80 transition-all duration-300 shadow-xs hover:shadow-md">
								<div>
									<div class="relative mb-3 mx-auto w-24 h-24">
										<img src={advisor.photo || getPlaceholder(advisor.gender)} alt={advisor.name} class="w-24 h-24 object-cover rounded-full shadow-md border-2 border-white ring-2 ring-green-300 group-hover:ring-4 group-hover:ring-green-500/70 transition-all duration-300 mx-auto" onerror={(e) => { (e.currentTarget as HTMLImageElement).src = getPlaceholder(advisor.gender); }} />
									</div>
									<h3 class="text-sm font-bold text-green-950 group-hover:text-green-700 transition-colors line-clamp-1">{[advisor.title, advisor.name].filter(Boolean).join(' ')}</h3>
									<p class="text-xs text-gray-600 group-hover:text-green-600 font-medium transition-colors line-clamp-2 mt-0.5">{advisor.position || 'Advisor'}</p>
									{#if advisor.department}<p class="text-[11px] text-gray-400 mt-1 line-clamp-1">{advisor.department}</p>{/if}
								</div>
								<div class="flex items-center justify-center space-x-1 pt-3 mt-2 border-t border-gray-100">
									<button onclick={() => openDetails(advisor)} class="px-2 py-1 text-[11px] font-semibold text-green-800 bg-green-100/80 hover:bg-green-200 rounded-md transition-colors" title="View Details">View</button>
									<button onclick={() => openEditModal(advisor)} class="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors" title="Edit"><Edit class="w-3.5 h-3.5" /></button>
									<button onclick={() => handleDeleteAdvisor(advisor.id, advisor.name)} class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors" title="Delete"><Trash2 class="w-3.5 h-3.5" /></button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	{#if activeTab === 'json'}
		<div class="space-y-4">
			<div class="bg-white p-5 rounded-2xl border border-green-100 shadow-sm space-y-3">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div>
						<h3 class="text-sm font-bold text-green-950 flex items-center gap-2"><FileCode class="w-4 h-4 text-green-700" />JSON Raw Data Editor</h3>
						<p class="text-xs text-gray-500">Paste or edit complete JSON payload.</p>
					</div>
					<div class="flex items-center space-x-2">
						<button onclick={handleApplyJson} class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all">
							<Save class="w-4 h-4" /><span>Apply & Save</span>
						</button>
					</div>
				</div>
				{#if jsonError}<div class="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center space-x-2"><AlertCircle class="w-4 h-4 text-rose-600 shrink-0" /><span>{jsonError}</span></div>{/if}
				<textarea bind:value={jsonText} rows="18" class="w-full font-mono text-xs bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-green-600 leading-relaxed" placeholder="Paste Advisor JSON here..."></textarea>
			</div>
		</div>
	{/if}
</div>

{#if isDetailsModalOpen && activeAdvisorDetails}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-base font-bold text-green-950">{[activeAdvisorDetails.advisor.title, activeAdvisorDetails.advisor.name].filter(Boolean).join(' ')}</h3>
					<p class="text-xs text-gray-500">{activeAdvisorDetails.advisor.position || 'Advisor'}</p>
				</div>
				<button onclick={() => (isDetailsModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>
			<div class="space-y-4">
				<div class="flex justify-center">
					<img src={activeAdvisorDetails.advisor.photo || getPlaceholder(activeAdvisorDetails.advisor.gender)} alt={activeAdvisorDetails.advisor.name} class="w-28 h-28 object-cover rounded-full shadow-md border-4 border-white ring-2 ring-green-200" />
				</div>
				{#if activeAdvisorDetails.advisor.department}
					<div class="text-center"><p class="text-[11px] text-gray-500 uppercase tracking-wide">Department</p><p class="text-sm font-semibold text-green-950">{activeAdvisorDetails.advisor.department}</p></div>
				{/if}
				{#if activeAdvisorDetails.advisor.summary}
					<p class="text-xs text-gray-600 text-center bg-green-50/50 p-3 rounded-xl border border-green-100 italic">{activeAdvisorDetails.advisor.summary}</p>
				{/if}
				<div class="space-y-2 text-xs border-t pt-3">
					{#if activeAdvisorDetails.advisor.phone}
						<a href={`tel:${activeAdvisorDetails.advisor.phone}`} class="flex items-center text-green-700 hover:underline justify-start font-medium"><Phone class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Call: {activeAdvisorDetails.advisor.phone}</a>
						<a href={`https://wa.me/${activeAdvisorDetails.advisor.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" class="flex items-center text-green-700 hover:underline justify-start font-medium"><MessageSquareText class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> WhatsApp</a>
						<a href={`sms:${activeAdvisorDetails.advisor.phone}`} class="flex items-center text-green-700 hover:underline justify-start font-medium"><Smartphone class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> SMS</a>
					{/if}
					{#if activeAdvisorDetails.advisor.email}
						<a href={`mailto:${activeAdvisorDetails.advisor.email}`} class="flex items-center text-green-700 hover:underline justify-start font-medium"><Mail class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> {activeAdvisorDetails.advisor.email}</a>
					{/if}
					{#if activeAdvisorDetails.advisor.socials?.linkedin}
						<a href={activeAdvisorDetails.advisor.socials.linkedin} target="_blank" rel="noopener noreferrer" class="flex items-center text-green-700 hover:underline justify-start font-medium"><Link class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> LinkedIn Profile</a>
					{/if}
				</div>
			</div>
			<div class="flex items-center space-x-2 pt-3 border-t border-gray-100">
				<button onclick={() => (isDetailsModalOpen = false)} class="flex-1 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Close</button>
				<button onclick={() => { if (activeAdvisorDetails) copyDetails(activeAdvisorDetails.advisor); }} class="flex-1 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5">
					<Copy class="w-3.5 h-3.5" /><span>Copy Details</span>
				</button>
			</div>
		</div>
	</div>
{/if}

{#if isFormModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100 text-xs">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<h3 class="text-base font-bold text-green-950 flex items-center gap-2"><UserPlus class="w-5 h-5 text-green-700" />{formModalMode === 'add' ? 'Add Advisor' : 'Edit Advisor'}</h3>
				<button onclick={() => (isFormModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>
			<form onsubmit={handleSaveAdvisor} class="space-y-3">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-title" class="block font-semibold text-gray-700 mb-1">Title</label>
						<input id="form-title" type="text" placeholder="Dr." bind:value={formTitle} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
					<div>
						<label for="form-name" class="block font-semibold text-gray-700 mb-1">Full Name *</label>
						<input id="form-name" type="text" required placeholder="Dr. Amina Bello" bind:value={formName} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-position" class="block font-semibold text-gray-700 mb-1">Position</label>
						<input id="form-position" type="text" placeholder="Chief Adviser" bind:value={formPosition} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
					<div>
						<label for="form-gender" class="block font-semibold text-gray-700 mb-1">Gender</label>
						<select id="form-gender" bind:value={formGender} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600">
							<option value="male">Male</option><option value="female">Female</option>
						</select>
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-department" class="block font-semibold text-gray-700 mb-1">Department</label>
						<input id="form-department" type="text" placeholder="Dept of Islamic Studies" bind:value={formDepartment} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
					<div>
						<label for="form-phone" class="block font-semibold text-gray-700 mb-1">Phone</label>
						<input id="form-phone" type="text" placeholder="+2348031234567" bind:value={formPhone} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-email" class="block font-semibold text-gray-700 mb-1">Email</label>
						<input id="form-email" type="email" placeholder="name@oauife.edu.ng" bind:value={formEmail} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
					<div>
						<label for="form-whatsapp" class="block font-semibold text-gray-700 mb-1">WhatsApp</label>
						<input id="form-whatsapp" type="text" placeholder="2348031234567" bind:value={formWhatsapp} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="form-linkedin" class="block font-semibold text-gray-700 mb-1">LinkedIn URL</label>
						<input id="form-linkedin" type="text" placeholder="https://linkedin.com/in/..." bind:value={formLinkedin} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
					<div>
						<label for="form-photo" class="block font-semibold text-gray-700 mb-1">Photo URL</label>
						<input id="form-photo" type="text" placeholder="/images/user/male.jpg" bind:value={formPhoto} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
				</div>
				<div>
					<label for="form-summary" class="block font-semibold text-gray-700 mb-1">Summary / Bio</label>
					<textarea id="form-summary" rows="2" placeholder="Brief bio…" bind:value={formSummary} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
				</div>
				<div class="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
					<button type="button" onclick={() => (isFormModalOpen = false)} class="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-semibold">Cancel</button>
					<button type="submit" class="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white font-bold shadow-md">Save Advisor</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Confirm Dialog -->
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
