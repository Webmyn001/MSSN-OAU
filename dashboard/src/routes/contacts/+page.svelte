<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { loadContactData, saveContactData, type ContactData, type ContactEntry } from '$lib/stores/contactStore';
	import {
		Mail,
		Save,
		Search,
		X,
		Phone,
		MessageSquareText,
		Eye,
		Reply,
		Trash2,
		StickyNote,
		Check,
		Clock
	} from '@lucide/svelte';

	let contactData: ContactData = $state({ entries: [] });
	let searchQuery = $state('');
	let filterStatus = $state<'all' | 'new' | 'read' | 'replied'>('all');
	const contactFilterOptions = ['all', 'new', 'read', 'replied'] as const;

	let isSaving = $state(false);

	let isDetailModalOpen = $state(false);
	let activeEntry = $state<ContactEntry | null>(null);
	let noteText = $state('');

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	onMount(async () => {
		contactData = await loadContactData();
	});

	const displayedEntries = $derived.by(() => {
		let list = contactData.entries;
		if (filterStatus !== 'all') {
			list = list.filter((e) => e.status === filterStatus);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(e) =>
					e.fname.toLowerCase().includes(q) ||
					e.lname.toLowerCase().includes(q) ||
					e.message.toLowerCase().includes(q) ||
					(e.email && e.email.toLowerCase().includes(q))
			);
		}
		return [...list].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
	});

	const stats = $derived.by(() => ({
		total: contactData.entries.length,
		new: contactData.entries.filter((e) => e.status === 'new').length,
		read: contactData.entries.filter((e) => e.status === 'read').length,
		replied: contactData.entries.filter((e) => e.status === 'replied').length
	}));

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function openDetail(entry: ContactEntry) {
		activeEntry = entry;
		noteText = entry.notes || '';
		if (entry.status === 'new') {
			entry.status = 'read';
			contactData = { ...contactData };
			saveContactData(contactData);
		}
		isDetailModalOpen = true;
	}

	async function markReplied() {
		if (!activeEntry) return;
		const entry = contactData.entries.find((e) => e.id === activeEntry!.id);
		if (entry) {
			entry.status = 'replied';
			entry.notes = noteText.trim() || entry.notes;
			contactData = { ...contactData };
			await saveContactData(contactData);
			toast('success', `Marked as replied for ${entry.fname} ${entry.lname}`);
		}
		isDetailModalOpen = false;
	}

	async function saveNote() {
		if (!activeEntry) return;
		const entry = contactData.entries.find((e) => e.id === activeEntry!.id);
		if (entry) {
			entry.notes = noteText.trim() || undefined;
			contactData = { ...contactData };
			await saveContactData(contactData);
			toast('success', 'Note saved');
		}
	}

	async function deleteEntry(id: string, name: string) {
		confirmState = {
			open: true,
			title: 'Delete Contact Message?',
			message: `Delete the message from "${name}"? This cannot be undone.`,
			action: async () => {
				contactData.entries = contactData.entries.filter((e) => e.id !== id);
				contactData = { ...contactData };
				await saveContactData(contactData);
				isDetailModalOpen = false;
				toast('success', `Deleted message from ${name}`);
			}
		};
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'new': return 'bg-blue-100 text-blue-800';
			case 'read': return 'bg-amber-100 text-amber-800';
			case 'replied': return 'bg-green-100 text-green-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<Mail class="w-7 h-7 text-green-700" />
				Contact Messages
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">View and manage messages submitted through the Contact Us form.</p>
		</div>

	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		<div class="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
			<p class="text-2xl font-extrabold text-green-950">{stats.total}</p>
			<p class="text-[11px] text-gray-500 font-medium">Total Messages</p>
		</div>
		<div class="bg-white border border-blue-100 rounded-xl p-4 shadow-sm text-center">
			<p class="text-2xl font-extrabold text-blue-700">{stats.new}</p>
			<p class="text-[11px] text-gray-500 font-medium">New</p>
		</div>
		<div class="bg-white border border-amber-100 rounded-xl p-4 shadow-sm text-center">
			<p class="text-2xl font-extrabold text-amber-700">{stats.read}</p>
			<p class="text-[11px] text-gray-500 font-medium">Read</p>
		</div>
		<div class="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
			<p class="text-2xl font-extrabold text-green-700">{stats.replied}</p>
			<p class="text-[11px] text-gray-500 font-medium">Replied</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
		<div class="flex items-center gap-2 flex-wrap">
			{#each contactFilterOptions as status}
				<button
					onclick={() => filterStatus = status}
					class={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === status ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
				>
					{status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
					{#if status === 'all'}({stats.total}){:else}({stats[status as keyof typeof stats]}){/if}
				</button>
			{/each}
		</div>
		<div class="relative flex-1">
			<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
			<input type="text" placeholder="Search name, email, message…" bind:value={searchQuery} class="w-full bg-green-50/50 border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600" />
		</div>
	</div>

	<!-- Messages List -->
	{#if displayedEntries.length === 0}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto"><Mail class="w-6 h-6" /></div>
			<h3 class="text-base font-semibold text-green-950">No Messages Found</h3>
			<p class="text-xs text-gray-500">No messages match your current filters.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each displayedEntries as entry (entry.id)}
				<div
					role="button"
					tabindex="0"
					onclick={() => openDetail(entry)}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(entry); } }}
					class="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-green-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<h4 class="text-sm font-bold text-green-950">{entry.fname} {entry.lname}</h4>
								<span class={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(entry.status)}`}>
									{entry.status}
								</span>
							</div>
							<p class="text-xs text-gray-600 line-clamp-2">{entry.message}</p>
							<div class="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
								<span class="flex items-center gap-1"><Clock class="w-3 h-3" />{formatDate(entry.submittedAt)}</span>
								{#if entry.email}<span>{entry.email}</span>{/if}
								{#if entry.phone}<span class="flex items-center gap-1"><Phone class="w-3 h-3" />{entry.phone}</span>{/if}
							</div>
						</div>
						<div class="flex items-center gap-1 shrink-0">
							{#if entry.status === 'new'}
								<span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
							{/if}
							<button
								onclick={(e) => { e.stopPropagation(); deleteEntry(entry.id, `${entry.fname} ${entry.lname}`); }}
								class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
								title="Delete"
								aria-label={`Delete message from ${entry.fname} ${entry.lname}`}
							>
								<Trash2 class="w-4 h-4" />
							</button>
							<Eye class="w-4 h-4 text-gray-400" />
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if isDetailModalOpen && activeEntry}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-base font-bold text-green-950">{activeEntry.fname} {activeEntry.lname}</h3>
					<p class="text-[11px] text-gray-500">{formatDate(activeEntry.submittedAt)}</p>
				</div>
				<button onclick={() => (isDetailModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			<div class="space-y-3">
				<div class="bg-green-50/50 p-4 rounded-xl border border-green-100">
					<p class="text-xs text-gray-600 leading-relaxed">{activeEntry.message}</p>
				</div>

				<div class="grid grid-cols-2 gap-2 text-xs">
					{#if activeEntry.phone}
						<a href={`tel:${activeEntry.phone}`} class="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-green-700 hover:bg-green-50 transition-colors font-medium">
							<Phone class="w-3.5 h-3.5" /> Call {activeEntry.phone}
						</a>
					{/if}
					{#if activeEntry.phone}
						<a href={`https://wa.me/${activeEntry.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-green-700 hover:bg-green-50 transition-colors font-medium">
							<MessageSquareText class="w-3.5 h-3.5" /> WhatsApp
						</a>
					{/if}
					{#if activeEntry.email}
						<a href={`mailto:${activeEntry.email}`} class="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-green-700 hover:bg-green-50 transition-colors font-medium col-span-2">
							<Mail class="w-3.5 h-3.5" /> {activeEntry.email}
						</a>
					{/if}
				</div>

				<div>
					<label for="note-input" class="block text-[11px] font-semibold text-gray-700 mb-1">Internal Notes</label>
					<div class="flex gap-2">
						<textarea id="note-input" rows="2" bind:value={noteText} placeholder="Add a note…" class="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
						<button onclick={saveNote} class="self-end px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"><StickyNote class="w-4 h-4" /></button>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
				<button onclick={() => deleteEntry(activeEntry!.id, `${activeEntry!.fname} ${activeEntry!.lname}`)} class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Delete">
					<Trash2 class="w-4 h-4" />
				</button>
				<div class="flex-1"></div>
				<button onclick={() => (isDetailModalOpen = false)} class="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Close</button>
				<button onclick={markReplied} class="px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
					<Check class="w-3.5 h-3.5" /> Mark Replied
				</button>
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
