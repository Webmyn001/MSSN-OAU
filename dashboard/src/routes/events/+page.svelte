<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { 
		Calendar, MapPin, Ticket, Plus, Edit2, Trash2, Users, CheckCircle2,
		Clock, XCircle, Eye, EyeOff, ChevronRight, Upload, X, Search,
		ArrowLeft, UserCheck, QrCode, RefreshCw
	} from '@lucide/svelte';

	const API_BASE = 'http://localhost:3000';
	let cloudinaryCloudName = $state('your_cloud_name');
	let cloudinaryUploadPreset = $state('mssn_events');

	// ── Types ──────────────────────────────────────────────────────────────────
	type EventStatus = 'upcoming' | 'ongoing' | 'past';
	type TicketStatus = 'PENDING' | 'CONFIRMED' | 'USED' | 'CANCELLED';

	interface AppEvent {
		id: string;
		title: string;
		description: string | null;
		startDate: string;
		endDate: string;
		venue: string | null;
		imageUrl: string | null;
		ticketPrice: string;
		maxTickets: number | null;
		ticketsSold: number;
		isPublic: boolean;
		createdAt: string;
		stats?: { totalRegistered: number; confirmed: number; checkedIn: number };
	}

	interface Attendee {
		id: string;
		ticketCode: string;
		attendeeName: string | null;
		attendeeEmail: string | null;
		attendeePhone: string | null;
		quantity: number;
		totalAmount: string;
		status: TicketStatus;
		purchasedAt: string | null;
		usedAt: string | null;
		createdAt: string;
	}

	// ── State ──────────────────────────────────────────────────────────────────
	let events: AppEvent[] = $state([]);
	let isLoading = $state(true);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	// View state
	let activeView: 'list' | 'create' | 'edit' | 'attendees' = $state('list');
	let selectedEvent: AppEvent | null = $state(null);
	let attendees: Attendee[] = $state([]);
	let attendeesLoading = $state(false);
	let searchQuery = $state('');

	// Form state
	let form = $state({
		title: '',
		description: '',
		startDate: '',
		endDate: '',
		venue: '',
		imageUrl: '',
		maxTickets: '',
		isPublic: true,
	});
	let formLoading = $state(false);
	let imageUploading = $state(false);
	let imagePreviewUrl = $state('');

	const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

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
					if (blob) {
						resolve(new File([blob], file.name, { type: 'image/jpeg' }));
					} else {
						resolve(file);
					}
				}, 'image/jpeg', 0.8);
			};
			img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
			img.src = url;
		});
	}

	// Filter state
	let filterStatus: 'all' | 'upcoming' | 'past' = $state('all');

	// ── Computed ───────────────────────────────────────────────────────────────
	const filteredEvents = $derived(() => {
		const now = new Date();
		return events.filter(e => {
			const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || (e.venue || '').toLowerCase().includes(searchQuery.toLowerCase());
			if (!matchSearch) return false;
			if (filterStatus === 'all') return true;
			const start = new Date(e.startDate);
			if (filterStatus === 'upcoming') return start >= now;
			if (filterStatus === 'past') return start < now;
			return true;
		});
	});

	const totalStats = $derived(() => ({
		total: events.length,
		upcoming: events.filter(e => new Date(e.startDate) >= new Date()).length,
		totalRegistered: events.reduce((sum, e) => sum + (e.stats?.totalRegistered ?? 0), 0),
		totalCheckedIn: events.reduce((sum, e) => sum + (e.stats?.checkedIn ?? 0), 0),
	}));

	const filteredAttendees = $derived(() => {
		if (!searchQuery) return attendees;
		return attendees.filter(a =>
			a.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			a.attendeeEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			a.ticketCode.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});

	// ── Helpers ────────────────────────────────────────────────────────────────
	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-GB', {
			weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
		});
	}

	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
	}

	function getEventStatus(event: AppEvent): EventStatus {
		const now = new Date();
		const start = new Date(event.startDate);
		const end = new Date(event.endDate);
		if (now < start) return 'upcoming';
		if (now > end) return 'past';
		return 'ongoing';
	}

	function statusBadge(status: TicketStatus) {
		const map: Record<TicketStatus, { label: string; cls: string }> = {
			PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-800' },
			CONFIRMED: { label: 'Confirmed', cls: 'bg-blue-100 text-blue-800' },
			USED: { label: 'Checked In', cls: 'bg-green-100 text-green-800' },
			CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-800' },
		};
		return map[status];
	}

	function toDateTimeLocal(iso: string) {
		const d = new Date(iso);
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function nowDateTimeLocal() {
		const d = new Date();
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	async function fetchCloudinaryConfig() {
		try {
			const res = await fetch(`${API_BASE}/public/events/config/cloudinary`);
			const json = await res.json();
			if (json.success && json.data) {
				if (json.data.cloudName) cloudinaryCloudName = json.data.cloudName;
				if (json.data.uploadPreset) cloudinaryUploadPreset = json.data.uploadPreset;
			}
		} catch {
			// fallback to initial state
		}
	}

	// ── API Calls ──────────────────────────────────────────────────────────────
	async function loadEvents() {
		isLoading = true;
		fetchCloudinaryConfig();
		try {
			const res = await fetch(`${API_BASE}/public/events/admin`);
			const json = await res.json();
			if (json.success) {
				events = json.data.events;
			} else {
				toast('error', json.error || 'Failed to load events');
			}
		} catch {
			toast('error', 'Could not connect to the API server. Make sure it is running on port 3000.');
		} finally {
			isLoading = false;
		}
	}

	async function loadAttendees(eventId: string) {
		attendeesLoading = true;
		try {
			const res = await fetch(`${API_BASE}/public/events/${eventId}/attendees`);
			const json = await res.json();
			if (json.success) {
				attendees = json.data.attendees;
			}
		} catch {
			// ignore
		} finally {
			attendeesLoading = false;
		}
	}

	async function handleSubmit() {
		if (!form.title.trim()) { toast('error', 'Event title is required'); return; }
		if (!form.startDate) { toast('error', 'Start date is required'); return; }
		if (!form.endDate) { toast('error', 'End date is required'); return; }
		if (new Date(form.endDate) <= new Date(form.startDate)) { toast('error', 'End date must be after start date'); return; }

		formLoading = true;
		try {
			const payload = {
				title: form.title,
				description: form.description || null,
				startDate: new Date(form.startDate).toISOString(),
				endDate: new Date(form.endDate).toISOString(),
				venue: form.venue || null,
				imageUrl: form.imageUrl || null,
				ticketPrice: '0',
				maxTickets: form.maxTickets ? parseInt(form.maxTickets) : null,
				isPublic: form.isPublic,
			};

			const url = activeView === 'edit' && selectedEvent
				? `${API_BASE}/public/events/${selectedEvent.id}`
				: `${API_BASE}/public/events`;
			const method = activeView === 'edit' ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				await loadEvents();
				activeView = 'list';
				selectedEvent = null;
			} else {
				toast('error', json.error || 'Failed to save event');
			}
		} catch {
			toast('error', 'Network error. Please try again.');
		} finally {
			formLoading = false;
		}
	}

	async function deleteEvent(event: AppEvent) {
		confirmState = {
			open: true,
			title: 'Delete Event?',
			message: `Delete "${event.title}"? This will also remove all registrations and cannot be undone.`,
			action: async () => {
				try {
					const res = await fetch(`${API_BASE}/public/events/${event.id}`, { method: 'DELETE' });
					const json = await res.json();
					if (json.success) {
						await loadEvents();
					} else {
						toast('error', json.error || 'Failed to delete event');
					}
				} catch {
					toast('error', 'Network error');
				}
			}
		};
	}

	async function updateTicketStatus(eventId: string, ticketId: string, status: TicketStatus) {
		try {
			const res = await fetch(`${API_BASE}/public/events/${eventId}/attendees/${ticketId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status }),
			});
			const json = await res.json();
			if (json.success) {
				await loadAttendees(eventId);
				await loadEvents(); // Refresh stats
			} else {
				toast('error', json.error || 'Failed to update status');
			}
		} catch {
			toast('error', 'Network error');
		}
	}

	async function deleteAttendee(eventId: string, ticketId: string) {
		confirmState = {
			open: true,
			title: 'Remove Registration?',
			message: 'Remove this registration? This will also release the ticket slot and cannot be undone.',
			action: async () => {
				try {
					const res = await fetch(`${API_BASE}/public/events/${eventId}/attendees/${ticketId}`, { method: 'DELETE' });
					const json = await res.json();
					if (json.success) {
						await loadAttendees(eventId);
						await loadEvents();
					}
				} catch {
					toast('error', 'Network error');
				}
			}
		};
	}

	async function uploadImage(file: File) {
		if (!file) return;
		imagePreviewUrl = URL.createObjectURL(file);
		imageUploading = true;
		try {
			const compressed = await compressImage(file, MAX_IMAGE_SIZE);
			const formData = new FormData();
			formData.append('file', compressed);
			formData.append('upload_preset', cloudinaryUploadPreset);
			const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
				method: 'POST',
				body: formData,
			});
			const json = await res.json();
			if (json.secure_url) {
				URL.revokeObjectURL(imagePreviewUrl);
				imagePreviewUrl = '';
				form.imageUrl = json.secure_url;
			} else {
				toast('error', 'Image upload failed. Check your Cloudinary credentials in .env.');
			}
		} catch {
			toast('error', 'Image upload failed. Check your Cloudinary cloud name and upload preset in .env.');
		} finally {
			imageUploading = false;
		}
	}

	function startCreate() {
		form = { title: '', description: '', startDate: '', endDate: '', venue: '', imageUrl: '', maxTickets: '', isPublic: true };
		imagePreviewUrl = '';
		searchQuery = '';
		activeView = 'create';
	}

	function startEdit(event: AppEvent) {
		form = {
			title: event.title,
			description: event.description || '',
			startDate: toDateTimeLocal(event.startDate),
			endDate: toDateTimeLocal(event.endDate),
			venue: event.venue || '',
			imageUrl: event.imageUrl || '',
			maxTickets: event.maxTickets ? String(event.maxTickets) : '',
			isPublic: event.isPublic,
		};
		imagePreviewUrl = '';
		selectedEvent = event;
		activeView = 'edit';
	}

	function viewAttendees(event: AppEvent) {
		selectedEvent = event;
		attendees = [];
		searchQuery = '';
		activeView = 'attendees';
		loadAttendees(event.id);
	}

	onMount(loadEvents);
</script>

<!-- ─── Page ─────────────────────────────────────────────────────────────────── -->
<div class="space-y-6">

	<!-- ─── List View ──────────────────────────────────────────────────────────── -->
	{#if activeView === 'list'}

		<!-- Header -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
			<div>
				<h2 class="text-2xl font-extrabold text-green-950">Events Management</h2>
				<p class="text-sm text-gray-500 mt-0.5">Create, manage and track event registrations</p>
			</div>
			<div class="flex items-center gap-3">
				<button onclick={loadEvents} class="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all" title="Refresh">
					<RefreshCw class="w-4 h-4" />
				</button>
				<button
					onclick={startCreate}
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow transition-all hover:scale-[1.02]"
				>
					<Plus class="w-4 h-4" />
					New Event
				</button>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<span class="text-xs font-semibold text-green-900">Total Events</span>
					<div class="p-2 rounded-xl bg-green-100 text-green-800"><Calendar class="w-4 h-4" /></div>
				</div>
				<p class="text-2xl font-extrabold text-green-950 mt-2">{totalStats().total}</p>
			</div>
			<div class="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<span class="text-xs font-semibold text-green-900">Upcoming</span>
					<div class="p-2 rounded-xl bg-amber-100 text-amber-800"><Clock class="w-4 h-4" /></div>
				</div>
				<p class="text-2xl font-extrabold text-green-950 mt-2">{totalStats().upcoming}</p>
			</div>
			<div class="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<span class="text-xs font-semibold text-green-900">Registrations</span>
					<div class="p-2 rounded-xl bg-blue-100 text-blue-800"><Users class="w-4 h-4" /></div>
				</div>
				<p class="text-2xl font-extrabold text-green-950 mt-2">{totalStats().totalRegistered}</p>
			</div>
			<div class="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<span class="text-xs font-semibold text-green-900">Checked In</span>
					<div class="p-2 rounded-xl bg-emerald-100 text-emerald-800"><UserCheck class="w-4 h-4" /></div>
				</div>
				<p class="text-2xl font-extrabold text-green-950 mt-2">{totalStats().totalCheckedIn}</p>
			</div>
		</div>

		<!-- Filters & Search -->
		<div class="flex flex-col sm:flex-row gap-3">
			<div class="relative flex-1">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					bind:value={searchQuery}
					placeholder="Search events..."
					class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
				/>
			</div>
			<div class="flex gap-2">
				{#each (['all', 'upcoming', 'past'] as const) as f}
					<button
						onclick={() => filterStatus = f}
						class={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${filterStatus === f ? 'bg-green-700 text-white border-green-700' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
					>
						{f.charAt(0).toUpperCase() + f.slice(1)}
					</button>
				{/each}
			</div>
		</div>

		<!-- Events List -->
		{#if isLoading}
			<div class="flex items-center justify-center py-16">
				<div class="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
			</div>
		{:else if filteredEvents().length === 0}
			<div class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
				<Calendar class="w-10 h-10 text-gray-300 mx-auto mb-3" />
				<p class="text-gray-500 font-medium">{events.length === 0 ? 'No events yet. Create your first event!' : 'No events match your search.'}</p>
				{#if events.length === 0}
					<button onclick={startCreate} class="mt-4 px-5 py-2 rounded-xl bg-green-700 text-white text-sm font-bold">Create Event</button>
				{/if}
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
				{#each filteredEvents() as event (event.id)}
					{@const status = getEventStatus(event)}
					<div class="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
						<!-- Image Banner -->
						{#if event.imageUrl}
							<div class="relative h-40 bg-gray-100 overflow-hidden">
								<img src={event.imageUrl} alt={event.title} class="w-full h-full object-cover" />
								<div class="absolute top-3 right-3 flex gap-2">
									<span class={`px-2 py-1 rounded-full text-xs font-bold ${
										status === 'upcoming' ? 'bg-green-100 text-green-800' :
										status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
										'bg-gray-100 text-gray-600'
									}`}>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</span>
									{#if !event.isPublic}
										<span class="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">Draft</span>
									{/if}
								</div>
							</div>
						{:else}
							<div class="relative h-24 bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
								<Calendar class="w-10 h-10 text-white/30" />
								<div class="absolute top-3 right-3 flex gap-2">
									<span class={`px-2 py-1 rounded-full text-xs font-bold ${
										status === 'upcoming' ? 'bg-green-100 text-green-800' :
										status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
										'bg-gray-100 text-gray-600'
									}`}>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</span>
								</div>
							</div>
						{/if}

						<div class="p-5 flex flex-col flex-1">
							<div class="flex items-start justify-between gap-2 mb-2">
								<h3 class="font-bold text-green-950 text-base leading-tight">{event.title}</h3>
								<span class="flex-shrink-0 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold">Free</span>
							</div>

							<div class="space-y-1.5 mb-4 text-xs text-gray-500">
								<div class="flex items-center gap-1.5">
									<Calendar class="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
									<span><span class="font-semibold text-gray-700">Start:</span> {formatDate(event.startDate)} at {formatTime(event.startDate)}</span>
								</div>
								<div class="flex items-center gap-1.5">
									<Calendar class="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
									<span><span class="font-semibold text-gray-700">End:</span> {formatDate(event.endDate)} at {formatTime(event.endDate)}</span>
								</div>
								{#if event.venue}
									<div class="flex items-center gap-1.5">
										<MapPin class="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
										<span>{event.venue}</span>
									</div>
								{/if}
							</div>

							<!-- Per-Event Registration Stats -->
							{#if event.stats}
								<div class="grid grid-cols-3 gap-2 mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
									<div class="text-center">
										<p class="text-lg font-extrabold text-green-950">{event.stats.totalRegistered}</p>
										<p class="text-[10px] text-gray-500 font-medium">Registered</p>
									</div>
									<div class="text-center border-x border-green-200">
										<p class="text-lg font-extrabold text-blue-700">{event.stats.confirmed}</p>
										<p class="text-[10px] text-gray-500 font-medium">Confirmed</p>
									</div>
									<div class="text-center">
										<p class="text-lg font-extrabold text-emerald-700">{event.stats.checkedIn}</p>
										<p class="text-[10px] text-gray-500 font-medium">Checked In</p>
									</div>
								</div>
							{/if}

							{#if event.maxTickets}
								<div class="mb-4">
									<div class="flex justify-between text-xs text-gray-500 mb-1">
										<span>Capacity</span>
										<span>{event.ticketsSold}/{event.maxTickets}</span>
									</div>
									<div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
										<div
											class="h-full bg-green-500 rounded-full transition-all"
											style="width: {Math.min(100, (event.ticketsSold / event.maxTickets) * 100)}%"
										></div>
									</div>
								</div>
							{/if}

							<!-- Actions -->
							<div class="flex gap-2 mt-auto pt-2 border-t border-gray-100">
								<button
									onclick={() => viewAttendees(event)}
									class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 text-xs font-semibold transition-all"
								>
									<Users class="w-3.5 h-3.5" />
									Attendees
								</button>
								<button
									onclick={() => startEdit(event)}
									class="flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all"
									title="Edit"
								>
									<Edit2 class="w-4 h-4" />
								</button>
								<button
									onclick={() => deleteEvent(event)}
									class="flex items-center justify-center p-2 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 transition-all"
									title="Delete"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	<!-- ─── Create / Edit Form ──────────────────────────────────────────────────── -->
	{#if activeView === 'create' || activeView === 'edit'}
		<div>
			<button
				onclick={() => { activeView = 'list'; selectedEvent = null; }}
				class="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 mb-6"
			>
				<ArrowLeft class="w-4 h-4" />
				Back to Events
			</button>

			<div class="max-w-2xl">
				<h2 class="text-2xl font-extrabold text-green-950 mb-1">
					{activeView === 'edit' ? `Edit: ${selectedEvent?.title}` : 'Create New Event'}
				</h2>
				<p class="text-sm text-gray-500 mb-6">Fill in the details below. Upload a banner image or paste a direct URL.</p>

				<div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
					<!-- Title -->
					<div>
						<label class="block text-xs font-bold text-green-900 mb-1.5">Event Title *</label>
						<input
							bind:value={form.title}
							placeholder="e.g. Jihad Week 2025"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>

					<!-- Description -->
					<div>
						<label class="block text-xs font-bold text-green-900 mb-1.5">Description</label>
						<textarea
							bind:value={form.description}
							placeholder="Brief description of the event..."
							rows="3"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
						></textarea>
					</div>

					<!-- Dates -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-xs font-bold text-green-900 mb-1.5">Start Date & Time *</label>
							<input
								type="datetime-local"
								bind:value={form.startDate}
								min={nowDateTimeLocal()}
								class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
						<div>
							<label class="block text-xs font-bold text-green-900 mb-1.5">End Date & Time *</label>
							<input
								type="datetime-local"
								bind:value={form.endDate}
								min={form.startDate || nowDateTimeLocal()}
								class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>
					</div>

					<!-- Venue -->
					<div>
						<label class="block text-xs font-bold text-green-900 mb-1.5">Venue</label>
						<input
							bind:value={form.venue}
							placeholder="e.g. MSSN Secretariat, Fajuyi Hall"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>

					<!-- Capacity -->
					<div>
						<label class="block text-xs font-bold text-green-900 mb-1.5">Max Capacity (leave blank = unlimited)</label>
						<input
							type="number"
							min="1"
							bind:value={form.maxTickets}
							placeholder="e.g. 200"
							class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>

					<!-- Image Upload -->
					<div>
						<label class="block text-xs font-bold text-green-900 mb-1.5">Event Image</label>
						<div class="space-y-2">
							{#if imagePreviewUrl || form.imageUrl}
								<div class="relative rounded-xl overflow-hidden border border-gray-200 h-32">
									<img src={imagePreviewUrl || form.imageUrl} alt="Preview" class="w-full h-full object-cover" />
									{#if imageUploading}
										<div class="absolute inset-0 bg-black/40 flex items-center justify-center">
											<div class="w-5 h-5 border-2 border-white border-t-green-400 rounded-full animate-spin"></div>
										</div>
									{:else}
										<button
											onclick={() => { imagePreviewUrl = ''; form.imageUrl = ''; }}
											class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
										>
											<X class="w-3 h-3" />
										</button>
									{/if}
								</div>
							{:else}
								<label class="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 cursor-pointer bg-gray-50 hover:bg-green-50 transition-all">
									{#if imageUploading}
										<div class="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
										<span class="text-xs text-gray-400 mt-1">Uploading...</span>
									{:else}
										<Upload class="w-5 h-5 text-gray-400" />
										<span class="text-xs text-gray-400 mt-1">Click to upload a banner image (max 3 MB, auto-compressed)</span>
									{/if}
									<input
										type="file"
										accept="image/*"
										class="hidden"
										onchange={(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) uploadImage(f); }}
									/>
								</label>
							{/if}
							{#if !imagePreviewUrl && !form.imageUrl}
							<input
								bind:value={form.imageUrl}
								placeholder="Or paste a direct image URL"
								class="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
							{/if}
						</div>
					</div>

					<!-- Visibility -->
					<div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-gray-100">
						<div>
							<p class="text-sm font-bold text-green-950">Public Event</p>
							<p class="text-xs text-gray-500">Visible on the marketing website</p>
						</div>
						<button
							onclick={() => form.isPublic = !form.isPublic}
							class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isPublic ? 'bg-green-600' : 'bg-gray-300'}`}
						>
							<span class={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isPublic ? 'translate-x-6' : 'translate-x-1'}`}></span>
						</button>
					</div>

					<!-- Submit -->
					<div class="flex gap-3 pt-2">
						<button
							onclick={() => { activeView = 'list'; selectedEvent = null; }}
							class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
						>
							Cancel
						</button>
						<button
							onclick={handleSubmit}
							disabled={formLoading || imageUploading}
							class="flex-1 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{#if formLoading}
								<span class="flex items-center justify-center gap-2">
									<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Saving...
								</span>
							{:else if imageUploading}
								<span class="flex items-center justify-center gap-2">
									<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									Uploading image...
								</span>
							{:else}
								{activeView === 'edit' ? 'Update Event' : 'Create Event'}
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- ─── Attendees View ──────────────────────────────────────────────────────── -->
	{#if activeView === 'attendees' && selectedEvent}
		<div>
			<button
				onclick={() => { activeView = 'list'; selectedEvent = null; attendees = []; searchQuery = ''; }}
				class="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900 mb-6"
			>
				<ArrowLeft class="w-4 h-4" />
				Back to Events
			</button>

			<!-- Event Summary -->
			<div class="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<p class="text-green-200 text-xs font-medium mb-1">Managing Attendees for</p>
					<h2 class="text-xl font-extrabold">{selectedEvent.title}</h2>
					<p class="text-green-200 text-xs mt-1">{formatDate(selectedEvent.startDate)} • {selectedEvent.venue || 'No venue set'}</p>
				</div>
				<div class="flex gap-6">
					<div class="text-center">
						<p class="text-2xl font-extrabold">{selectedEvent.stats?.totalRegistered ?? attendees.length}</p>
						<p class="text-green-200 text-xs">Registered</p>
					</div>
					<div class="text-center">
						<p class="text-2xl font-extrabold text-amber-300">{selectedEvent.stats?.confirmed ?? 0}</p>
						<p class="text-green-200 text-xs">Confirmed</p>
					</div>
					<div class="text-center">
						<p class="text-2xl font-extrabold text-emerald-300">{selectedEvent.stats?.checkedIn ?? 0}</p>
						<p class="text-green-200 text-xs">Checked In</p>
					</div>
				</div>
			</div>

			<!-- Search -->
			<div class="relative mb-4">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
				<input
					bind:value={searchQuery}
					placeholder="Search attendees by name, email or ticket code..."
					class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
				/>
			</div>

			{#if attendeesLoading}
				<div class="flex items-center justify-center py-16">
					<div class="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
				</div>
			{:else if filteredAttendees().length === 0}
				<div class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
					<Users class="w-10 h-10 text-gray-300 mx-auto mb-3" />
					<p class="text-gray-500">{attendees.length === 0 ? 'No registrations yet.' : 'No attendees match your search.'}</p>
				</div>
			{:else}
				<!-- Desktop Table -->
				<div class="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-slate-50 border-b border-gray-100">
								<th class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Attendee</th>
								<th class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Ticket Code</th>
								<th class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</th>
								<th class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
								<th class="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Registered</th>
								<th class="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-50">
							{#each filteredAttendees() as attendee (attendee.id)}
								{@const badge = statusBadge(attendee.status)}
								<tr class="hover:bg-slate-50 transition-colors">
									<td class="px-4 py-3">
										<div>
											<p class="font-semibold text-gray-900">{attendee.attendeeName || 'N/A'}</p>
											<p class="text-xs text-gray-400">{attendee.attendeeEmail || ''}</p>
											{#if attendee.attendeePhone}
												<p class="text-xs text-gray-400">{attendee.attendeePhone}</p>
											{/if}
										</div>
									</td>
									<td class="px-4 py-3">
										<code class="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{attendee.ticketCode}</code>
									</td>
									<td class="px-4 py-3">
										<span class="font-semibold text-green-800">
											{parseFloat(attendee.totalAmount) === 0 ? 'Free' : `₦${parseFloat(attendee.totalAmount).toLocaleString()}`}
										</span>
									</td>
									<td class="px-4 py-3">
										<span class={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
									</td>
									<td class="px-4 py-3 text-xs text-gray-400">
										{attendee.createdAt ? new Date(attendee.createdAt).toLocaleDateString('en-GB') : 'N/A'}
									</td>
									<td class="px-4 py-3">
										<div class="flex items-center justify-end gap-1">
											{#if attendee.status === 'PENDING'}
												<button
													onclick={() => updateTicketStatus(selectedEvent!.id, attendee.id, 'CONFIRMED')}
													class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all"
													title="Confirm Payment"
												>
													Confirm
												</button>
											{/if}
											{#if attendee.status === 'CONFIRMED'}
												<button
													onclick={() => updateTicketStatus(selectedEvent!.id, attendee.id, 'USED')}
													class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-all"
													title="Check In"
												>
													Check In
												</button>
											{/if}
											{#if attendee.status !== 'CANCELLED' && attendee.status !== 'USED'}
												<button
													onclick={() => updateTicketStatus(selectedEvent!.id, attendee.id, 'CANCELLED')}
													class="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
													title="Cancel"
												>
													<XCircle class="w-4 h-4" />
												</button>
											{/if}
											<button
												onclick={() => deleteAttendee(selectedEvent!.id, attendee.id)}
												class="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-600 transition-all"
												title="Remove"
											>
												<Trash2 class="w-4 h-4" />
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Mobile Cards -->
				<div class="md:hidden space-y-3">
					{#each filteredAttendees() as attendee (attendee.id)}
						{@const badge = statusBadge(attendee.status)}
						<div class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
							<div class="flex items-start justify-between mb-3">
								<div>
									<p class="font-bold text-gray-900">{attendee.attendeeName || 'N/A'}</p>
									<p class="text-xs text-gray-400">{attendee.attendeeEmail || ''}</p>
								</div>
								<span class={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
							</div>
							<div class="flex items-center justify-between text-xs text-gray-500 mb-3">
								<code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{attendee.ticketCode}</code>
								<span class="font-semibold text-green-800">
									{parseFloat(attendee.totalAmount) === 0 ? 'Free' : `₦${parseFloat(attendee.totalAmount).toLocaleString()}`}
								</span>
							</div>
							<div class="flex gap-2 pt-2 border-t border-gray-50">
								{#if attendee.status === 'PENDING'}
									<button onclick={() => updateTicketStatus(selectedEvent!.id, attendee.id, 'CONFIRMED')} class="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">Confirm Payment</button>
								{/if}
								{#if attendee.status === 'CONFIRMED'}
									<button onclick={() => updateTicketStatus(selectedEvent!.id, attendee.id, 'USED')} class="flex-1 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">✓ Check In</button>
								{/if}
								<button onclick={() => deleteAttendee(selectedEvent!.id, attendee.id)} class="py-1.5 px-3 rounded-lg bg-red-50 text-red-500 text-xs font-bold">Remove</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

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
