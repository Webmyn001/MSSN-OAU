<script>
    import { fly, fade } from 'svelte/transition'
    import { onMount } from 'svelte'
    import { Calendar, Mail, Send, ExternalLink, Search, ChevronDown, Filter } from '@lucide/svelte'
    import { toast } from 'svelte-sonner'
    import { formatDate } from "$lib/utils/dates.js"
	import { Image } from '$lib/components/ui/image'
	import SEO from '$lib/components/SEO.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { API_BASE } from '$lib/api/base';

    /**
     * @typedef {import('$lib/types.js').WordPressPost} WordPressPost
     */

    let { data } = $props()

    let visible = $state(false)
    let email = $state("")
    let posts = $state(/** @type {WordPressPost[]} */ ([]))
    let searchQuery = $state("")
    let selectedCategory = $state("All")
    let showCategoryDropdown = $state(false)

    onMount(() => {
        visible = true
        if (data.posts && data.posts.length > 0) {
            posts = data.posts;
        }
    })

    const allCategories = $derived(() => {
        const cats = new Set()
        for (const post of posts) {
            if (post.categories) {
                for (const cat of post.categories) cats.add(cat)
            }
        }
        return ["All", ...Array.from(cats).sort()]
    })

    const filteredPosts = $derived(() => {
        let result = posts
        if (selectedCategory !== "All") {
            result = result.filter(p => p.categories?.includes(selectedCategory))
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase()
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.excerpt.toLowerCase().includes(q) ||
                (p.categories || []).some(c => c.toLowerCase().includes(q))
            )
        }
        return result
    })

    const handleSubscribe = async (e) => {
        e.preventDefault()
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            toast.error("Please enter a valid email address")
            return
        }

        try {
            const res = await fetch(`${API_BASE}/public/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail })
            });
            const json = await res.json();
            if (json.success) {
                toast.success(json.data?.message || "Successfully subscribed to our newsletter!");
                email = "";
            } else {
                toast.error(json.error || "Subscription failed. Please try again.");
            }
        } catch (err) {
            toast.error("Unable to connect to subscription server.");
        }
    }

    const jsonLd = $derived([
        {
            "@type": "WebPage",
            "name": "Our Blog | MSSNOAU",
            "description": "Welcome to the Muslim Students Society of Nigeria, Great Ife (OAU) Branch.",
            "publisher": {
                "@type": "Organization",
                "name": "MSSNOAU"
            }
        },
        ...(posts || []).map(post => ({
            '@type': 'Article',
            mainEntityOfPage: { '@type': 'WebPage', '@id': post.link },
            headline: post.title,
            image: [post.featured_image],
            datePublished: post.date,
            dateModified: post.date,
            author: { '@type': 'Organization', name: 'MSSN OAU' },
            publisher: {
                '@type': 'Organization',
                name: 'MSSNOAU',
                logo: { '@type': 'ImageObject', url: 'https://mssnoau.sirv.com/mssn-logo.png' }
            }
        }))
    ])
</script>

<SEO
    title="Blog"
    description="Welcome to the Muslim Students Society of Nigeria, Great Ife (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
    path="/blog"
    type="WebPage"
    images={[{ url: 'https://i.ibb.co/zbWfh5B/home.webp', width: 1200, height: 640, alt: 'MSSNOAU Blog' }]}
    schema={jsonLd}
    keywords={["mssnoau blog", "an-nuur press", "islamic articles", "muslim students oau blog", "oau mssn articles"]}
/>

<PageHeader>
    Our Blog
    <p class="text-neutral-100 text-center font-tertiary sm:text-sm text-xs mt-4">
        Reflective, immersive write-ups, curated by the <a href="https://annuurpress.org.ng/"
                                                           class="semibold underline">An-Nuur Press</a>
    </p>
</PageHeader>

<section class="py-12 relative overflow-hidden">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>

    <div class="max-w-5xl mx-auto px-5 sm:px-8 space-y-8 relative z-10">
        {#if visible}
            <!-- Search and Filter Bar -->
            <div class="flex flex-col sm:flex-row gap-3" in:fly={{ y: 20, duration: 600, delay: 100 }}>
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                        type="text"
                        bind:value={searchQuery}
                        class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/80 backdrop-blur-sm border border-primary-100 text-gray-800 text-sm placeholder:text-gray-400 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
                        placeholder="Search articles..."
                    />
                </div>

                <div class="relative">
                    <button
                        onclick={() => showCategoryDropdown = !showCategoryDropdown}
                        class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/80 backdrop-blur-sm border border-primary-100 text-sm text-gray-700 hover:border-primary-300 transition-all whitespace-nowrap"
                    >
                        <Filter class="size-4" />
                        <span>{selectedCategory}</span>
                        <ChevronDown class="size-3.5 transition-transform {showCategoryDropdown ? 'rotate-180' : ''}" />
                    </button>

                    {#if showCategoryDropdown}
                        <div
                            class="absolute right-0 top-full mt-1 bg-white border border-primary-100 rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
                            in:fade={{ duration: 150 }}
                        >
                            {#each allCategories() as cat}
                                <button
                                    onclick={() => { selectedCategory = cat; showCategoryDropdown = false; }}
                                    class="w-full text-left px-4 py-2 text-sm transition-colors {selectedCategory === cat ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}"
                                >
                                    {cat}
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            {#if showCategoryDropdown}
                <button
                    class="fixed inset-0 z-40"
                    onclick={() => showCategoryDropdown = false}
                    aria-label="Close category filter"
                ></button>
            {/if}

            {#if filteredPosts().length > 0}
                <!-- Card Grid -->
                <div class="grid sm:grid-cols-2 gap-6">
                    {#each filteredPosts() as post, i}
                        <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="group flex flex-col bg-white/80 backdrop-blur-sm border border-primary-100 hover:border-primary-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                            in:fly={{ y: 20, duration: 600, delay: 150 + (i * 80) }}
                        >
                            <!-- Image -->
                            <div class="relative overflow-hidden bg-gray-200 aspect-[16/10]">
                                {#if post.categories && post.categories.length > 0}
                                    <div class="absolute top-3 left-3 z-10">
                                        <span class="px-2.5 py-1 text-xs font-medium bg-primary-700/90 text-white backdrop-blur-sm rounded-full">
                                            {post.categories[0]}
                                        </span>
                                    </div>
                                {/if}
                                <Image
                                    src={post.featured_image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f3f4f6' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    alt={post.title}
                                    width={400}
                                    height={200}
                                    loading="lazy"
                                />
                            </div>

                            <!-- Content -->
                            <div class="flex flex-col p-5 flex-1">
                                <h2 class="text-lg font-bold text-gray-800 group-hover:text-primary-700 transition-colors line-clamp-2 mb-2">
                                    {@html post.title}
                                </h2>
                                <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                    <Calendar class="size-3.5" />
                                    <span>{formatDate(post.date).fullDate}</span>
                                </div>
                                <p class="text-gray-600 text-sm line-clamp-3 leading-relaxed flex-1">
                                    {@html post.excerpt}
                                </p>

                                <div class="mt-4 pt-4 border-t border-gray-100">
                                    <span class="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 group-hover:text-primary-800 transition-colors">
                                        Read on An-Nuur Press
                                        <ExternalLink class="size-3.5" />
                                    </span>
                                </div>
                            </div>
                        </a>
                    {/each}
                </div>

                <!-- Powered by WordPress -->
                <div class="flex justify-center pt-4" in:fly={{ y: 20, duration: 600, delay: 400 }}>
                    <span class="text-xs text-gray-400 flex items-center gap-1.5">
                        Powered by
                        <a href="https://wordpress.org" target="_blank" rel="noopener" class="text-primary-600 hover:text-primary-700 font-medium transition-colors">WordPress</a>
                    </span>
                </div>
            {:else}
                <!-- Empty state -->
                <div
                    class="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 p-8 shadow-md max-w-lg mx-auto text-center"
                    in:fly={{ y: 30, duration: 800, delay: 200 }}
                >
                    <div class="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <line x1="10" y1="9" x2="8" y2="9"></line>
                        </svg>
                    </div>
                    <h3 class="text-xl font-medium text-gray-800 mb-2">No Blog Posts Available</h3>
                    <p class="text-gray-500 mb-6">We're currently refreshing our content. Please check back soon for new articles and updates.</p>

                    <a
                        href="https://annuurpress.org.ng"
                        target="_blank"
                        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors"
                    >
                        <span>Visit An-Nuur Press</span>
                        <ExternalLink class="size-4" />
                    </a>
                </div>
            {/if}

            <!-- Newsletter Form -->
            <div
                id="newsletter"
                class="p-6 sm:p-8 rounded-xl bg-white/80 backdrop-blur-sm border border-primary-100 shadow-md relative overflow-hidden"
                in:fly={{ y: 20, duration: 600, delay: 500 }}
            >
                <div class="absolute w-32 h-32 rounded-full bg-gradient-to-bl from-primary-500/30 to-primary-700/30 blur-3xl -top-16 -left-16 opacity-60"></div>
                <div class="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-primary-500/30 to-primary-700/30 blur-3xl -bottom-16 -right-16 opacity-60"></div>

                <div class="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                    <div class="flex items-center gap-3 shrink-0">
                        <div class="inline-flex items-center justify-center size-12 rounded-full bg-primary-100 text-primary-700">
                            <Mail class="size-6" />
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-900 text-lg font-secondary">Join our Newsletter</h3>
                            <p class="text-gray-500 text-xs font-tertiary">Events, Blog Posts and Press Releases.</p>
                        </div>
                    </div>

                    <form
                        class="flex w-full sm:flex-1 gap-2"
                        onsubmit={handleSubscribe}
                    >
                        <input
                            type="email"
                            bind:value={email}
                            class="py-2.5 px-4 rounded-lg text-gray-800 bg-white border border-gray-200 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 flex-1 text-sm placeholder:text-gray-400 transition-all"
                            placeholder="ali@example.com"
                        />
                        <button
                            type="submit"
                            class="py-2.5 px-5 rounded-lg bg-primary-700 text-white font-medium text-sm flex items-center gap-2 hover:bg-primary-800 transition-all shrink-0"
                        >
                            Subscribe
                            <Send class="size-3.5" />
                        </button>
                    </form>
                </div>
            </div>
        {/if}
    </div>
</section>
