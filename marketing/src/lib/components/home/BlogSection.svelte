<script>
    import { fly, scale } from 'svelte/transition'
    import { onMount } from 'svelte'
    import { Image } from '$lib/components/ui/image'
    import { Calendar, ExternalLink, ChevronRight, Link as LinkIcon } from '@lucide/svelte'
    import { browser } from '$app/environment'

    const BLOG_API = 'http://localhost:3000/public/blog-posts/approved'

    let { posts: initialPosts = [] } = $props()

    let visible = $state(false)
    let posts = $state(initialPosts)
    let loading = $state(false)

    const hasPosts = $derived(Array.isArray(posts) && posts.length > 0)

    function formatDate(dateStr) {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    }

    onMount(async () => {
        visible = true

        if (browser && (!posts || posts.length === 0)) {
            loading = true
            try {
                const res = await fetch(BLOG_API, { signal: AbortSignal.timeout(10000) })
                if (res.ok) {
                    const json = await res.json()
                    if (json?.success && Array.isArray(json.data?.posts)) {
                        posts = [...json.data.posts]
                            .sort((a, b) => new Date(b.approvedAt || 0) - new Date(a.approvedAt || 0))
                            .slice(0, 3)
                            .map(p => ({
                            id: p.wpId,
                            title: p.title,
                            excerpt: p.excerpt,
                            link: p.link,
                            date: p.wpDate,
                            featured_image: p.featuredImage || '',
                            categories: safeParse(p.categories)
                        }))
                    }
                }
            } catch (err) {
                console.error('Error fetching blog posts:', err)
            } finally {
                loading = false
            }
        }
    })

    function safeParse(json) {
        try { return json ? JSON.parse(json) : []; } catch { return []; }
    }
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
                    <LinkIcon class="w-4 h-4" />
                    From Our Blog
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-secondary mb-4">
                    Press <span class="text-green-700">Releases</span>
                </h2>
                <p class="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg font-tertiary leading-relaxed">
                    Official press releases and featured articles from the An-Nuur Press.
                </p>
            </div>

            {#if loading}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {#each Array(3) as _, i}
                        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                            <div class="h-48 bg-gray-200"></div>
                            <div class="p-5 space-y-3">
                                <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                                <div class="h-5 bg-gray-200 rounded"></div>
                                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else if hasPosts}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {#each posts.slice(0, 3) as post, i}
                        <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                            in:scale={{ duration: 400, delay: 300 + (i * 100) }}
                        >
                            {#if post.featured_image}
                                <div class="relative h-48 overflow-hidden">
                                    <Image
                                        src={post.featured_image}
                                        alt={post.title}
                                        width={400}
                                        height={200}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                    <span class="absolute top-3 right-3 px-3 py-1 bg-green-700 text-white text-[11px] font-semibold rounded-full flex items-center gap-1">
                                        <ExternalLink class="w-3 h-3" /> Read Article
                                    </span>
                                </div>
                            {/if}

                            <div class="p-5 flex flex-col flex-1">
                                <div class="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                                    <Calendar class="w-3 h-3" />
                                    <span>{formatDate(post.date)}</span>
                                </div>

                                <h3 class="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-2 line-clamp-2">
                                    {post.title}
                                </h3>

                                <p class="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
                                    {post.excerpt?.replace(/<[^>]+>/g, '')}
                                </p>
                            </div>
                        </a>
                    {/each}
                </div>

                <div class="mt-12 text-center" in:fly={{ y: 20, duration: 600, delay: 600 }}>
                    <a
                        href="/blog"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        View All Press Releases
                        <ChevronRight class="w-4 h-4" />
                    </a>
                </div>
            {/if}
        {/if}
    </div>
</section>
