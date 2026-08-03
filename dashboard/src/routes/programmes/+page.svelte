<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { loadProgrammeData, saveProgrammeData, resetProgrammeDataToSample } from '$lib/stores/programmeStore';
	import type { ProgrammeData, Programme, ProgrammeScheduleItem } from '$lib/data/sampleProgrammes';
	import { uploadImage, MAX_IMAGE_SIZE } from '$lib/utils/cloudinary';
	import {
		BookOpen,
		Plus,
		Edit,
		Trash2,
		RotateCcw,
		Save,
		Search,
		X,
		MessageSquareText,
		Clock,
		MapPin,
		Upload
	} from '@lucide/svelte';

	let programmeData: ProgrammeData = $state({ programmes: [] });
	let searchQuery = $state<string>('');

	let isSaving = $state(false);

	let isFormModalOpen = $state<boolean>(false);
	let formModalMode = $state<'add' | 'edit'>('add');
	let editingProgrammeId = $state<string | number | null>(null);

	let formTitle = $state<string>('');
	let formText = $state<string>('');
	let formSummary = $state<string>('');
	let formDescription = $state<string>('');
	let formImage = $state<string>('');
	let imageUploading = $state(false);
	let imageError = $state<string>('');
	let formSchedule = $state<ProgrammeScheduleItem[]>([]);

	let isDetailsModalOpen = $state<boolean>(false);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);
	let activeProgramme = $state<Programme | null>(null);

	onMount(async () => {
		programmeData = await loadProgrammeData();
	});

	const displayedProgrammes = $derived.by(() => {
		let list = programmeData.programmes;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(p) =>
					p.title.toLowerCase().includes(q) ||
					(p.summary && p.summary.toLowerCase().includes(q))
			);
		}
		return list;
	});

	const totalDisplayedCount = $derived(displayedProgrammes.length);

	async function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (file.size > MAX_IMAGE_SIZE) {
			imageError = `Image must be less than 3MB (this file is ${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
			return;
		}

		imageError = '';
		imageUploading = true;
		try {
			const url = await uploadImage(file);
			formImage = url;
		} catch (err: any) {
			imageError = err.message || 'Upload failed';
		} finally {
			imageUploading = false;
			input.value = '';
		}
	}

	function removeImage() {
		formImage = '';
	}

	function addScheduleItem() {
		formSchedule = [...formSchedule, { day: '', time: '', location: '' }];
	}

	function removeScheduleItem(index: number) {
		formSchedule = formSchedule.filter((_, i) => i !== index);
	}

	function openDetails(programme: Programme) {
		activeProgramme = programme;
		isDetailsModalOpen = true;
	}

	function openAddModal() {
		formModalMode = 'add';
		editingProgrammeId = null;
		formTitle = '';
		formText = '';
		formSummary = '';
		formDescription = '';
		formImage = '';
		formSchedule = [];
		imageError = '';
		isFormModalOpen = true;
	}

	function openEditModal(programme: Programme) {
		formModalMode = 'edit';
		editingProgrammeId = programme.id;
		formTitle = programme.title;
		formText = programme.text || '';
		formSummary = programme.summary || '';
		formDescription = programme.description || '';
		formImage = programme.image || '';
		formSchedule = (programme.schedule || []).map(s => ({ ...s }));
		imageError = '';
		isFormModalOpen = true;
	}

	async function handleSaveProgramme(e: Event) {
		e.preventDefault();
		if (imageUploading) {
			toast('error', 'Please wait for the image to finish uploading.');
			return;
		}
		if (!formTitle.trim()) {
			toast('error', 'Title is required.');
			return;
		}

		const dataCopy: ProgrammeData = JSON.parse(JSON.stringify(programmeData));

		const programme: Programme = {
			id: editingProgrammeId || `programme-${Date.now()}`,
			title: formTitle.trim(),
			text: formText.trim() || undefined,
			summary: formSummary.trim() || undefined,
			description: formDescription.trim() || undefined,
			image: formImage || undefined,
			schedule: formSchedule.filter(s => s.day.trim() || s.time.trim())
		};

		let successMsg = '';
		if (formModalMode === 'add') {
			dataCopy.programmes.push(programme);
			successMsg = `Added "${programme.title}"`;
		} else if (formModalMode === 'edit' && editingProgrammeId !== null) {
			const idx = dataCopy.programmes.findIndex((p) => p.id === editingProgrammeId);
			if (idx !== -1) dataCopy.programmes[idx] = programme;
			successMsg = `Updated "${programme.title}"`;
		}

		programmeData = dataCopy;
		isFormModalOpen = false;
		isSaving = true;
		await saveProgrammeData(programmeData);
		isSaving = false;
		if (successMsg) toast('success', successMsg);
	}

	async function handleDeleteProgramme(programmeId: string | number, title: string) {
		confirmState = {
			open: true,
			title: 'Delete Programme?',
			message: `Remove programme "${title}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const dataCopy: ProgrammeData = JSON.parse(JSON.stringify(programmeData));
				dataCopy.programmes = dataCopy.programmes.filter((p) => p.id !== programmeId);
				programmeData = dataCopy;
				isSaving = true;
				await saveProgrammeData(programmeData);
				isSaving = false;
				toast('success', `Removed "${title}"`);
			}
		};
	}

	async function handleResetToSample() {
		if (confirm('Reset all programme data to default?')) {
			isSaving = true;
			programmeData = await resetProgrammeDataToSample();
			isSaving = false;
			toast('success', 'Reset to sample data.');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<BookOpen class="w-7 h-7 text-green-700" />
				Programmes Management
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">Manage MSSN programmes, schedules, and descriptions.</p>
		</div>
		<div class="flex items-center space-x-2">
			<button onclick={handleResetToSample} class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
				<RotateCcw class="w-4 h-4 text-gray-500" /><span class="hidden sm:inline">Reset</span>
			</button>
			<button onclick={openAddModal} class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all hover:scale-[1.02]">
				<Plus class="w-4 h-4" /><span>Add Programme</span>
			</button>
		</div>
	</div>

	<div class="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
		<div class="relative max-w-sm">
			<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
			<input type="text" placeholder="Search programmes…" bind:value={searchQuery} class="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
		</div>
	</div>

	{#if displayedProgrammes.length === 0}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto"><BookOpen class="w-6 h-6" /></div>
			<h3 class="text-base font-semibold text-green-950">No Programmes Found</h3>
			<button onclick={openAddModal} class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all">
				<Plus class="w-4 h-4" /><span>Add Programme</span>
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each displayedProgrammes as programme (programme.id)}
				<div class="bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
					{#if programme.image}
						<div class="relative h-40 overflow-hidden">
							<img src={programme.image} alt={programme.title} class="w-full h-full object-cover" />
							<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
							<h3 class="absolute bottom-3 left-4 text-lg font-bold text-white">{programme.title}</h3>
						</div>
					{:else}
						<div class="px-5 py-4 bg-green-50/60 border-b border-green-100">
							<h3 class="text-lg font-bold text-green-950">{programme.title}</h3>
						</div>
					{/if}

					<div class="p-5 space-y-4">
						{#if programme.summary}
							<p class="text-xs text-gray-600 leading-relaxed line-clamp-3">{programme.summary}</p>
						{/if}

						{#if programme.schedule && programme.schedule.length > 0}
							<div class="space-y-1.5">
								<p class="text-[11px] font-semibold text-green-900 uppercase tracking-wide">Schedule</p>
								{#each programme.schedule as item}
									<div class="flex items-center gap-2 text-xs text-gray-600">
										<Clock class="w-3.5 h-3.5 text-green-600 shrink-0" />
										<span class="font-medium">{item.day}</span>
										<span>•</span>
										<span>{item.time}</span>
										{#if item.location}
											<span>•</span>
											<MapPin class="w-3 h-3 text-gray-400 shrink-0" />
											<span class="text-gray-500">{item.location}</span>
										{/if}
									</div>
								{/each}
							</div>
						{/if}

						<div class="flex items-center justify-between pt-3 border-t border-gray-100">
							<div class="flex items-center space-x-1">
								<button onclick={() => openDetails(programme)} class="px-3 py-1.5 text-[11px] font-semibold text-green-800 bg-green-100/80 hover:bg-green-200 rounded-md transition-colors">View</button>
								<button onclick={() => openEditModal(programme)} class="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors" title="Edit"><Edit class="w-3.5 h-3.5" /></button>
								<button onclick={() => handleDeleteProgramme(programme.id, programme.title)} class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors" title="Delete"><Trash2 class="w-3.5 h-3.5" /></button>
							</div>
							<a
								href="https://wa.me/2347076412101?text=Hello%20MSSN%20OAU%2C%20I%20have%20a%20question%20about%20the%20programmes."
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-green-700 hover:bg-green-800 text-white shadow-sm transition-all"
							>
								<MessageSquareText class="w-3.5 h-3.5" />
								<span>Contact us</span>
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if isDetailsModalOpen && activeProgramme}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-base font-bold text-green-950">{activeProgramme.title}</h3>
					{#if activeProgramme.text}<p class="text-xs text-gray-500 mt-0.5">{activeProgramme.text}</p>{/if}
				</div>
				<button onclick={() => (isDetailsModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			{#if activeProgramme.image}
				<img src={activeProgramme.image} alt={activeProgramme.title} class="w-full h-48 object-cover rounded-xl" />
			{/if}

			{#if activeProgramme.description}
				<div class="prose prose-sm text-gray-600">{@html activeProgramme.description}</div>
			{/if}

			{#if activeProgramme.schedule && activeProgramme.schedule.length > 0}
				<div class="space-y-2">
					<p class="text-xs font-semibold text-green-900 uppercase tracking-wide">Schedule</p>
					{#each activeProgramme.schedule as item}
						<div class="flex items-start gap-2 text-xs text-gray-600 bg-green-50/50 p-2.5 rounded-lg border border-green-100">
							<Clock class="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
							<div>
								<span class="font-semibold text-green-950">{item.day}</span> — {item.time}
								{#if item.location}<p class="text-gray-500 mt-0.5"><MapPin class="w-3 h-3 inline" /> {item.location}</p>{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<div class="flex items-center space-x-2 pt-3 border-t border-gray-100">
				<button onclick={() => (isDetailsModalOpen = false)} class="flex-1 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Close</button>
				<a
					href="https://wa.me/2347076412101?text=Hello%20MSSN%20OAU%2C%20I%20have%20a%20question%20about%20the%20programmes."
					target="_blank"
					rel="noopener noreferrer"
					class="flex-1 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5"
				>
					<MessageSquareText class="w-3.5 h-3.5" />
					<span>Contact us</span>
				</a>
			</div>
		</div>
	</div>
{/if}

{#if isFormModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 text-xs flex flex-col max-h-[85vh] min-h-0">
			<div class="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
				<h3 class="text-base font-bold text-green-950 flex items-center gap-2"><BookOpen class="w-5 h-5 text-green-700" />{formModalMode === 'add' ? 'Add Programme' : 'Edit Programme'}</h3>
				<button onclick={() => (isFormModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>
			<form onsubmit={handleSaveProgramme} class="p-6 space-y-3 overflow-y-auto min-h-0 flex-1">
				<div>
					<label for="form-title" class="block font-semibold text-gray-700 mb-1">Title *</label>
					<input id="form-title" type="text" required placeholder="Tutorials" bind:value={formTitle} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
				<div>
					<label for="form-text" class="block font-semibold text-gray-700 mb-1">Short Description (one-liner)</label>
					<input id="form-text" type="text" placeholder="Academic tutorials organised by the Academic Committee." bind:value={formText} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
					<p class="text-[11px] text-gray-400 mt-1">Brief tagline shown on the homepage tab.</p>
				</div>
				<div>
					<label for="form-summary" class="block font-semibold text-gray-700 mb-1">Summary (card text)</label>
					<textarea id="form-summary" rows="2" placeholder="Short paragraph displayed on the programme card…" bind:value={formSummary} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
				</div>
				<div>
					<label for="form-description" class="block font-semibold text-gray-700 mb-1">Detailed Description (HTML)</label>
					<textarea id="form-description" rows="4" placeholder="<p>Full HTML description with bullets, links, etc.</p>" bind:value={formDescription} class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
					<p class="text-[11px] text-gray-400 mt-1">HTML content shown in the programme detail modal.</p>
				</div>

				<!-- Image Upload -->
				<div>
					<label class="block font-semibold text-gray-700 mb-1">Image (max 3MB)</label>
					{#if formImage}
						<div class="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mb-2">
							<img src={formImage} alt="Preview" class="w-full h-full object-cover" />
							<button type="button" onclick={removeImage} class="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"><X class="w-4 h-4" /></button>
						</div>
					{/if}
					<label class={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-3 py-4 cursor-pointer transition-colors ${imageUploading ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-green-50/50'}`}>
						{#if imageUploading}
							<div class="animate-spin w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full"></div>
							<span class="text-gray-500 text-xs">Uploading...</span>
						{:else}
							<Upload class="w-4 h-4 text-gray-500" />
							<span class="text-gray-500 text-xs">{formImage ? 'Replace Image' : 'Upload Image'}</span>
						{/if}
						<input type="file" accept="image/*" class="hidden" onchange={handleFileUpload} disabled={imageUploading} />
					</label>
					{#if imageError}
						<p class="text-[11px] text-rose-600 mt-1">{imageError}</p>
					{/if}
				</div>

				<!-- Schedule -->
				<div>
					<div class="flex items-center justify-between mb-1">
						<label class="block font-semibold text-gray-700">Schedule</label>
						<button type="button" onclick={addScheduleItem} class="text-[11px] font-semibold text-green-700 hover:text-green-800 flex items-center gap-1">
							<Plus class="w-3 h-3" /> Add Time
						</button>
					</div>
					{#if formSchedule.length === 0}
						<p class="text-[11px] text-gray-400 italic">No schedule items. Click "Add Time" to add one.</p>
					{:else}
						<div class="space-y-2">
							{#each formSchedule as item, i}
								<div class="flex items-center gap-2 bg-green-50/50 p-2 rounded-lg border border-green-100">
									<input type="text" placeholder="Day (e.g. Mondays)" bind:value={item.day} class="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-600" />
									<input type="text" placeholder="Time (e.g. 4PM)" bind:value={item.time} class="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-600" />
									<input type="text" placeholder="Location" bind:value={item.location} class="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-600" />
									<button type="button" onclick={() => removeScheduleItem(i)} class="text-gray-400 hover:text-rose-600 p-1 shrink-0"><X class="w-3.5 h-3.5" /></button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
					<button type="button" onclick={() => (isFormModalOpen = false)} class="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-semibold">Cancel</button>
					<button type="submit" disabled={imageUploading} class="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white font-bold shadow-md flex items-center gap-1.5">
						{#if imageUploading}
							<div class="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></div>
							<span>Uploading...</span>
						{:else}
							<Save class="w-3.5 h-3.5" />
							<span>Save Programme</span>
						{/if}
					</button>
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
