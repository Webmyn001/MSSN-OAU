<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import SEO from '$lib/components/SEO.svelte';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { GraduationCap, Phone, Mail, MessageSquareText, Smartphone, X } from '@lucide/svelte';
    import { browser } from '$app/environment';
    import { API_BASE } from '$lib/api/base';

    let { data } = $props();

    const API_URL = `${API_BASE}/public/alumni`;

    let visible = $state(false);
    let sessions = $state(sortSessionsNewestFirst(data?.alumni?.sessions || []));
    let loading = $state(true);
    let selectedMember = $state(null);
    let showModal = $state(false);

    function getPlaceholder(gender) {
        return gender === 'female' ? '/images/user/female.jpg' : '/images/user/male.jpg';
    }

    /** @param {any[]} sessionList @returns {any[]} */
    function sortSessionsNewestFirst(sessionList) {
        return [...sessionList].sort((a, b) => {
            const aYear = parseInt(String(a?.session || '').split('/')[0]) || 0;
            const bYear = parseInt(String(b?.session || '').split('/')[0]) || 0;
            return bYear - aYear;
        });
    }

    function getAmeer(session) {
        return session.members?.find(m => m.position === 'Ameer');
    }

    function getAmeerah(session) {
        return session.members?.find(m => m.position === 'Ameerah');
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
        } else {
            loading = false;
        }
    });
</script>

<SEO
    title="Our Alumni"
    description="Meet the past Ameers, Ameerahs, and leaders of MSSN OAU who now serve communities, industries, and nations across the globe."
    path="/alumni"
    type="WebPage"
    images={[{
        url: 'https://i.ibb.co/4sznVXp/alumnae.webp',
        width: 1200,
        height: 640,
        alt: 'MSSNOAU Alumni'
    }]}
    keywords={["mssnoau alumni", "oau muslim alumni", "mssn oau past leaders", "mssn oau ameer"]}
/>

<PageHeader subtitle="The legacy lives on — the past Ameers and Ameerah who built and carried the MSSN OAU spirit forward.">Our Alumni</PageHeader>

<section class="pt-6 pb-16 relative overflow-hidden">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-green-700/10 rounded-full blur-3xl"></div>

    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        {#if visible}
            <div class="text-center mb-10" in:fly={{ y: 30, duration: 800, delay: 200 }}>
                <div class="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                    <GraduationCap class="w-4 h-4" />
                    Legacy of Leadership
                </div>
                <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 font-secondary mb-3">
                    Past <span class="text-green-700">Ameers & Ameerahs</span>
                </h2>
                <p class="text-gray-600 max-w-2xl mx-auto text-base font-tertiary leading-relaxed">
                    The men and women who once led MSSN OAU and now serve communities, industries, and nations across the globe.
                </p>
            </div>

            {#if loading}
                <div class="flex justify-center py-12">
                    <div class="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
                </div>
            {:else if sessions.length === 0}
                <div class="text-center py-12 text-gray-400 text-sm">No alumni data available yet.</div>
            {:else}
                <div class="space-y-6">
                    {#each sessions as session, idx (session.session)}
                        <div
                            class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                            in:fly={{ y: 20, duration: 500, delay: 200 + (idx * 80) }}
                        >
                            <div class="px-5 py-3 bg-green-50/60 border-b border-green-100">
                                <p class="text-sm font-semibold text-green-800 text-center">{session.session} Session</p>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                {#each ['Ameer', 'Ameerah'] as position}
                                    {@const member = position === 'Ameer' ? getAmeer(session) : getAmeerah(session)}
                                    <button
                                        onclick={() => member ? openMember(member) : null}
                                        class="p-5 flex items-start space-x-4 text-left cursor-pointer hover:bg-green-50/40 transition-colors {!member ? 'opacity-50' : ''}"
                                    >
                                        <img
                                            src={getPlaceholder(position === 'Ameer' ? 'male' : 'female')}
                                            alt={member?.name || position}
                                            class="w-16 h-16 object-cover rounded-full shadow-sm border-2 border-white ring-2 ring-green-200 shrink-0"
                                        />
                                        <div class="min-w-0 flex-1">
                                            {#if member?.name}
                                                <p class="text-sm font-bold text-gray-900">{member.name}</p>
                                            {:else}
                                                <p class="text-sm font-bold text-gray-400 italic">Not set</p>
                                            {/if}
                                            <p class="text-xs text-green-600 font-medium">{position}</p>
                                            {#if member?.department}
                                                <p class="text-[11px] text-gray-500 mt-0.5">{member.department}</p>
                                            {/if}
                                            <div class="flex flex-wrap gap-1.5 mt-1.5">
                                                {#if member?.phone}
                                                    <a href={`tel:${member.phone}`} onclick={(e) => e.stopPropagation()}
                                                        class="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 hover:bg-green-100 no-underline">Call</a>
                                                {/if}
                                                {#if member?.email}
                                                    <a href={`mailto:${member.email}`} onclick={(e) => e.stopPropagation()}
                                                        class="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 hover:bg-green-100 no-underline">Email</a>
                                                {/if}
                                                {#if member?.currentRole}
                                                    <span class="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{member.currentRole}{#if member.company} @ {member.company}{/if}</span>
                                                {/if}
                                            </div>
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
</section>

{#if showModal && selectedMember}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100" in:fly={{ y: 10, duration: 200 }}>
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

                {#if selectedMember.bio}
                    <p class="text-xs text-gray-600 text-center bg-green-50/50 p-3 rounded-xl border border-green-100 italic">{selectedMember.bio}</p>
                {/if}

                <div class="space-y-2 text-xs border-t pt-3">
                    {#if selectedMember.phone}
                        <a href={`tel:${selectedMember.phone}`} class="flex items-center text-green-700 hover:underline justify-start font-medium">
                            <Phone class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Call: {selectedMember.phone}
                        </a>
                        <a href={`https://wa.me/${selectedMember.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" class="flex items-center text-green-700 hover:underline justify-start font-medium">
                            <MessageSquareText class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Chat on WhatsApp
                        </a>
                        <a href={`sms:${selectedMember.phone}`} class="flex items-center text-green-700 hover:underline justify-start font-medium">
                            <Smartphone class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> Send SMS
                        </a>
                    {/if}
                    {#if selectedMember.email}
                        <a href={`mailto:${selectedMember.email}`} class="flex items-center text-green-700 hover:underline justify-start font-medium">
                            <Mail class="h-4 w-4 mr-2.5 shrink-0 text-green-600" /> {selectedMember.email}
                        </a>
                    {/if}
                </div>
            </div>

            <div class="pt-3 border-t border-gray-100">
                <button onclick={closeModal} class="w-full py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}
