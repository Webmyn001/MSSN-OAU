<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { loadLatestNewsData, saveLatestNewsData } from '$lib/stores/latestNewsStore';
	import type { LatestNewsData, LatestNews } from '$lib/data/sampleLatestNews';
	import {
		Newspaper,
		Search,
		X,
		Plus,
		Trash2,
		Eye,
		Pencil,
		Clock,
		Calendar,
		Loader2,
		ExternalLink,
		Save,
		Upload
	} from '@lucide/svelte';

	const API_BASE = 'http://localhost:3000';
	let cloudinaryCloudName = $state('your_cloud_name');
	let cloudinaryUploadPreset = $state('mssn_events');

	let data: LatestNewsData = $state({ items: [] });
	let isLoading = $state(true);
	let searchQuery = $state('');
	let filterCategory = $state('all');

	// Form state
	let isFormOpen = $state(false);
	let editingId = $state<string | null>(null);
	let formTitle = $state('');
	let formSummary = $state('');
	let formContent = $state('');
	let formImage = $state('');
	let formImage2 = $state('');
	let formDate = $state('');
	let formAuthor = $state('');
	let formCategory = $state('General');
	let imageUploading = $state(false);
	let image2Uploading = $state(false);
	let imagePreviewUrl = $state('');
	let imagePreviewUrl2 = $state('');
	let formLoading = $state(false);

	const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

	// Detail modal
	let isDetailModalOpen = $state(false);
	let activeItem = $state<LatestNews | null>(null);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	async function fetchCloudinaryConfig() {
		try {
			const res = await fetch(`${API_BASE}/public/events/config/cloudinary`);
			const json = await res.json();
			if (json.success && json.data) {
				if (json.data.cloudName) cloudinaryCloudName = json.data.cloudName;
				if (json.data.uploadPreset) cloudinaryUploadPreset = json.data.uploadPreset;
			}
		} catch {}
	}

	function compressImage(file: File, maxBytes: number): Promise<File> {
		return new Promise((resolve) => {
			if (file.size <= maxBytes) { resolve(file); return; }
			const img = new Image();
			const url = URL.createObjectURL(file);
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const scale = Math.sqrt(maxBytes / file.size) * 0.9;
				canvas.width = Math.round(img.width * scale);
				canvas.height = Math.round(img.height * scale);
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => {
					URL.revokeObjectURL(url);
					if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
					else resolve(file);
				}, 'image/jpeg', 0.8);
			};
			img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
			img.src = url;
		});
	}

	async function uploadImage(file: File): Promise<string> {
		const compressed = await compressImage(file, MAX_IMAGE_SIZE);
		const formData = new FormData();
		formData.append('file', compressed);
		formData.append('upload_preset', cloudinaryUploadPreset);
		const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
			method: 'POST',
			body: formData,
		});
		const json = await res.json();
		if (!json.secure_url) throw new Error(json.error?.message || 'Upload failed');
		return json.secure_url;
	}

	let fileInput = $state<HTMLInputElement | null>(null);
	let fileInput2 = $state<HTMLInputElement | null>(null);

	function bindFileInput(el: HTMLInputElement) {
		fileInput = el;
		el.onchange = async () => {
			const file = el.files?.[0];
			if (!file) return;
			const preview = URL.createObjectURL(file);
			queueMicrotask(() => { imagePreviewUrl = preview; imageUploading = true; });
			try {
				const url = await uploadImage(file);
				queueMicrotask(() => { formImage = url; imagePreviewUrl = ''; });
		} catch {
			queueMicrotask(() => { imagePreviewUrl = ''; toast('error', 'Image upload failed. Check Cloudinary credentials.'); });
			} finally {
				queueMicrotask(() => { imageUploading = false; });
			}
		};
	}

	function bindFileInput2(el: HTMLInputElement) {
		fileInput2 = el;
		el.onchange = async () => {
			const file = el.files?.[0];
			if (!file) return;
			const preview = URL.createObjectURL(file);
			queueMicrotask(() => { imagePreviewUrl2 = preview; image2Uploading = true; });
			try {
				const url = await uploadImage(file);
				queueMicrotask(() => { formImage2 = url; imagePreviewUrl2 = ''; });
		} catch {
			queueMicrotask(() => { imagePreviewUrl2 = ''; toast('error', 'Image upload failed.'); });
			} finally {
				queueMicrotask(() => { image2Uploading = false; });
			}
		};
	}

	function handleImageUpload() {
		fileInput?.click();
	}

	function handleImage2Upload() {
		fileInput2?.click();
	}

	function setFilterCategory(cat: string) {
		filterCategory = cat;
	}

	function closeDetailModal() {
		isDetailModalOpen = false;
	}

	function editFromDetail() {
		isDetailModalOpen = false;
		openForm(activeItem!);
	}

	onMount(async () => {
		data = await loadLatestNewsData();
		isLoading = false;
		fetchCloudinaryConfig();
	});

	const categories = ['General', 'Programme', 'Event Report', 'Announcement', 'Academic', 'Welfare'];

	const displayedItems = $derived(() => {
		let list = data.items;
		if (filterCategory !== 'all') {
			list = list.filter(i => i.category === filterCategory);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(i =>
				i.title.toLowerCase().includes(q) ||
				i.summary.toLowerCase().includes(q) ||
				(i.author && i.author.toLowerCase().includes(q))
			);
		}
		return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function openForm(item?: LatestNews) {
		imagePreviewUrl = '';
		imagePreviewUrl2 = '';
		if (item) {
			editingId = item.id;
			formTitle = item.title;
			formSummary = item.summary;
			formContent = item.content;
			formImage = item.image || '';
			formImage2 = item.image2 || '';
			formDate = item.date;
			formAuthor = item.author || '';
			formCategory = item.category || 'General';
		} else {
			editingId = null;
			formTitle = '';
			formSummary = '';
			formContent = '';
			formImage = '';
			formImage2 = '';
			formDate = new Date().toISOString().split('T')[0];
			formAuthor = '';
			formCategory = 'General';
		}
		isFormOpen = true;
	}

	function closeForm() {
		isFormOpen = false;
		editingId = null;
	}

	function clearImage1() {
		formImage = '';
		imagePreviewUrl = '';
	}

	function clearImage2() {
		formImage2 = '';
		imagePreviewUrl2 = '';
	}

	async function saveForm() {
		if (!formTitle.trim() || !formSummary.trim()) {
			toast('error', 'Title and summary are required');
			return;
		}
		if (!formImage.trim()) {
			toast('error', 'Main image is required');
			return;
		}

		const item: LatestNews = {
			id: editingId || `ln-${Date.now()}`,
			title: formTitle.trim(),
			summary: formSummary.trim(),
			content: formContent.trim(),
			image: formImage.trim(),
			image2: formImage2.trim() || undefined,
			date: formDate || new Date().toISOString().split('T')[0],
			author: formAuthor.trim() || undefined,
			category: formCategory
		};

		if (editingId) {
			data.items = data.items.map(i => i.id === editingId ? item : i);
		} else {
			data.items = [item, ...data.items];
		}

		data = { ...data };
		await saveLatestNewsData(data);
		toast('success', editingId ? 'News updated' : 'News published');
		closeForm();
	}

	async function deleteItem(id: string, title: string) {
		confirmState = {
			open: true,
			title: 'Delete News?',
			message: `Delete "${title}"? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				data.items = data.items.filter(i => i.id !== id);
				data = { ...data };
				await saveLatestNewsData(data);
				isDetailModalOpen = false;
				toast('success', 'Deleted');
			}
		};
	}

	function openDetail(item: LatestNews) {
		activeItem = item;
		isDetailModalOpen = true;
	}

</script>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<Newspaper class="w-7 h-7 text-green-700" />
				Latest News
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">Create and manage news items displayed on the homepage.</p>
		</div>
		<div class="flex gap-2">
			<button onclick={() => openForm()} class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-green-700 text-white hover:bg-green-800 transition-all shadow-sm">
				<Plus class="w-4 h-4" /><span>Add News</span>
			</button>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
		<div class="flex items-center gap-2 flex-wrap">
			{#each ['all', ...categories] as cat}
				<button
					onclick={() => setFilterCategory(cat)}
					class={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCategory === cat ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
				>
					{cat === 'all' ? 'All' : cat}
				</button>
			{/each}
		</div>
		<div class="relative flex-1">
			<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
			<input type="text" placeholder="Search title, summary, author..." bind:value={searchQuery} class="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
		</div>
	</div>

	<!-- Items -->
	{#if isLoading}
		<div class="flex items-center justify-center py-16">
			<div class="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
		</div>
	{:else if displayedItems().length === 0}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto"><Newspaper class="w-6 h-6" /></div>
			<h3 class="text-base font-semibold text-green-950">No News Found</h3>
			<p class="text-xs text-gray-500">No items match your current filters.</p>
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
							<div class="flex items-center gap-2 mb-1">
								<h4 class="text-sm font-bold text-green-950 line-clamp-1">{item.title}</h4>
								{#if item.category}
									<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 shrink-0">{item.category}</span>
								{/if}
							</div>
							<p class="text-xs text-gray-600 line-clamp-2">{item.summary}</p>
							<div class="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
								<span class="flex items-center gap-1"><Calendar class="w-3 h-3" />{formatDate(item.date)}</span>
								{#if item.author}<span>{item.author}</span>{/if}
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
				<h3 class="text-base font-bold text-green-950">{editingId ? 'Edit News' : 'Add Latest News'}</h3>
				<button onclick={closeForm} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			<div class="space-y-3">
				<div>
					<label for="ln-title" class="block text-[11px] font-semibold text-gray-700 mb-1">Title *</label>
					<input id="ln-title" type="text" bind:value={formTitle} placeholder="News title" class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
				<div>
					<label for="ln-summary" class="block text-[11px] font-semibold text-gray-700 mb-1">Summary *</label>
					<textarea id="ln-summary" rows="2" bind:value={formSummary} placeholder="Short summary" class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
				</div>
				<div>
					<label for="ln-content" class="block text-[11px] font-semibold text-gray-700 mb-1">Content (HTML)</label>
					<textarea id="ln-content" rows="5" bind:value={formContent} placeholder="<p>Full HTML content...</p>" class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 font-mono"></textarea>
				</div>

				<!-- Main Image (compulsory) -->
				<div>
					<label class="block text-[11px] font-semibold text-gray-700 mb-1">Main Image *</label>
					<input type="file" accept="image/*" use:bindFileInput class="hidden" />
					<div class="space-y-2">
						{#if imagePreviewUrl || formImage}
							<div class="relative rounded-xl overflow-hidden border border-gray-200 h-32">
								<img src={imagePreviewUrl || formImage} alt="Preview" class="w-full h-full object-cover" />
								{#if imageUploading}
									<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
										<div class="w-5 h-5 border-2 border-white border-t-green-400 rounded-full animate-spin"></div>
									</div>
								{:else}
									<button
										onclick={clearImage1}
										class="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-gray-600 hover:text-rose-600 text-xs"
									>Change</button>
								{/if}
							</div>
						{/if}
						<button
							onclick={handleImageUpload}
							disabled={imageUploading}
							class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-green-300 text-xs font-semibold text-green-700 hover:bg-green-50 transition-all disabled:opacity-50"
						>
							<Upload class="w-4 h-4" />
							{imageUploading ? 'Uploading...' : formImage ? 'Replace Image' : 'Upload Main Image'}
						</button>
					</div>
				</div>

				<!-- Second Image (optional) -->
				<div>
					<label class="block text-[11px] font-semibold text-gray-700 mb-1">Second Image (optional)</label>
					<input type="file" accept="image/*" use:bindFileInput2 class="hidden" />
					<div class="space-y-2">
						{#if imagePreviewUrl2 || formImage2}
							<div class="relative rounded-xl overflow-hidden border border-gray-200 h-32">
								<img src={imagePreviewUrl2 || formImage2} alt="Preview" class="w-full h-full object-cover" />
								{#if image2Uploading}
									<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
										<div class="w-5 h-5 border-2 border-white border-t-green-400 rounded-full animate-spin"></div>
									</div>
								{:else}
									<button
										onclick={clearImage2}
										class="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-gray-600 hover:text-rose-600 text-xs"
									>Remove</button>
								{/if}
							</div>
						{/if}
						<button
							onclick={handleImage2Upload}
							disabled={image2Uploading}
							class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
						>
							<Upload class="w-4 h-4" />
							{image2Uploading ? 'Uploading...' : formImage2 ? 'Replace Image' : 'Upload Second Image (optional)'}
						</button>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="ln-date" class="block text-[11px] font-semibold text-gray-700 mb-1">Date</label>
						<input id="ln-date" type="date" bind:value={formDate} class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
					</div>
					<div>
						<label for="ln-category" class="block text-[11px] font-semibold text-gray-700 mb-1">Category</label>
						<select id="ln-category" bind:value={formCategory} class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600">
							{#each categories as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>
				</div>
				<div>
					<label for="ln-author" class="block text-[11px] font-semibold text-gray-700 mb-1">Author</label>
					<input id="ln-author" type="text" bind:value={formAuthor} placeholder="e.g. Academic Committee" class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
				</div>
			</div>

			<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
				<button onclick={closeForm} class="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
				<button onclick={saveForm} disabled={formLoading || imageUploading || image2Uploading} class="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
					<Save class="w-3.5 h-3.5" /> {imageUploading || image2Uploading ? 'Uploading image...' : editingId ? 'Update' : 'Publish'}
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
					<p class="text-[11px] text-gray-500 flex items-center gap-1"><Calendar class="w-3 h-3" />{formatDate(activeItem.date)} {#if activeItem.author}<span class="mx-1">•</span>{activeItem.author}{/if}</p>
				</div>
				<button onclick={closeDetailModal} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			{#if activeItem.image}
				<div class="space-y-2">
					<img src={activeItem.image} alt={activeItem.title} class="w-full h-40 object-cover rounded-xl border border-gray-100" />
					{#if activeItem.image2}
						<img src={activeItem.image2} alt={`${activeItem.title} - second image`} class="w-full h-32 object-cover rounded-xl border border-gray-100" />
					{/if}
				</div>
			{/if}

			<div class="space-y-3">
				{#if activeItem.category}
					<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">{activeItem.category}</span>
				{/if}
				<div class="bg-green-50/50 p-4 rounded-xl border border-green-100">
					<p class="text-xs text-gray-600 font-semibold mb-1">Summary</p>
					<p class="text-xs text-gray-700">{activeItem.summary}</p>
				</div>
				{#if activeItem.content}
					<div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
						<p class="text-xs text-gray-600 font-semibold mb-1">Content</p>
						<div class="text-xs text-gray-700 prose prose-xs max-w-none">{@html activeItem.content}</div>
					</div>
				{/if}
			</div>

			<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
				<button onclick={editFromDetail} class="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
					<Pencil class="w-4 h-4" />
				</button>
				<button onclick={() => deleteItem(activeItem!.id, activeItem!.title)} class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
					<Trash2 class="w-4 h-4" />
				</button>
				<div class="flex-1"></div>
				<button onclick={closeDetailModal} class="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Close</button>
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
