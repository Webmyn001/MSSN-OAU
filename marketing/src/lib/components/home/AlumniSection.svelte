<script>
    import { Image } from '$lib/components/ui/image';
    import { fly, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { GraduationCap, ArrowRight, Phone, Mail, MessageSquareText, Smartphone, X } from '@lucide/svelte';
    import { browser } from '$app/environment';
    import { API_BASE } from '$lib/api/base';

    const API_URL = `${API_BASE}/public/alumni`;

    let { sessions: initialSessions = [] } = $props();

    let visible = $state(false);
    let sessions = $state(sortSessionsNewestFirst(initialSessions));
    let loading = $state(false);
    let selectedMember = $state(null);
    let showModal = $state(false);

    /** @param {any[]} sessionList @returns {any[]} */
    function sortSessionsNewestFirst(sessionList) {
        return [...sessionList].sort((a, b) => {
            const aYear = parseInt(String(a?.session || '').split('/')[0]) || 0;
            const bYear = parseInt(String(b?.session || '').split('/')[0]) || 0;
            return bYear - aYear;
        });
    }

    const pastLeaders = $derived(sessions.slice(0, 3).map(s => {
        const ameer = s.members.find(m => m.position.toLowerCase().includes('ameer') && m.gender === 'male');
        const ameerah = s.members.find(m => m.position.toLowerCase().includes('ameer') && m.gender === 'female');
        return { session: s.session, ameer, ameerah };
    }));

    function getPlaceholder(gender) {
        return gender === 'female' ? '/images/user/female.jpg' : '/images/user/male.jpg';
    }

    function openMember(member) {
        selectedMember = member;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        selectedMember = null;
    }

    onMount(async () => {
        visible = true;

        if (browser && (!sessions || sessions.length === 0)) {
            loading = true;
            try {
                const res = await fetch(API_URL, { signal: AbortSignal.timeout(10000) });
                if (res.ok) {
                    const body = await res.json();
                    if (body?.success && body?.data?.alumni?.sessions) {
                        sessions = sortSessionsNewestFirst(body.data.alumni.sessions);
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch alumni data:', e);
            } finally {
                loading = false;
            }
        }
    });
</script>

<section class="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white">
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute -top-40 -right-40 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-green-700/5 rounded-full blur-3xl"></div>
    </div>

    <div class="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10">
        {#if visible}
            <div class="text-center mb-12" in:fly={{ y: 30, duration: 800, delay: 200 }}>
                <div class="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                    <GraduationCap class="w-4 h-4" />
                    Legacy of Leadership
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-secondary mb-4">
                    Past <span class="text-green-700">Ameers & Ameerahs</span>
                </h2>
                <p class="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg font-tertiary leading-relaxed">
                    The leaders who shaped MSSN OAU across the years.
                </p>
            </div>

            {#if loading}
                <div class="flex justify-center py-12">
                    <div class="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
                </div>
            {:else if pastLeaders.length === 0}
                <div class="text-center py-12 text-gray-400 text-sm">
                    No alumni data available yet.
                </div>
            {:else}
                <div class="space-y-10 max-w-4xl mx-auto">
                    {#each pastLeaders as leader, i (leader.session)}
                        <div
                            class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                            in:fly={{ y: 20, duration: 600, delay: 300 + (i * 100) }}
                        >
                            <div class="px-5 py-3 bg-green-50/60 border-b border-green-100">
                                <p class="text-sm font-semibold text-green-800 text-center">{leader.session} Session</p>
                            </div>

                            <div class="grid grid-cols-2 divide-x divide-gray-100">
                                {#if leader.ameer}
                                    <button
                                        onclick={() => openMember(leader.ameer)}
                                        class="p-6 text-center cursor-pointer hover:bg-green-50/40 transition-colors"
                                    >
                                        <div class="mx-auto w-24 h-24 mb-3">
                                            <Image
                                                src={getPlaceholder(leader.ameer.gender)}
                                                alt={leader.ameer.name}
                                                width={96}
                                                height={96}
                                                loading="lazy"
                                                className="w-full h-full object-cover rounded-full ring-4 ring-green-50 border-2 border-white shadow-md"
                                            />
                                        </div>
                                        <h3 class="text-sm font-bold text-gray-900 group-hover:text-green-700">{leader.ameer.name}</h3>
                                        <p class="text-xs text-green-600 font-medium mt-0.5">Ameer</p>
                                        {#if leader.ameer.department}
                                            <p class="text-[11px] text-gray-400 mt-1">{leader.ameer.department}</p>
                                        {/if}
                                        {#if leader.ameer.currentRole}
                                            <p class="text-[11px] text-amber-600 font-medium mt-1">{leader.ameer.currentRole}</p>
                                        {/if}
                                    </button>
                                {:else}
                                    <div class="p-6 text-center flex items-center justify-center">
                                        <p class="text-xs text-gray-400 italic">Ameer not listed</p>
                                    </div>
                                {/if}

                                {#if leader.ameerah}
                                    <button
                                        onclick={() => openMember(leader.ameerah)}
                                        class="p-6 text-center cursor-pointer hover:bg-green-50/40 transition-colors"
                                    >
                                        <div class="mx-auto w-24 h-24 mb-3">
                                            <Image
                                                src={getPlaceholder(leader.ameerah.gender)}
                                                alt={leader.ameerah.name}
                                                width={96}
                                                height={96}
                                                loading="lazy"
                                                className="w-full h-full object-cover rounded-full ring-4 ring-green-50 border-2 border-white shadow-md"
                                            />
                                        </div>
                                        <h3 class="text-sm font-bold text-gray-900 group-hover:text-green-700">{leader.ameerah.name}</h3>
                                        <p class="text-xs text-green-600 font-medium mt-0.5">Ameerah</p>
                                        {#if leader.ameerah.department}
                                            <p class="text-[11px] text-gray-400 mt-1">{leader.ameerah.department}</p>
                                        {/if}
                                        {#if leader.ameerah.currentRole}
                                            <p class="text-[11px] text-amber-600 font-medium mt-1">{leader.ameerah.currentRole}</p>
                                        {/if}
                                    </button>
                                {:else}
                                    <div class="p-6 text-center flex items-center justify-center">
                                        <p class="text-xs text-gray-400 italic">Ameerah not listed</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}

            <div class="text-center mt-12" in:fly={{ y: 20, duration: 600, delay: 800 }}>
                <a
                    href="/alumni"
                    class="inline-flex items-center gap-2 rounded-xl bg-green-700 px-8 py-3 text-sm font-semibold font-secondary text-white shadow-sm transition-all duration-300 hover:bg-green-800 hover:-translate-y-1 hover:shadow-lg"
                >
                    View All Alumni
                    <ArrowRight class="w-4 h-4" />
                </a>
            </div>
        {/if}
    </div>
</section>

{#if showModal && selectedMember}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div
            class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100"
            in:scale={{ duration: 300, start: 0.95 }}
        >
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                    <h3 class="text-base font-bold text-gray-900">{selectedMember.name}</h3>
                    <p class="text-xs text-green-600 font-medium">{selectedMember.position}</p>
                    <p class="text-[11px] text-gray-500 mt-0.5">{selectedMember.session} Session</p>
                </div>
                <button onclick={closeModal} class="text-gray-400 hover:text-gray-700">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <div class="space-y-4">
                <div class="flex justify-center">
                    <img
                        src={getPlaceholder(selectedMember.gender)}
                        alt={selectedMember.name}
                        class="w-28 h-28 object-cover rounded-full shadow-md border-4 border-white ring-2 ring-green-200"
                    />
                </div>

                {#if selectedMember.department}
                    <div class="text-center">
                        <p class="text-[11px] text-gray-400 uppercase tracking-wide">Department</p>
                        <p class="text-sm font-semibold text-gray-900">{selectedMember.department}</p>
                    </div>
                {/if}

                {#if selectedMember.currentRole}
                    <div class="text-center bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <p class="text-[11px] text-amber-600 uppercase tracking-wide font-medium">Current Role</p>
                        <p class="text-sm font-bold text-amber-800">{selectedMember.currentRole}{#if selectedMember.company} @ {selectedMember.company}{/if}</p>
                    </div>
                {/if}

                <div class="space-y-2 text-xs border-t pt-3">
                    {#if selectedMember.phone}
                        <a
                            href={`tel:${selectedMember.phone}`}
                            class="flex items-center text-green-700 hover:underline justify-start font-medium"
                        >
                            <Phone class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Call: {selectedMember.phone}
                        </a>
                        <a
                            href={`https://wa.me/${selectedMember.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex items-center text-green-700 hover:underline justify-start font-medium"
                        >
                            <MessageSquareText class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Chat on WhatsApp
                        </a>
                        <a
                            href={`sms:${selectedMember.phone}`}
                            class="flex items-center text-green-700 hover:underline justify-start font-medium"
                        >
                            <Smartphone class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Send SMS
                        </a>
                    {/if}
                    {#if selectedMember.email}
                        <a
                            href={`mailto:${selectedMember.email}`}
                            class="flex items-center text-green-700 hover:underline justify-start font-medium"
                        >
                            <Mail class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> {selectedMember.email}
                        </a>
                    {/if}
                </div>
            </div>

            <div class="pt-3 border-t border-gray-100">
                <button
                    onclick={closeModal}
                    class="w-full py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}
