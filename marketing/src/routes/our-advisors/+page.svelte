<script>
    import PageHeader from "$lib/components/layout/PageHeader.svelte";
    import { MessageCircle, Phone, Mail } from "@lucide/svelte";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import SEO from '$lib/components/SEO.svelte';
    import { toast } from "svelte-sonner";
    import { fly } from "svelte/transition";
    import { API_BASE } from "$lib/api/base";

    /**
     * @typedef {Object} Socials
     * @property {string} [whatsapp]
     * @property {string} [linkedin]
     *
     * @typedef {Object} Advisor
     * @property {string} [id]
     * @property {string} name
     * @property {string} [title]
     * @property {'male' | 'female' | string} [gender]
     * @property {string} [position]
     * @property {string} [department]
     * @property {string} [phone]
     * @property {string} [email]
     * @property {string} [photo]
     * @property {string} [summary]
     * @property {Socials} [socials]
     *
     * @typedef {Object} PageData
     * @property {Advisor[]} [advisors]
     * @property {string} [error]
     */

    /** @type {{ data: PageData }} */
    let { data } = $props();

    /** @type {Advisor[]} */
    let advisors = $state([]);
    let initialized = false;
    let visible = $state(false);
    
    /** @type {string | undefined | null} */
    let hoveredAdvisor = $state(null);

    onMount(async () => {
        visible = true;

        if (browser) {
            try {
                const res = await fetch(`${API_BASE}/public/advisors`, { signal: AbortSignal.timeout(10000) });
                if (res.ok) {
                    const body = await res.json();
                    if (body?.success && Array.isArray(body?.data?.advisors)) {
                        advisors = body.data.advisors;
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch advisors data:', e);
            }
        }
    });

    $effect(() => {
        if (!initialized && data && Array.isArray(data.advisors)) {
            advisors = data.advisors;
            initialized = true;
        }
        if (data && data.error) {
            console.error("Error loading advisor data:", data.error);
            toast.error(`Failed to load advisor data: ${data.error.substring(0, 100)}`);
        }
    });

    /**
     * * Returns a gender-based placeholder image path for advisors without photos.
     * @param {any} advisor
     * @returns {string}
     */
    function getAdvisorPlaceholder(advisor) {
        const gender = String(advisor?.gender || "").toLowerCase();
        if (gender === "female") return "/images/user/female.jpg";
        if (gender === "male") return "/images/user/male.jpg";

        const title = String(advisor?.title || "").toLowerCase();
        const name = String(advisor?.name || "").toLowerCase();
        const isLikelyFemale = title.includes("mrs") || title.includes("miss") || name.startsWith("mrs ") || name.startsWith("sister ");
        return isLikelyFemale ? "/images/user/female.jpg" : "/images/user/male.jpg";
    }
    
</script>

<SEO
    title="Our Advisors"
    description="Meet the esteemed advisors of the Muslim Students Society of Nigeria, OAU Branch. Find their profiles, departments, and contact information."
    path="/our-advisors"
    type="CollectionPage"
    images={[
        {
            url: 'https://i.ibb.co/HqK7S8Z/our-advisors.webp',
            width: 1200,
            height: 640,
            alt: 'MSSN OAU Advisors Page'
        }
    ]}
    schema={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Our Advisors | MSSNOAU",
        "description": "Profiles of the advisors for the Muslim Students Society of Nigeria, Obafemi Awolowo University Branch.",
        "url": "https://mssnoau.org/our-advisors", 
        "publisher": {
            "@type": "Organization",
            "name": "MSSN Obafemi Awolowo University Branch",
            "logo": {
                "@type": "ImageObject",
                "url": "https://mssnoau.org/mssn-logo.png"
            }
        },
        "hasPart": advisors && advisors.length > 0 ? {
            "@type": "ItemList",
            "itemListElement": advisors.map((/** @type {Advisor} */ advisor, /** @type {number} */ idx) => ({
                "@type": "Person",
                "name": `${advisor.title ? advisor.title + ' ' : ''}${advisor.name}`,
                "jobTitle": advisor.position,
                "worksFor": {
                    "@type": "Organization",
                    "name": "Obafemi Awolowo University"
                },
                ...(advisor.department ? { "department": advisor.department } : {}),
                ...(advisor.email ? { "email": advisor.email } : {}),
                ...(advisor.photo ? { "image": advisor.photo } : {})
            }))
        } : undefined
    }}
    keywords={["mssn oau advisors", "mssnoau advisors", "oau muslim advisors", "mssn oau patrons", "islamic guidance oau"]}
/>

<PageHeader>
    <div class="relative">
        {#if visible}
            <h1 in:fly={{ y: 30, duration: 800, delay: 200 }} class="relative z-10">
    Our Advisors
                <span class="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-primary-600 rounded-full"></span>
            </h1>
        {/if}
    </div>
    <br/>
</PageHeader>

<div class="py-12 relative overflow-hidden">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"> 
    {#if data && data.error && (!advisors || advisors.length === 0)}
            <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-red-700 text-lg font-medium">{data.error}</p>
                        <p class="text-red-600 mt-1">Please try refreshing the page or contact the administrator.</p>
                    </div>
                </div>
            </div>
        {:else if advisors && advisors.length > 0}
            <div class="grid grid-cols-1 gap-8">
                {#each advisors as advisor, index (advisor.id)}
                    <div 
                        class="mx-auto w-full max-w-3xl"
                        in:fly={{ y: 30, duration: 800, delay: 600 + (index * 200) }}
                    >
                        <div 
                            role="button"
                            tabindex="0"
                            class="relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group"
                            onmouseenter={() => hoveredAdvisor = advisor.id}
                            onmouseleave={() => hoveredAdvisor = null}
                        >
                            <div class="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div class="relative z-10 p-6 sm:p-8">
                                <div class="flex flex-col md:flex-row gap-6 items-start">
                                    <div class="relative mx-auto md:mx-0 mb-4 md:mb-0">
                                        <div class="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-700/20 backdrop-blur-sm -z-10 transform scale-110"></div>
                                        <img 
                                            src={advisor.photo || getAdvisorPlaceholder(advisor)} 
                                            alt="Photo of {advisor.title} {advisor.name}" 
                                            class="w-32 h-32 rounded-full object-cover border-2 border-white shadow-md transition-transform duration-500 group-hover:scale-105"
                                        >
                                    </div>
                                    
                                    <div class="flex-grow">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h2 class="font-secondary font-bold text-primary-800 text-xl sm:text-2xl group-hover:text-primary-700 transition-colors duration-300">
                                                    {advisor.title} {advisor.name}
                                                </h2>
                                                <p class="text-gray-700 font-semibold font-secondary text-lg mt-1">
                                                    {advisor.position}
                                                </p>
                                                <p class="text-gray-600 text-sm mt-1">
                                                    {advisor.department}
                                                </p>
                                            </div>
                                            
                                        </div>
                                        
                                        <div class="mt-4">
                                            <p class="font-tertiary tracking-wide text-gray-700 leading-relaxed">
                                                {advisor.summary}
                                            </p>
                                        </div>
                                        
                                        <div class="mt-4 flex flex-wrap gap-2">
                                            {#if advisor.phone}
                                                <a 
                                                    href={`tel:${advisor.phone}`}
                                                    class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors duration-300"
                                                >
                                                    <Phone class="w-3 h-3" />
                                                    Call
                                                </a>

                                                <a 
                                                    href={`sms:${advisor.phone}`}
                                                    class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors duration-300"
                                                >
                                                    <MessageCircle class="w-3 h-3" />
                                                    SMS
                                                </a>
                                                
                                                {#if advisor.socials?.whatsapp}
                                                    <a 
                                                        href={`https://wa.me/${advisor.socials.whatsapp.replace(/\+/g, '')}`}
                                                        class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors duration-300"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                                             class="w-3 h-3 fill-current"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                        WhatsApp
                                                    </a>
                                                {/if}
                                            {/if}
                                            
                                            {#if advisor.email}
                                                <a 
                                                    href={`mailto:${advisor.email}`}
                                                    class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-300"
                                                >
                                                    <Mail class="w-3 h-3" />
                                                    Email
                                                </a>
                                            {/if}
                                            
                                            {#if advisor.socials?.linkedin}
                                                <a 
                                                    href={advisor.socials.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors duration-300"
                                                >
                                                    <svg class="w-3 h-3 fill-current" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
                                                    LinkedIn
                                                </a>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else if advisors.length === 0 && !(data && data.error)}
            <div class="max-w-lg mx-auto bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 p-8 shadow-md text-center">
                <div class="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3 class="text-xl font-medium text-gray-800 mb-2">No Advisors Available</h3>
                <p class="text-gray-500 mb-6">We couldn't find any advisor information. Please check back later as we update our records.</p>
                
                <button 
                    onclick={() => window.location.reload()}
                    class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 2v6h-6"></path>
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                        <path d="M3 22v-6h6"></path>
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                    </svg>
                    Refresh Page
                </button>
            </div>
    {/if}
    </div>
</div>
