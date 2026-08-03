<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import {
		Mail,
		Users,
		UserCheck,
		UserX,
		Search,
		X,
		Trash2,
		Eye,
		ExternalLink,
		Send,
		Newspaper,
		Loader2,
		Clock,
		Image,
		Link2,
		FileText
	} from '@lucide/svelte';

	type Subscriber = {
		id: string;
		email: string;
		name: string | null;
		isActive: boolean;
		subscribedAt: string;
		unsubscribedAt: string | null;
	};

	type Stats = {
		total: number;
		active: number;
		unsubscribed: number;
	};

	const API = 'http://localhost:3000/public/newsletter';

	let subscribers = $state<Subscriber[]>([]);
	let stats = $state<Stats>({ total: 0, active: 0, unsubscribed: 0 });
	let searchQuery = $state('');
	let isLoading = $state(true);

	// Broadcast state
	let broadcastSubject = $state('');
	let broadcastContent = $state('');
	let isBroadcasting = $state(false);
	let broadcastResult = $state<{ sent: number; failed: number } | null>(null);

	// News Alert state
	let newsTitle = $state('');
	let newsSummary = $state('');
	let newsImageUrl = $state('');
	let newsUrl = $state('');
	let isSendingNews = $state(false);
	let newsResult = $state<{ sent: number; failed: number } | null>(null);

	// Detail modal
	let isDetailModalOpen = $state(false);
	let activeSubscriber = $state<Subscriber | null>(null);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	async function fetchSubscribers() {
		isLoading = true;
		try {
			const res = await fetch(`${API}/subscribers`);
			const json = await res.json();
			if (json.success) {
				subscribers = json.data.subscribers;
				stats = json.data.stats;
			} else {
				toast('error', json.error || 'Failed to fetch subscribers');
			}
		} catch {
			toast('error', 'Could not connect to API server');
		} finally {
			isLoading = false;
		}
	}

	onMount(fetchSubscribers);

	const displayedSubscribers = $derived(() => {
		let list = subscribers;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				s => s.email.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q))
			);
		}
		return list;
	});

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-NG', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function openDetail(sub: Subscriber) {
		activeSubscriber = sub;
		isDetailModalOpen = true;
	}

	async function deleteSubscriber(id: string, email: string) {
		confirmState = {
			open: true,
			title: 'Delete Subscriber?',
			message: `Delete subscriber "${email}"? This cannot be undone.`,
			action: async () => {
				try {
					const res = await fetch(`${API}/subscribers/${id}`, { method: 'DELETE' });
					const json = await res.json();
					if (json.success) {
						subscribers = subscribers.filter(s => s.id !== id);
						stats.total--;
						if (activeSubscriber?.id === id) isDetailModalOpen = false;
						toast('success', `Deleted ${email}`);
					} else {
						toast('error', json.error || 'Failed to delete');
					}
				} catch {
					toast('error', 'Failed to delete subscriber');
				}
			}
		};
	}

	async function handleBroadcast() {
		if (!broadcastSubject.trim() || !broadcastContent.trim()) {
			toast('error', 'Subject and content are required');
			return;
		}
		isBroadcasting = true;
		broadcastResult = null;
		try {
			const res = await fetch(`${API}/send`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subject: broadcastSubject.trim(), content: broadcastContent.trim() })
			});
			const json = await res.json();
			if (json.success) {
				broadcastResult = { sent: json.data.sentCount, failed: json.data.failCount };
				toast('success', json.data.message);
				broadcastSubject = '';
				broadcastContent = '';
			} else {
				toast('error', json.error || 'Broadcast failed');
			}
		} catch {
			toast('error', 'Failed to send broadcast');
		} finally {
			isBroadcasting = false;
		}
	}

	async function handleNewsAlert() {
		if (!newsTitle.trim() || !newsSummary.trim()) {
			toast('error', 'Title and summary are required');
			return;
		}
		isSendingNews = true;
		newsResult = null;
		try {
			const res = await fetch(`${API}/broadcast-news`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: newsTitle.trim(),
					summary: newsSummary.trim(),
					imageUrl: newsImageUrl.trim() || undefined,
					url: newsUrl.trim() || undefined
				})
			});
			const json = await res.json();
			if (json.success) {
				newsResult = { sent: json.data.sentCount, failed: json.data.failCount };
				toast('success', json.data.message);
				newsTitle = '';
				newsSummary = '';
				newsImageUrl = '';
				newsUrl = '';
			} else {
				toast('error', json.error || 'News alert failed');
			}
		} catch {
			toast('error', 'Failed to send news alert');
		} finally {
			isSendingNews = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<Mail class="w-7 h-7 text-green-700" />
				Newsletter
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">Manage subscribers and send email broadcasts.</p>
		</div>
		<button onclick={fetchSubscribers} class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
			<Loader2 class="w-4 h-4 {isLoading ? 'animate-spin' : ''}" /><span class="hidden sm:inline">Refresh</span>
		</button>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-3 gap-3">
		<div class="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
			<p class="text-2xl font-extrabold text-green-950">{stats.total}</p>
			<p class="text-[11px] text-gray-500 font-medium">Total Subscribers</p>
		</div>
		<div class="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
			<p class="text-2xl font-extrabold text-green-700">{stats.active}</p>
			<p class="text-[11px] text-gray-500 font-medium">Active</p>
		</div>
		<div class="bg-white border border-rose-100 rounded-xl p-4 shadow-sm text-center">
			<p class="text-2xl font-extrabold text-rose-700">{stats.unsubscribed}</p>
			<p class="text-[11px] text-gray-500 font-medium">Unsubscribed</p>
		</div>
	</div>

	<!-- Broadcast & News Alert Forms -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<!-- Newsletter Broadcast -->
		<div class="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-4">
			<h3 class="text-sm font-bold text-green-950 flex items-center gap-2">
				<Send class="w-4 h-4 text-green-700" />
				Send Newsletter Broadcast
			</h3>
			<p class="text-[11px] text-gray-500">Send a custom email to all {stats.active} active subscribers.</p>

			<div class="space-y-3">
				<div>
					<label for="broadcast-subject" class="block text-[11px] font-semibold text-gray-700 mb-1">Subject</label>
					<input
						id="broadcast-subject"
						type="text"
						bind:value={broadcastSubject}
						placeholder="e.g. Ramadan Lecture Series 2025"
						class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
					/>
				</div>
				<div>
					<label for="broadcast-content" class="block text-[11px] font-semibold text-gray-700 mb-1">Content (HTML supported)</label>
					<textarea
						id="broadcast-content"
						rows="5"
						bind:value={broadcastContent}
						placeholder="<p>Assalamu 'alaykum,</p><p>We are excited to announce...</p>"
						class="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 font-mono"
					></textarea>
				</div>
				<button
					onclick={handleBroadcast}
					disabled={isBroadcasting}
					class="w-full px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
				>
					{#if isBroadcasting}
						<Loader2 class="w-4 h-4 animate-spin" /> Sending...
					{:else}
						<Send class="w-4 h-4" /> Broadcast to All Subscribers
					{/if}
				</button>
			</div>

			{#if broadcastResult}
				<div class="bg-green-50 border border-green-200 rounded-xl p-3 text-[11px] text-green-800">
					Sent: <strong>{broadcastResult.sent}</strong> | Failed: <strong>{broadcastResult.failed}</strong>
				</div>
			{/if}
		</div>

		<!-- News Alert -->
		<div class="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm space-y-4">
			<h3 class="text-sm font-bold text-green-950 flex items-center gap-2">
				<Newspaper class="w-4 h-4 text-amber-600" />
				Send News Alert
			</h3>
			<p class="text-[11px] text-gray-500">Notify subscribers when a new article or post is published.</p>

			<div class="space-y-3">
				<div>
					<label for="news-title" class="block text-[11px] font-semibold text-gray-700 mb-1">Title *</label>
					<input
						id="news-title"
						type="text"
						bind:value={newsTitle}
						placeholder="Article or news title"
						class="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
					/>
				</div>
				<div>
					<label for="news-summary" class="block text-[11px] font-semibold text-gray-700 mb-1">Summary *</label>
					<textarea
						id="news-summary"
						rows="3"
						bind:value={newsSummary}
						placeholder="Brief summary of the news..."
						class="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
					></textarea>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div>
						<label for="news-image" class="block text-[11px] font-semibold text-gray-700 mb-1">Image URL</label>
						<input
							id="news-image"
							type="url"
							bind:value={newsImageUrl}
							placeholder="https://..."
							class="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
						/>
					</div>
					<div>
						<label for="news-link" class="block text-[11px] font-semibold text-gray-700 mb-1">Article Link</label>
						<input
							id="news-link"
							type="url"
							bind:value={newsUrl}
							placeholder="https://..."
							class="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
						/>
					</div>
				</div>
				<button
					onclick={handleNewsAlert}
					disabled={isSendingNews}
					class="w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
				>
					{#if isSendingNews}
						<Loader2 class="w-4 h-4 animate-spin" /> Sending...
					{:else}
						<Newspaper class="w-4 h-4" /> Send News Alert
					{/if}
				</button>
			</div>

			{#if newsResult}
				<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
					Sent: <strong>{newsResult.sent}</strong> | Failed: <strong>{newsResult.failed}</strong>
				</div>
			{/if}
		</div>
	</div>

	<!-- Subscribers Search -->
	<div class="relative">
		<Search class="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
		<input
			type="text"
			placeholder="Search by name or email..."
			bind:value={searchQuery}
			class="w-full bg-white border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
		/>
	</div>

	<!-- Subscribers Table -->
	{#if isLoading}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<Loader2 class="w-8 h-8 text-green-700 animate-spin mx-auto" />
			<p class="text-xs text-gray-500">Loading subscribers...</p>
		</div>
	{:else if displayedSubscribers().length === 0}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
				<Users class="w-6 h-6" />
			</div>
			<h3 class="text-base font-semibold text-green-950">No Subscribers Found</h3>
			<p class="text-xs text-gray-500">No subscribers match your search.</p>
		</div>
	{:else}
		<div class="bg-white border border-green-100 rounded-2xl overflow-hidden shadow-sm">
			<div class="overflow-x-auto">
				<table class="w-full text-xs">
					<thead>
						<tr class="bg-green-50/80 border-b border-green-100 text-left">
							<th class="px-4 py-3 font-semibold text-green-900">Email</th>
							<th class="px-4 py-3 font-semibold text-green-900">Name</th>
							<th class="px-4 py-3 font-semibold text-green-900">Status</th>
							<th class="px-4 py-3 font-semibold text-green-900">Subscribed</th>
							<th class="px-4 py-3 font-semibold text-green-900 text-right">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each displayedSubscribers() as sub (sub.id)}
							<tr class="hover:bg-green-50/30 transition-colors">
								<td class="px-4 py-3 font-medium text-green-950 flex items-center gap-2">
									<Mail class="w-3.5 h-3.5 text-gray-400 shrink-0" />
									{sub.email}
								</td>
								<td class="px-4 py-3 text-gray-600">{sub.name || '—'}</td>
								<td class="px-4 py-3">
									{#if sub.isActive}
										<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 flex items-center gap-1 w-fit">
											<UserCheck class="w-3 h-3" /> Active
										</span>
									{:else}
										<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
											<UserX class="w-3 h-3" /> Unsubscribed
										</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-gray-500 flex items-center gap-1">
									<Clock class="w-3 h-3" /> {formatDate(sub.subscribedAt)}
								</td>
								<td class="px-4 py-3 text-right">
									<div class="flex items-center justify-end gap-1">
										<button onclick={() => openDetail(sub)} class="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-100 transition-colors" title="View">
											<Eye class="w-4 h-4" />
										</button>
										<a href="mailto:{sub.email}" class="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-100 transition-colors" title="Email">
											<ExternalLink class="w-4 h-4" />
										</a>
										<button onclick={() => deleteSubscriber(sub.id, sub.email)} class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-100 transition-colors" title="Delete">
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- Detail Modal -->
{#if isDetailModalOpen && activeSubscriber}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
			<div class="flex items-center justify-between pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-base font-bold text-green-950">{activeSubscriber.name || 'Subscriber'}</h3>
					<p class="text-[11px] text-gray-500">{activeSubscriber.email}</p>
				</div>
				<button onclick={() => (isDetailModalOpen = false)} class="text-gray-400 hover:text-gray-700"><X class="w-5 h-5" /></button>
			</div>

			<div class="space-y-3">
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
						<p class="text-[10px] text-gray-400 font-medium">Status</p>
						{#if activeSubscriber.isActive}
							<span class="inline-flex items-center gap-1 text-green-700 font-semibold mt-1">
								<UserCheck class="w-3.5 h-3.5" /> Active
							</span>
						{:else}
							<span class="inline-flex items-center gap-1 text-rose-700 font-semibold mt-1">
								<UserX class="w-3.5 h-3.5" /> Unsubscribed
							</span>
						{/if}
					</div>
					<div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
						<p class="text-[10px] text-gray-400 font-medium">Subscribed</p>
						<p class="text-green-950 font-medium mt-1">{formatDate(activeSubscriber.subscribedAt)}</p>
					</div>
				</div>

				{#if activeSubscriber.unsubscribedAt}
					<div class="bg-rose-50 p-3 rounded-lg border border-rose-100 text-xs text-rose-800">
						Unsubscribed: {formatDate(activeSubscriber.unsubscribedAt)}
					</div>
				{/if}

				<div class="bg-green-50/50 p-3 rounded-lg border border-green-100 text-xs text-green-800 flex items-center gap-2">
					<Mail class="w-4 h-4 shrink-0" />
					<span>{activeSubscriber.email}</span>
				</div>
			</div>

			<div class="flex items-center gap-2 pt-3 border-t border-gray-100">
				<a href="mailto:{activeSubscriber.email}" class="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors" title="Email">
					<Mail class="w-4 h-4" />
				</a>
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
