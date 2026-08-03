<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { loadMosqueData, saveMosqueData, resetMosqueData } from '$lib/stores/mosqueStore';
	import type { MosqueData, MosqueEntry } from '$lib/data/sampleMosques';
	import { uploadImage, MAX_UPLOAD_SIZE } from '$lib/utils/cloudinary';
	import {
		Building2,
		RotateCcw,
		Search,
		X,
		Plus,
		Trash2,
		Eye,
		Pencil,
		MapPinned,
		Save,
		Image,
		Upload
	} from '@lucide/svelte';

	const MAX_IMAGE_COUNT = 4;

	let data: MosqueData = $state({ mosques: [] });
	let searchQuery = $state('');

	let isFormOpen = $state(false);
	let editingId = $state<string | null>(null);
	let formLabel = $state('');
	let formAddress = $state('');
	let formDescription = $state('');
	let formUrl = $state('');
	let formImages = $state<string[]>([]);
	let imageUploading = $state(false);
	let imageError = $state('');

	let isDetailModalOpen = $state(false);
	let activeItem = $state<MosqueEntry | null>(null);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	onMount(async () => {
		data = await loadMosqueData();
	});

	const displayedItems = $derived.by(() => {
		let list = data.mosques;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(m =>
				m.label.toLowerCase().includes(q) ||
				m.address.toLowerCase().includes(q) ||
				(m.description && m.description.toLowerCase().includes(q))
			);
		}
		return list;
	});

	async function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (formImages.length >= MAX_IMAGE_COUNT) {
			imageError = `Maximum of ${MAX_IMAGE_COUNT} images allowed. Remove one first.`;
			input.value = '';
			return;
		}
		if (file.size > MAX_UPLOAD_SIZE) {
			imageError = `Image is too large. Please upload an image under 15MB (this file is ${(file.size / (1024 * 1024)).toFixed(1)}MB).`;
			input.value = '';
			return;
		}
		imageError = '';
		imageUploading = true;
		try {
			const url = await uploadImage(file);
			formImages = [url, ...formImages];
		} catch (err: any) {
			imageError = err.message || 'Upload failed';
		} finally {
			imageUploading = false;
			input.value = '';
		}
	}

	function removeImage(index: number) {
		formImages = formImages.filter((_, i) => i !== index);
	}

	function openForm(item?: MosqueEntry) {
		if (item) {
			editingId = item.id;
			formLabel = item.label;
			formAddress = item.address;
			formDescription = item.description || '';
			formUrl = item.url || '';
			formImages = [...(item.images || [])];
		} else {
			editingId = null;
			formLabel = '';
			formAddress = '';
			formDescription = '';
			formUrl = '';
			formImages = [];
		}
		imageError = '';
		isFormOpen = true;
	}

	function closeForm() {
		isFormOpen = false;
		editingId = null;
	}

	async function saveForm() {
		if (!formLabel.trim() || !formAddress.trim()) {
			toast('error', 'Name and address are required');
			return;
		}

		const entry: MosqueEntry = {
			id: editingId || `mosque-${Date.now()}`,
			label: formLabel.trim(),
			address: formAddress.trim(),
			description: formDescription.trim(),
			url: formUrl.trim(),
			images: formImages
		};

		if (editingId) {
			data.mosques = data.mosques.map(m => m.id === editingId ? entry : m);
		} else {
			data.mosques = [...data.mosques, entry];
		}

		data = { ...data };
		await saveMosqueData(data);
		toast('success', editingId ? 'Musollah updated' : 'Musollah added');
		closeForm();
	}

	async function deleteItem(id: string, label: string) {
		confirmState = {
			open: true,
			title: 'Delete Musollah?',
			message: `Delete "${label}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				data.mosques = data.mosques.filter(m => m.id !== id);
				data = { ...data };
				await saveMosqueData(data);
				isDetailModalOpen = false;
				toast('success', 'Deleted');
			}
		};
	}

	function openDetail(item: MosqueEntry) {
		activeItem = item;
		isDetailModalOpen = true;
	}

	async function handleReset() {
		if (confirm('Reset all musollah data to sample?')) {
			data = await resetMosqueData();
			toast('success', 'Reset to sample data');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<Building2 class="w-7 h-7 text-green-700" />
				Musollahs
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">Manage musollahs displayed on the website.</p>
		</div>
		<div class="flex gap-2">
			<button onclick={handleReset} class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
				<RotateCcw class="w-4 h-4 text-gray-500" /><span class="hidden sm:inline">Reset</span>
			</button>
			<button onclick={() => openForm()} class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-green-700 text-white hover:bg-green-800 transition-all shadow-sm">
				<Plus class="w-4 h-4" /><span>Add Musollah</span>
			</button>
		</div>
	</div>

	<div class="relative">
		<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
		<input type="text" placeholder="Search musollahs..." bind:value={searchQuery} class="w-full bg-white border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
	</div>

	{#if displayedItems.length === 0}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto"><Building2 class="w-6 h-6" /></div>
			<h3 class="text-base font-semibold text-green-950">No Musollahs Found</h3>
			<p class="text-xs text-gray-500">No musollahs match your search.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each displayedItems as item (item.id)}
				<button
					onclick={() => openDetail(item)}
					class="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-green-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
				>
					{#if item.images && item.images.length > 0}
						<div class="w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-100">
							<img src={item.images[0]} alt={item.label} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
						</div>
					{/if}
					<h4 class="text-sm font-bold text-green-950 group-hover:text-green-700 transition-colors">{item.label}</h4>
					<p class="text-[11px] text-gray-500 flex items-center gap-1 mt-1"><MapPinned class="w-3 h-3 shrink-0" />{item.address}</p>
					{#if item.description}
						<p class="text-[11px] text-gray-400 mt-2 line-clamp-2">{item.description}</p>
					{/if}
					{#if item.images && item.images.length > 1}
						<p class="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Image class="w-3 h-3" />{item.images.length} images</p>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

{#if isFormOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<h3 class="text-base font-bold text-green-950">{editingId ? 'Edit Musollah' : 'Add Musollah'}</h3>
				<button onclick={closeForm} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			<div class="space-y-3">
				<div>
					<label for="m-label" class="block text-[11px] font-semibold text-gray-700 mb-1">Name *</label>
					<input id="m-label" type="text" bind:value={formLabel} placeholder="e.g. Central Mosque" class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
				<div>
					<label for="m-address" class="block text-[11px] font-semibold text-gray-700 mb-1">Address *</label>
					<input id="m-address" type="text" bind:value={formAddress} placeholder="e.g. Central Mosque, OAU." class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
				<div>
					<label for="m-desc" class="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
					<textarea id="m-desc" rows="3" bind:value={formDescription} placeholder="A short description..." class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
				</div>
				<div>
					<label for="m-url" class="block text-[11px] font-semibold text-gray-700 mb-1">Google Maps URL</label>
					<input id="m-url" type="url" bind:value={formUrl} placeholder="https://maps.google.com/..." class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>

				<!-- Image Upload -->
				<div>
					<label class="block text-[11px] font-semibold text-gray-700 mb-1">Images (auto-compressed to 3MB, up to {MAX_IMAGE_COUNT} images)</label>
					{#if formImages.length > 0}
						<p class="text-[11px] text-gray-400 mb-1">{formImages.length}/{MAX_IMAGE_COUNT} uploaded</p>
						<div class="grid grid-cols-3 gap-2 mb-2">
							{#each formImages as img, i}
								<div class="relative rounded-lg overflow-hidden h-20 bg-gray-100 border border-gray-200">
									<img src={img} alt="Mosque image" class="w-full h-full object-cover" />
									<button type="button" onclick={() => removeImage(i)} class="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"><X class="w-3 h-3" /></button>
								</div>
							{/each}
						</div>
					{/if}
					<label class={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl px-3 py-3 cursor-pointer transition-colors ${formImages.length >= MAX_IMAGE_COUNT ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : imageUploading ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-green-50/50'}`}>
						{#if imageUploading}
							<div class="animate-spin w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full"></div>
							<span class="text-gray-500 text-xs">Uploading...</span>
						{:else}
							<Upload class="w-4 h-4 text-gray-500" />
							<span class="text-gray-500 text-xs">{formImages.length >= MAX_IMAGE_COUNT ? `Maximum ${MAX_IMAGE_COUNT} images reached` : 'Upload Image'}</span>
						{/if}
						<input type="file" accept="image/*" class="hidden" onchange={handleFileUpload} disabled={imageUploading || formImages.length >= MAX_IMAGE_COUNT} />
					</label>
					{#if imageError}
						<p class="text-[11px] text-rose-600 mt-1">{imageError}</p>
					{/if}
				</div>
			</div>

			<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
				<button onclick={closeForm} class="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
				<button onclick={saveForm} class="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
					<Save class="w-3.5 h-3.5" /> {editingId ? 'Update' : 'Add'}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if isDetailModalOpen && activeItem}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-base font-bold text-green-950">{activeItem.label}</h3>
					<p class="text-[11px] text-gray-500 flex items-center gap-1"><MapPinned class="w-3 h-3" />{activeItem.address}</p>
				</div>
				<button onclick={() => (isDetailModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			{#if activeItem.images && activeItem.images.length > 0}
				<div class="rounded-xl overflow-hidden">
					<img src={activeItem.images[0]} alt={activeItem.label} class="w-full h-48 object-cover" />
				</div>
				{#if activeItem.images.length > 1}
					<div class="grid grid-cols-3 gap-2">
						{#each activeItem.images.slice(1, 4) as img}
							<div class="rounded-lg overflow-hidden h-20">
								<img src={img} alt={activeItem.label} class="w-full h-full object-cover" />
							</div>
						{/each}
					</div>
				{/if}
			{/if}

			{#if activeItem.description}
				<div class="bg-green-50/50 p-4 rounded-xl border border-green-100">
					<p class="text-xs text-gray-700 leading-relaxed">{activeItem.description}</p>
				</div>
			{/if}

			{#if activeItem.url}
				<a href={activeItem.url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-xs text-green-700 hover:text-green-800 font-semibold bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors">
					<MapPinned class="w-4 h-4" /> View on Maps
				</a>
			{/if}

			<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
				<button onclick={() => { isDetailModalOpen = false; openForm(activeItem!); }} class="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
					<Pencil class="w-4 h-4" />
				</button>
				<button onclick={() => deleteItem(activeItem!.id, activeItem!.label)} class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
					<Trash2 class="w-4 h-4" />
				</button>
				<div class="flex-1"></div>
				<button onclick={() => (isDetailModalOpen = false)} class="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Close</button>
			</div>
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
