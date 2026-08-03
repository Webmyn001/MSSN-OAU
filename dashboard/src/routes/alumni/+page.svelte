<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { loadAlumniData, saveAlumniData, fetchAlumniDataFromApi } from '$lib/stores/alumniStore';
	import type { AlumniData, Alumnus } from '$lib/data/sampleAlumni';
	import {
		GraduationCap,
		Plus,
		Edit,
		Trash2,
		Save,
		UserPlus,
		X
	} from '@lucide/svelte';

	let alumniData: AlumniData = $state({ sessions: [] });
	let isSaving = $state(false);

	// Confirm dialog state for destructive actions
	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	let isFormModalOpen = $state<boolean>(false);
	let editingSessionIdx = $state<number | null>(null);

	let formSession = $state<string>('');
	let ameerName = $state<string>('');
	let ameerDepartment = $state<string>('');
	let ameerPhone = $state<string>('');
	let ameerEmail = $state<string>('');
	let ameerCurrentRole = $state<string>('');
	let ameerCompany = $state<string>('');
	let ameerBio = $state<string>('');
	let ameerahName = $state<string>('');
	let ameerahDepartment = $state<string>('');
	let ameerahPhone = $state<string>('');
	let ameerahEmail = $state<string>('');
	let ameerahCurrentRole = $state<string>('');
	let ameerahCompany = $state<string>('');
	let ameerahBio = $state<string>('');

	const currentYear = new Date().getFullYear();
	const sessionOptions = $derived.by(() => {
		const options: string[] = [];
		for (let y = currentYear + 1; y >= 2015; y--) {
			options.push(`${y}/${y + 1}`);
		}
		return options;
	});

	onMount(async () => {
		alumniData = loadAlumniData();
		const remoteData = await fetchAlumniDataFromApi();
		if (remoteData) {
			alumniData = remoteData;
		}
	});

	function getMemberPlaceholder(gender?: string) {
		if (gender === 'female') return '/images/user/female.jpg';
		return '/images/user/male.jpg';
	}

	function getAmeer(session: { members: Alumnus[] }): Alumnus | undefined {
		return session.members.find(m => m.position === 'Ameer');
	}

	function getAmeerah(session: { members: Alumnus[] }): Alumnus | undefined {
		return session.members.find(m => m.position === 'Ameerah');
	}

	function openAddSession() {
		editingSessionIdx = null;
		formSession = '';
		ameerName = ''; ameerDepartment = ''; ameerPhone = ''; ameerEmail = '';
		ameerCurrentRole = ''; ameerCompany = ''; ameerBio = '';
		ameerahName = ''; ameerahDepartment = ''; ameerahPhone = ''; ameerahEmail = '';
		ameerahCurrentRole = ''; ameerahCompany = ''; ameerahBio = '';
		isFormModalOpen = true;
	}

	function openEditSession(idx: number) {
		const s = alumniData.sessions[idx];
		if (!s) return;
		editingSessionIdx = idx;
		formSession = s.session;
		const ameer = getAmeer(s);
		const ameerah = getAmeerah(s);
		ameerName = ameer?.name || ''; ameerDepartment = ameer?.department || '';
		ameerPhone = ameer?.phone || ''; ameerEmail = ameer?.email || '';
		ameerCurrentRole = ameer?.currentRole || ''; ameerCompany = ameer?.company || '';
		ameerBio = ameer?.bio || '';
		ameerahName = ameerah?.name || ''; ameerahDepartment = ameerah?.department || '';
		ameerahPhone = ameerah?.phone || ''; ameerahEmail = ameerah?.email || '';
		ameerahCurrentRole = ameerah?.currentRole || ''; ameerahCompany = ameerah?.company || '';
		ameerahBio = ameerah?.bio || '';
		isFormModalOpen = true;
	}

	async function handleSave(e: Event) {
		e.preventDefault();
		if (!formSession.trim()) {
			toast('error', 'Session is required.');
			return;
		}
		if (!ameerName.trim() || !ameerahName.trim()) {
			toast('error', 'Both Ameer and Ameerah names are required.');
			return;
		}

		const dataCopy: AlumniData = JSON.parse(JSON.stringify(alumniData));

		const ameer: Alumnus = {
			id: `alumni-ameer-${formSession.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}`,
			name: ameerName.trim(),
			position: 'Ameer',
			gender: 'male',
			session: formSession.trim(),
			department: ameerDepartment.trim() || undefined,
			phone: ameerPhone.trim() || undefined,
			email: ameerEmail.trim() || undefined,
			currentRole: ameerCurrentRole.trim() || undefined,
			company: ameerCompany.trim() || undefined,
			bio: ameerBio.trim() || undefined
		};

		const ameerah: Alumnus = {
			id: `alumni-ameerah-${formSession.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}`,
			name: ameerahName.trim(),
			position: 'Ameerah',
			gender: 'female',
			session: formSession.trim(),
			department: ameerahDepartment.trim() || undefined,
			phone: ameerahPhone.trim() || undefined,
			email: ameerahEmail.trim() || undefined,
			currentRole: ameerahCurrentRole.trim() || undefined,
			company: ameerahCompany.trim() || undefined,
			bio: ameerahBio.trim() || undefined
		};

		if (editingSessionIdx !== null) {
			dataCopy.sessions[editingSessionIdx] = {
				session: formSession.trim(),
				start_year: parseInt(formSession.split('/')[0]) || new Date().getFullYear(),
				end_year: (parseInt(formSession.split('/')[0]) || new Date().getFullYear()) + 1,
				members: [ameer, ameerah]
			};
		} else {
			dataCopy.sessions.unshift({
				session: formSession.trim(),
				start_year: parseInt(formSession.split('/')[0]) || new Date().getFullYear(),
				end_year: (parseInt(formSession.split('/')[0]) || new Date().getFullYear()) + 1,
				members: [ameer, ameerah]
			});
		}

		alumniData = dataCopy;
		isFormModalOpen = false;

		isSaving = true;
		toast('success', 'Saving…');
		await saveAlumniData(alumniData);
		isSaving = false;
		const label = editingSessionIdx !== null ? 'Updated' : 'Added';
		toast('success', `${label} ${formSession} session.`);
	}

	async function handleDeleteSession(idx: number) {
		const s = alumniData.sessions[idx];
		if (!s) return;
		confirmState = {
			open: true,
			title: 'Delete Session?',
			message: `Delete the ${s.session} session and its Ameer/Ameerah? This will be synced to the marketing site and cannot be undone.`,
			action: async () => {
				const dataCopy: AlumniData = JSON.parse(JSON.stringify(alumniData));
				dataCopy.sessions.splice(idx, 1);
				alumniData = dataCopy;
				isSaving = true;
				toast('success', 'Deleting…');
				await saveAlumniData(alumniData);
				isSaving = false;
				toast('success', `Deleted ${s.session} session.`);
			}
		};
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<GraduationCap class="w-7 h-7 text-green-700" />
				Past Ameers & Ameerahs
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">
				Manage past Ameers and Ameerahs by academic session.
			</p>
		</div>

		<button
			onclick={openAddSession}
			class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all hover:scale-[1.02]"
		>
			<Plus class="w-4 h-4" />
			<span>Add Session</span>
		</button>
	</div>

	{#if alumniData.sessions.length === 0}
		<div class="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
			<div class="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
				<GraduationCap class="w-6 h-6" />
			</div>
			<h3 class="text-base font-semibold text-green-950">No Sessions Added Yet</h3>
			<p class="text-xs text-gray-500 max-w-sm mx-auto">
				Add an academic session with the Ameer and Ameerah details.
			</p>
			<button
				onclick={openAddSession}
				class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all"
			>
				<Plus class="w-4 h-4" />
				<span>Add First Session</span>
			</button>
		</div>
	{:else}
		<div class="space-y-4">
			{#each alumniData.sessions as session, idx (session.session)}
				<div class="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
					<div class="px-5 py-3 bg-green-50/60 border-b border-green-100 flex items-center justify-between">
						<h3 class="text-sm font-bold text-green-900">{session.session} Session</h3>
						<div class="flex items-center space-x-1">
							<button
								onclick={() => openEditSession(idx)}
								class="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-100 rounded-md transition-colors"
								title="Edit Session"
							>
								<Edit class="w-3.5 h-3.5" />
							</button>
							<button
								onclick={() => handleDeleteSession(idx)}
								class="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors"
								title="Delete Session"
							>
								<Trash2 class="w-3.5 h-3.5" />
							</button>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
						{#each ['Ameer', 'Ameerah'] as position}
							{@const member = position === 'Ameer' ? getAmeer(session) : getAmeerah(session)}
							<div class="p-4 flex items-start space-x-4">
								<img
									src={getMemberPlaceholder(position === 'Ameer' ? 'male' : 'female')}
									alt={member?.name || position}
									class="w-16 h-16 object-cover rounded-full shadow-sm border-2 border-white ring-2 ring-green-200 shrink-0"
								/>
								<div class="min-w-0 flex-1">
									{#if member?.name}
										<p class="text-sm font-bold text-green-950">{member.name}</p>
									{:else}
										<p class="text-sm font-bold text-gray-400 italic">Not set</p>
									{/if}
									<p class="text-xs text-green-600 font-medium">{position}</p>
									{#if member?.department}
										<p class="text-[11px] text-gray-500 mt-0.5">{member.department}</p>
									{/if}
									<div class="flex flex-wrap gap-1.5 mt-1.5">
										{#if member?.phone}
											<a href={`tel:${member.phone}`} class="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 hover:bg-green-100">Call</a>
										{/if}
										{#if member?.email}
											<a href={`mailto:${member.email}`} class="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 hover:bg-green-100">Email</a>
										{/if}
										{#if member?.currentRole}
											<span class="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{member.currentRole}{#if member.company} @ {member.company}{/if}</span>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if isFormModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
		<div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 text-xs max-h-[85vh] flex flex-col">
			<div class="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
				<h3 class="text-base font-bold text-green-950 flex items-center gap-2">
					<UserPlus class="w-5 h-5 text-green-700" />
					{editingSessionIdx !== null ? 'Edit Session' : 'Add Session'}
				</h3>
				<button onclick={() => (isFormModalOpen = false)} class="text-gray-400 hover:text-gray-700">
					<X class="w-5 h-5" />
				</button>
			</div>

			<form id="alumni-form" onsubmit={handleSave} class="p-6 overflow-y-auto space-y-4">
				<div>
					<label for="form-session" class="block font-semibold text-gray-700 mb-1">Academic Session *</label>
					<input
						id="form-session"
						type="text"
						required
						placeholder="e.g. 2023/2024"
						bind:value={formSession}
						list="session-datalist"
						class="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
					/>
					<datalist id="session-datalist">
						{#each sessionOptions as opt}
							<option value={opt} />
						{/each}
					</datalist>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="space-y-3 p-4 bg-blue-50/40 rounded-xl border border-blue-100">
						<h4 class="text-xs font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5">
							<img src="/images/user/male.jpg" alt="" class="w-5 h-5 rounded-full border border-blue-300" />
							Ameer (Male)
						</h4>
						<input type="text" placeholder="Full Name *" bind:value={ameerName} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="text" placeholder="Department" bind:value={ameerDepartment} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="text" placeholder="Phone" bind:value={ameerPhone} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="email" placeholder="Email" bind:value={ameerEmail} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="text" placeholder="Current Role" bind:value={ameerCurrentRole} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="text" placeholder="Company" bind:value={ameerCompany} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<textarea rows="2" placeholder="Bio" bind:value={ameerBio} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
					</div>

					<div class="space-y-3 p-4 bg-pink-50/40 rounded-xl border border-pink-100">
						<h4 class="text-xs font-bold text-pink-800 uppercase tracking-wide flex items-center gap-1.5">
							<img src="/images/user/female.jpg" alt="" class="w-5 h-5 rounded-full border border-pink-300" />
							Ameerah (Female)
						</h4>
						<input type="text" placeholder="Full Name *" bind:value={ameerahName} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="text" placeholder="Department" bind:value={ameerahDepartment} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="text" placeholder="Phone" bind:value={ameerahPhone} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="email" placeholder="Email" bind:value={ameerahEmail} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="text" placeholder="Current Role" bind:value={ameerahCurrentRole} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<input type="text" placeholder="Company" bind:value={ameerahCompany} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600" />
						<textarea rows="2" placeholder="Bio" bind:value={ameerahBio} class="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
					</div>
				</div>

				<div class="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100 sticky bottom-0 bg-white">
					<button
						type="button"
						onclick={() => (isFormModalOpen = false)}
						class="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-semibold"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-5 py-2 rounded-full bg-green-700 hover:bg-green-800 text-white font-bold shadow-md inline-flex items-center space-x-1.5"
					>
						<Save class="w-4 h-4" />
						<span>Save Session</span>
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
