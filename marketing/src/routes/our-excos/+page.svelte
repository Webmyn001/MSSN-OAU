<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { Phone, Mail, ExternalLink, Copy, Check, ChevronDown, MessageCircle, X, Info, MessageSquareText, Smartphone, Users, Building2, Award, Contact } from "@lucide/svelte";
    import copyTextToClipboard from "$lib/utils/copy.js";
    import { toast } from "svelte-sonner";
    import { tick } from "svelte";
    import { useId } from "bits-ui";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import * as Command from "$lib/components/ui/command/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import SEO from '$lib/components/SEO.svelte';
    import { fly, fade, scale } from "svelte/transition";
    import { Image } from '$lib/components/ui/image';
    import { browser } from '$app/environment';
    import { SITE_URL } from '$lib/config';
    import ResponsiveModal from "$lib/components/layout/ResponsiveModal.svelte";

    import { onMount } from 'svelte';
    import { API_BASE } from '$lib/api/base';

    /** @type {{ data: any }} */
    let { data } = $props();

    let sessionSelectorOpen = $state(false);
    /** @type {any[]} */
    let sessions = $state([]);
    /** @type {string | undefined} */
    let selectedSession = $state(undefined);
    let isLoaded = $state(false);
    let visible = $state(false);
    /** @type {any} */
    let activeMember = $state(null);
    let memberModalOpen = $state(false);
    /** @type {string | null} */
    let selectedCommittee = $state(null);
    /** @type {string | null} */
    let copiedId = $state(null);

    /** @param {any[]} sessionList @returns {any[]} */
    function sortSessionsNewestFirst(sessionList) {
        return [...sessionList].sort((a, b) => {
            const aYear = parseInt(String(a.session || '').split('/')[0]) || 0;
            const bYear = parseInt(String(b.session || '').split('/')[0]) || 0;
            return bYear - aYear;
        });
    }

    async function fetchLatestExcos() {
        try {
            const res = await fetch(`${API_BASE}/public/excos`);
            if (res.ok) {
                const body = await res.json();
                if (body?.success && body?.data?.excos?.sessions) {
                    const freshSessions = sortSessionsNewestFirst(body.data.excos.sessions);
                    if (JSON.stringify(freshSessions) !== JSON.stringify(sessions)) {
                        sessions = freshSessions;
                        if (!selectedSession && freshSessions.length > 0) {
                            selectedSession = freshSessions[0]?.session;
                        }
                    }
                }
            }
        } catch (err) {
            console.warn("Client fetch for excos failed, keeping loaded state:", err);
        }
    }

    onMount(() => {
        fetchLatestExcos();
    });

    $effect(() => {
        const newSessions = sortSessionsNewestFirst(data?.excos?.sessions || []);
        if (JSON.stringify(newSessions) !== JSON.stringify(sessions)) {
            sessions = newSessions;
            if (selectedSession === undefined && newSessions.length > 0) {
                selectedSession = newSessions[0]?.session;
            } else if (newSessions.length === 0) {
                selectedSession = undefined;
            }
        }

        if (/** @type {any} */ (data)?.error) {
            console.error("Error loading executive data:", /** @type {any} */ (data).error);
            toast.error(`Failed to load data`);
        }
        
        setTimeout(() => { isLoaded = true; }, 300);
    });

    const currentSession = $derived(
        selectedSession ? sessions.find(/** @param {any} s */ s => s.session === selectedSession) : undefined
    );

    const stats = $derived(() => {
        if (!currentSession?.executives) return { totalMembers: 0, committees: 0, maleCount: 0, femaleCount: 0 };
        const allMembers = currentSession.executives.flatMap(/** @param {any} c */ c => c.members);
        return {
            totalMembers: allMembers.length,
            committees: currentSession.executives.length,
            maleCount: allMembers.filter(/** @param {any} m */ m => m.gender === 'male').length,
            femaleCount: allMembers.filter(/** @param {any} m */ m => m.gender === 'female').length
        };
    });

    const filteredCommittees = $derived(
        selectedCommittee 
            ? currentSession?.executives?.filter(/** @param {any} c */ c => c.committee === selectedCommittee) || []
            : currentSession?.executives || []
    );

    const triggerId = useId();
    
    /** @param {string} id */
    function closeAndFocusTrigger(id) {
        sessionSelectorOpen = false;
        tick().then(() => {
            if (browser) {
                document.getElementById(id)?.focus();
            }
        });
    }

    $effect(() => {
        visible = true;
    });
    
    /** @param {any} member @param {string} committeeName */
    function openMemberDetail(member, committeeName) {
        activeMember = { ...member, committeeName };
        memberModalOpen = true;
    }

    function closeMemberDetail() {
        memberModalOpen = false;
        setTimeout(() => { activeMember = null; }, 300);
    }

    /** @param {any} member */
    async function copyContact(member) {
        if (!member) return;
        const committeeName = member.committeeName || '';
        const details = `${member.name}\n${member.position}, ${committeeName}, MSSNOAU${member.phone ? `\nPhone: ${member.phone}` : ''}${member.email ? `\nEmail: ${member.email}` : ''}`;
        try {
            await copyTextToClipboard(details);
            copiedId = member.id;
            toast.success(`${member.name}'s details copied.`);
            setTimeout(() => { copiedId = null; }, 2000);
        } catch {
            toast.error(`Failed to copy details.`);
        }
    }

    /** @param {any} member */
    function getPlaceholder(member) {
        return member?.gender === "female" ? "/images/user/female.jpg" : "/images/user/male.jpg";
    }

    /** @param {string} committee */
    function getCommitteeIcon(committee) {
        const name = committee.toLowerCase();
        if (name.includes('executive')) return Award;
        if (name.includes('faculty') || name.includes('co-ordinator')) return Building2;
        return Users;
    }
</script>

<SEO
    title="Our Executives"
    description="Meet the executives of the Muslim Students Society of Nigeria, OAU Branch. Find contact information and committee details for various sessions."
    path="/our-excos"
    type="WebPage"
    images={[
        {
            url: data?.excos?.sessions?.find(/** @param {any} s */ s => s.session === selectedSession)?.executives?.[0]?.members?.[0]?.photo || '/images/bg-1.webp',
            width: 1200,
            height: 630,
            alt: `MSSN OAU Executives ${selectedSession || ''}`
        }
    ]}
    schema={currentSession?.executives ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `Our Executives ${selectedSession ? `- ${selectedSession} Session` : ''} | MSSNOAU`,
        "description": `Meet the executives of the Muslim Students Society of Nigeria, OAU Branch for the ${selectedSession || 'current'} session.`,
        "url": `${SITE_URL}/our-excos${selectedSession ? '?session=' + encodeURIComponent(selectedSession) : ''}`,
        "mainEntity": {
            "@type": "Organization",
            "name": `MSSN OAU Executives - ${selectedSession || 'Current'} Session`,
            "member": currentSession.executives.flatMap(/** @param {any} committee */ committee =>
                committee.members.map(/** @param {any} member */ member => ({
                    "@type": "Person",
                    "name": member.name,
                    "jobTitle": `${member.position}, ${committee.committee}`,
                    "image": member.photo,
                    "telephone": member.phone,
                    "email": member.email,
                    "worksFor": {
                        "@type": "Organization",
                        "name": "Muslim Students Society of Nigeria, OAU Branch"
                    }
                }))
            )
        }
    } : null} 
    keywords={["mssn oau executives", "mssnoau excos", "muslim students oau leaders", "mssn oau committees", "oau mssn leadership"]}
/>

<PageHeader subtitle="The student leaders steering MSSN OAU through this session — meet the hands on deck.">
    <div class="relative">
        {#if visible}
            <h1 in:fly={{ y: 30, duration: 800, delay: 200 }} class="relative z-10">
                Our Executives
                <span class="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-green-600 rounded-full"></span>
            </h1>
        {/if}
    </div>
    <br/>
    {#if sessions.length > 0 && visible}
        <div in:fly={{ y: 30, duration: 800, delay: 400 }}>
            <Popover.Root bind:open={sessionSelectorOpen}>
                <Popover.Trigger id={triggerId} class="flex justify-center mx-auto mt-4">
                    <button class="group inline-flex items-center bg-white/20 hover:bg-white/30 border border-white/20 p-1 ps-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-green-700 transition-all duration-300">
                        <span class="me-2 text-white text-sm font-medium">
                            {selectedSession || "Choose Session"}
                        </span>
                        <span class="group-hover:bg-white/30 py-1.5 px-2.5 flex justify-center items-center gap-x-2 rounded-full bg-white/20 font-semibold text-white text-sm transition-all duration-300">
                            <ChevronDown class="shrink-0 size-4 transition-transform duration-300 group-hover:rotate-180" />
                        </span>
                    </button>
                </Popover.Trigger>
                <Popover.Content class="w-[300px] p-0 rounded-xl border border-green-100 shadow-xl" side="bottom" align="center" portalProps={{ target: 'body' }}>
                    <Command.Root class="rounded-xl overflow-hidden">
                        <Command.Input placeholder="Search Session..." class="border-green-100 focus:ring-green-500" />
                        <Command.List class="max-h-[300px] overflow-y-auto overflow-x-hidden">
                            <Command.Empty class="py-6 text-center text-sm">No results found.</Command.Empty>
                            <Command.Group class="p-2" heading="Sessions" value="sessions_group">
                                {#each sessions as sessionItem (sessionItem.session)}
                                    <Command.Item
                                        value={sessionItem.session}
                                        class="aria-selected:bg-green-50 aria-selected:text-green-900 cursor-pointer"
                                        onSelect={() => {
                                            selectedSession = sessionItem.session;
                                            closeAndFocusTrigger(triggerId);
                                        }}
                                    >
                                        <span>{sessionItem.session}</span>
                                    </Command.Item>
                                {/each}
                            </Command.Group>
                        </Command.List>
                    </Command.Root>
                </Popover.Content>
            </Popover.Root>
            <p class="text-white text-sm sm:text-base font-bold text-center mt-3 px-4 flex items-center justify-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
                <ChevronDown class="shrink-0 size-4" stroke-width={2.5} />
                <span class="leading-snug">
                    {sessions.length > 1
                        ? 'Switch session above to explore executives from previous years.'
                        : `Showing the ${selectedSession} executives.`}
                </span>
            </p>
        </div>
    {/if}
</PageHeader>

<section class="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -z-10"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-green-700/5 rounded-full blur-3xl -z-10"></div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {#if /** @type {any} */ (data)?.error && sessions.length === 0}
            <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <X class="h-6 w-6 text-red-400 bg-red-100 rounded-full p-0.5" />
                    </div>
                    <div class="ml-3">
                        <p class="text-red-700 text-lg font-medium">Error Loading Executives</p>
                        <p class="text-red-600 mt-1 text-sm">Please try refreshing the page or contact support.</p>
                    </div>
                </div>
            </div>
        {:else if !isLoaded && sessions.length === 0}
            <div class="text-center text-gray-500 py-10">Loading executive details...</div>
            {#each Array(2) as _}
                <div class="mb-16">
                    <div class="text-xl h-8 bg-gray-200 rounded w-1/3 mx-auto animate-pulse my-3"></div>
                    <div class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                        {#each Array(4) as _}
                            <div class="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                                <div class="flex flex-col items-center">
                                    <div class="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                                    <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {:else if selectedSession && currentSession?.executives && currentSession.executives.length > 0}
            {#if stats().totalMembers > 0}
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12" in:fly={{ y: 20, duration: 600, delay: 100 }}>
                    <div class="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
                        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users class="w-5 h-5 text-green-600" />
                        </div>
                        <p class="text-2xl sm:text-3xl font-bold text-green-700">{stats().totalMembers}</p>
                        <p class="text-xs sm:text-sm text-gray-500 mt-1">Total Members</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Building2 class="w-5 h-5 text-blue-600" />
                        </div>
                        <p class="text-2xl sm:text-3xl font-bold text-blue-700">{stats().committees}</p>
                        <p class="text-xs sm:text-sm text-gray-500 mt-1">Committees</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
                        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="text-lg">&#9794;</span>
                        </div>
                        <p class="text-2xl sm:text-3xl font-bold text-indigo-700">{stats().maleCount}</p>
                        <p class="text-xs sm:text-sm text-gray-500 mt-1">Brothers</p>
                    </div>
                    <div class="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 text-center">
                        <div class="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span class="text-lg">&#9792;</span>
                        </div>
                        <p class="text-2xl sm:text-3xl font-bold text-pink-700">{stats().femaleCount}</p>
                        <p class="text-xs sm:text-sm text-gray-500 mt-1">Sisters</p>
                    </div>
                </div>
            {/if}

            <div class="flex flex-wrap justify-center gap-2 mb-10" in:fly={{ y: 20, duration: 600, delay: 200 }}>
                <button
                    class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 {selectedCommittee === null ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700'}"
                    onclick={() => selectedCommittee = null}
                >
                    All Committees
                </button>
                {#each currentSession.executives as committee (committee.committee)}
                    {@const Icon = getCommitteeIcon(committee.committee)}
                    <button
                        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 {selectedCommittee === committee.committee ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700'}"
                        onclick={() => selectedCommittee = selectedCommittee === committee.committee ? null : committee.committee}
                    >
                        <Icon class="w-3.5 h-3.5" />
                        {committee.committee}
                    </button>
                {/each}
            </div>

            {#each filteredCommittees as committee, committeeIndex (committee.committee)}
                {@const Icon = getCommitteeIcon(committee.committee)}
                <div class="mb-14" in:fly={{ y: 30, duration: 800, delay: 100 + (committeeIndex * 100) }}>
                    <div class="flex items-center justify-center gap-3 mb-8">
                        <div class="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-green-300"></div>
                        <div class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2.5">
                            <Icon class="w-5 h-5 text-green-600" />
                            <h2 class="text-base sm:text-lg font-semibold text-green-800 font-secondary">{committee.committee}</h2>
                            <span class="bg-green-200 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{committee.members.length}</span>
                        </div>
                        <div class="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-green-300"></div>
                    </div>

                    <div class="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                        {#each committee.members as member, memberIndex (member.id)}
                            {@const memberData = /** @type {any} */ (member)}
                            <button
                                class="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 text-center cursor-pointer"
                                onclick={() => openMemberDetail(memberData, committee.committee)}
                                in:scale={{ duration: 400, delay: 150 + (memberIndex * 40) }}
                            >
                                <div class="relative mx-auto w-20 h-20 mb-4">
                                    <Image
                                        src={memberData.photo || getPlaceholder(memberData)}
                                        alt={memberData.name}
                                        width={80}
                                        height={80}
                                        loading="lazy"
                                        className="w-full h-full object-cover rounded-full ring-4 ring-green-50 group-hover:ring-green-100 transition-all duration-300 border-2 border-white shadow-md"
                                    />
                                    <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                                        <Contact class="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                <h3 class="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors leading-tight mb-1">{memberData.name}</h3>
                                <p class="text-xs text-green-600 font-medium leading-tight">{memberData.position}</p>
                                
                                {#if memberData.phone}
                                    <div class="mt-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <a 
                                            href={`tel:${memberData.phone}`}
                                            class="w-7 h-7 bg-green-50 hover:bg-green-100 rounded-full flex items-center justify-center transition-colors"
                                            onclick={(e) => e.stopPropagation()}
                                        >
                                            <Phone class="w-3 h-3 text-green-600" />
                                        </a>
                                        <a 
                                            href={`https://wa.me/${memberData.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="w-7 h-7 bg-green-50 hover:bg-green-100 rounded-full flex items-center justify-center transition-colors"
                                            onclick={(e) => e.stopPropagation()}
                                        >
                                            <MessageSquareText class="w-3 h-3 text-green-600" />
                                        </a>
                                    </div>
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        {:else if isLoaded && sessions.length > 0 && (!currentSession?.executives || currentSession.executives.length === 0)}
            <div class="text-center py-12 px-4">
                <div class="bg-gray-50 rounded-2xl border border-gray-200 p-8 shadow-sm w-full max-w-md text-center mx-auto">
                    <div class="mb-6 bg-gray-100 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                        <Info class="size-10 text-gray-400" />
                    </div>
                    <h3 class="text-xl font-medium text-gray-800 mb-3">No Executives Found</h3>
                    <p class="text-gray-500 text-sm">
                        No executive members are listed for the {selectedSession || 'selected'} session. Please select another session or check back later.
                    </p>
                </div>
            </div>
        {:else if isLoaded && sessions.length === 0}
            <div class="text-center py-12 px-4">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <Info class="h-6 w-6 text-yellow-500" />
                        </div>
                        <div class="ml-3">
                            <p class="text-yellow-700 text-lg font-medium">No Sessions Available</p>
                            <p class="text-yellow-600 mt-1 text-sm">Currently, there are no executive sessions available. Please check back later.</p>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</section>

{#if memberModalOpen && activeMember}
    <ResponsiveModal 
        bind:open={memberModalOpen}
        onOpenChange={(/** @type {boolean} */ isOpen) => { if (!isOpen) closeMemberDetail(); }}
        contentClass="sm:max-w-lg"
    >
        <div class="space-y-6">
            <div class="flex flex-col items-center pt-2">
                <div class="relative mb-4">
                    <Image 
                        src={activeMember.photo || getPlaceholder(activeMember)} 
                        alt={activeMember.name} 
                        width={128} 
                        height={128} 
                        className="w-32 h-32 object-cover rounded-full shadow-xl border-4 border-white ring-2 ring-green-100"
                    />
                    <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check class="w-4 h-4 text-white" />
                    </div>
                </div>
                
                <h2 class="text-xl font-bold text-gray-900 text-center">{activeMember.name}</h2>
                <p class="text-green-600 font-medium text-sm mt-1">{activeMember.position}</p>
                <p class="text-gray-400 text-xs mt-0.5">{activeMember.committeeName}</p>
            </div>

            {#if activeMember.bio}
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Department & Level</h4>
                    <p class="text-sm text-gray-700">{activeMember.bio}</p>
                </div>
            {/if}

            <div class="space-y-3">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Information</h4>
                
                {#if activeMember.phone}
                    <div class="space-y-2">
                        <a 
                            href={`tel:${activeMember.phone}`} 
                            class="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                        >
                            <div class="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
                                <Phone class="w-5 h-5 text-green-600" />
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-gray-500">Phone</p>
                                <p class="text-sm font-medium text-gray-900">{activeMember.phone}</p>
                            </div>
                        </a>
                        
                        <a 
                            href={`https://wa.me/${activeMember.phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                        >
                            <div class="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
                                <MessageSquareText class="w-5 h-5 text-green-600" />
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-gray-500">WhatsApp</p>
                                <p class="text-sm font-medium text-gray-900">Chat on WhatsApp</p>
                            </div>
                            <ExternalLink class="w-4 h-4 text-gray-400" />
                        </a>

                        <a 
                            href={`sms:${activeMember.phone}`} 
                            class="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                        >
                            <div class="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                                <Smartphone class="w-5 h-5 text-gray-600" />
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-gray-500">SMS</p>
                                <p class="text-sm font-medium text-gray-900">Send a text message</p>
                            </div>
                        </a>
                    </div>
                {/if}

                {#if activeMember.email}
                    <a 
                        href={`mailto:${activeMember.email}`} 
                        class="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                    >
                        <div class="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                            <Mail class="w-5 h-5 text-blue-600" />
                        </div>
                        <div class="flex-1">
                            <p class="text-xs text-gray-500">Email</p>
                            <p class="text-sm font-medium text-gray-900">{activeMember.email}</p>
                        </div>
                        <ExternalLink class="w-4 h-4 text-gray-400" />
                    </a>
                {/if}

                {#if !activeMember.phone && !activeMember.email}
                    <p class="text-center text-gray-400 text-sm py-4">No contact information available</p>
                {/if}
            </div>

            {#if activeMember.socials && activeMember.socials.length > 0}
                <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Social Links</h4>
                    <div class="flex flex-wrap gap-2">
                        {#each activeMember.socials as social (social.platform)}
                            <Button as="a" href={social.link} target="_blank" rel="noopener noreferrer" variant="outline" size="sm" class="text-xs">
                                {social.platform} <ExternalLink class="h-3 w-3 ml-1" />
                            </Button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        {#snippet footer()} 
            <div class="flex flex-col sm:flex-row gap-3 w-full">
                <Button variant="outline" onclick={closeMemberDetail} class="flex-1">
                    Close
                </Button>
                <Button 
                    onclick={() => activeMember && copyContact(activeMember)} 
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={!activeMember?.phone && !activeMember?.email}
                >
                    {#if copiedId === activeMember?.id}
                        <Check class="mr-2 h-4 w-4" /> Copied!
                    {:else}
                        <Copy class="mr-2 h-4 w-4" /> Copy Details
                    {/if}
                </Button>
            </div>
        {/snippet}
    </ResponsiveModal>
{/if}
