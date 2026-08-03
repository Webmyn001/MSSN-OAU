<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { loadPressReleaseLinks, savePressReleaseLinks, resetPressReleaseLinks } from '$lib/stores/pressReleaseLinkStore';
	import type { PressReleaseLinkData, PressReleaseLink } from '$lib/data/samplePressReleaseLinks';
	import {
		Link,
		RotateCcw,
		Search,
		X,
		Plus,
		Trash2,
		Eye,
		Pencil,
		Calendar,
		ExternalLink,
		Save
	} from '@lucide/svelte';

	let data: PressReleaseLinkData = $state({ links: [] });
	let searchQuery = $state('');

	// Form state
	let isFormOpen = $state(false);
	let editingId = $state<string | null>(null);
	let formTitle = $state('');
	let formUrl = $state('');
	let formImage = $state('');
	let formDescription = $state('');
	let formDate = $state('');

	// Detail modal
	let isDetailModalOpen = $state(false);
	let activeItem = $state<PressReleaseLink | null>(null);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	onMount(() => {
		data = loadPressReleaseLinks();
	});

	const displayedItems = $derived(() => {
		let list = data.links;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(i =>
				i.title.toLowerCase().includes(q) ||
				i.description.toLowerCase().includes(q)
			);
		}
		return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function openForm(item?: PressReleaseLink) {
		if (item) {
			editingId = item.id;
			formTitle = item.title;
			formUrl = item.url;
			formImage = item.image || '';
			formDescription = item.description;
			formDate = item.date;
		} else {
			editingId = null;
			formTitle = '';
			formUrl = '';
			formImage = '';
			formDescription = '';
			formDate = new Date().toISOString().split('T')[0];
		}
		isFormOpen = true;
	}

	function closeForm() {
		isFormOpen = false;
		editingId = null;
	}

	async function saveForm() {
		if (!formTitle.trim() || !formUrl.trim() || !formDescription.trim()) {
			toast('error', 'Title, URL, and description are required');
			return;
		}

		const item: PressReleaseLink = {
			id: editingId || `prl-${Date.now()}`,
			title: formTitle.trim(),
			url: formUrl.trim(),
			image: formImage.trim() || undefined,
			description: formDescription.trim(),
			date: formDate || new Date().toISOString().split('T')[0]
		};

		if (editingId) {
			data.links = data.links.map(i => i.id === editingId ? item : i);
		} else {
			data.links = [item, ...data.links];
		}

		data = { ...data };
		await savePressReleaseLinks(data);
		toast('success', editingId ? 'Press release updated' : 'Press release added');
		closeForm();
	}

	async function deleteItem(id: string, title: string) {
		confirmState = {
			open: true,
			title: 'Delete Press Release?',
			message: `Delete "${title}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				data.links = data.links.filter(i => i.id !== id);
				data = { ...data };
				await savePressReleaseLinks(data);
				isDetailModalOpen = false;
				toast('success', 'Deleted');
			}
		};
	}

	function openDetail(item: PressReleaseLink) {
		activeItem = item;
		isDetailModalOpen = true;
	}

	async function handleReset() {
		if (confirm('Reset all press release links to sample data?')) {
			data = await resetPressReleaseLinks();
			toast('success', 'Reset to sample data');
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<Link class="w-7 h-7 text-green-700" />
				Press Releases
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">Manage blog post links displayed on the homepage.</p>
		</div>
		<div class="flex gap-2">
			<button onclick={handleReset} class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
				<RotateCcw class="w-4 h-4 text-gray-500" /><span class="hidden sm:inline">Reset</span>
			</button>
			<button onclick={() => openForm()} class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-green-700 text-white hover:bg-green-800 transition-all shadow-sm">
				<Plus class="w-4 h-4" /><span>Add Press Release</span>
			</button>
		</div>
	</div>

	<!-- Search -->
	<div class="relative">
		<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
		<input type="text" placeholder="Search press releases..." bind:value={searchQuery} class="w-full bg-white border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
	</div>

	<!-- Items -->
	{#if displayedItems().length === 0}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto"><Link class="w-6 h-6" /></div>
			<h3 class="text-base font-semibold text-green-950">No Press Releases</h3>
			<p class="text-xs text-gray-500">No items match your search.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each displayedItems() as item (item.id)}
				<button
					onclick={() => openDetail(item)}
					class="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-green-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
				>
					<div class="flex items-start gap-3">
						{#if item.image}
							<div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
								<img src={item.image} alt={item.title} class="w-full h-full object-cover" />
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<h4 class="text-sm font-bold text-green-950 line-clamp-1">{item.title}</h4>
							<p class="text-xs text-gray-600 line-clamp-2 mt-1">{item.description}</p>
							<div class="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
								<span class="flex items-center gap-1"><Calendar class="w-3 h-3" />{formatDate(item.date)}</span>
								<span class="flex items-center gap-1 text-green-700 truncate"><ExternalLink class="w-3 h-3" />{item.url}</span>
							</div>
						</div>
						<div class="flex items-center gap-1 shrink-0">
							<Eye class="w-4 h-4 text-gray-400" />
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Form Modal -->
{#if isFormOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<h3 class="text-base font-bold text-green-950">{editingId ? 'Edit Press Release' : 'Add Press Release'}</h3>
				<button onclick={closeForm} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			<div class="space-y-3">
				<div>
					<label for="prl-title" class="block text-[11px] font-semibold text-gray-700 mb-1">Title *</label>
					<input id="prl-title" type="text" bind:value={formTitle} placeholder="Blog post title" class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
				<div>
					<label for="prl-url" class="block text-[11px] font-semibold text-gray-700 mb-1">Article URL *</label>
					<input id="prl-url" type="url" bind:value={formUrl} placeholder="https://annuurpress.org.ng/..." class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
				<div>
					<label for="prl-image" class="block text-[11px] font-semibold text-gray-700 mb-1">Image URL</label>
					<input id="prl-image" type="url" bind:value={formImage} placeholder="https://..." class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
				<div>
					<label for="prl-desc" class="block text-[11px] font-semibold text-gray-700 mb-1">Short Description *</label>
					<textarea id="prl-desc" rows="3" bind:value={formDescription} placeholder="A brief description of the blog post..." class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
				</div>
				<div>
					<label for="prl-date" class="block text-[11px] font-semibold text-gray-700 mb-1">Date</label>
					<input id="prl-date" type="date" bind:value={formDate} class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
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

<!-- Detail Modal -->
{#if isDetailModalOpen && activeItem}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-base font-bold text-green-950">{activeItem.title}</h3>
					<p class="text-[11px] text-gray-500 flex items-center gap-1"><Calendar class="w-3 h-3" />{formatDate(activeItem.date)}</p>
				</div>
				<button onclick={() => (isDetailModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			{#if activeItem.image}
				<img src={activeItem.image} alt={activeItem.title} class="w-full h-40 object-cover rounded-xl" />
			{/if}

			<div class="space-y-3">
				<div class="bg-green-50/50 p-4 rounded-xl border border-green-100">
					<p class="text-xs text-gray-600 leading-relaxed">{activeItem.description}</p>
				</div>
				<a href={activeItem.url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-xs text-green-700 hover:text-green-800 font-semibold bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors">
					<ExternalLink class="w-4 h-4" /> View Article
				</a>
			</div>

			<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
				<button onclick={() => { isDetailModalOpen = false; openForm(activeItem!); }} class="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
					<Pencil class="w-4 h-4" />
				</button>
				<button onclick={() => deleteItem(activeItem!.id, activeItem!.title)} class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
					<Trash2 class="w-4 h-4" />
				</button>
				<div class="flex-1"></div>
				<a href={activeItem.url} target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
					<ExternalLink class="w-3.5 h-3.5" /> Visit
				</a>
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
