<script>
    import { SquareArrowOutUpRight, ChevronRight, Calendar, User, Clock } from '@lucide/svelte'
    import { Image } from '$lib/components/ui/image'
    import { Button } from "$lib/components/ui/button"
    import { fly, fade, scale } from 'svelte/transition'
    import { onMount } from 'svelte'

    let { posts = [] } = $props()
    let visible = $state(false);
    let hoveredPost = $state(null);
    
    // * Hide section if no posts available
    const hasPosts = $derived(Array.isArray(posts) && posts.length > 0);
    
    onMount(() => {
        visible = true
    })
</script>

{#if hasPosts}
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
    
    <!-- Title with animation -->
    <div class="max-w-2xl mx-auto text-left mb-10 lg:mb-14 relative z-10">
        {#if visible}
            <h2 
                in:fly={{ y: 30, duration: 800, delay: 200 }}
                class="text-2xl font-bold md:text-4xl md:leading-tight font-secondary text-primary-700 relative inline-block"
            >
                From the Press
                <span class="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-700 rounded-full"></span>
            </h2>
            <p 
                in:fly={{ y: 30, duration: 800, delay: 400 }}
                class="mt-4 font-tertiary text-primary-700"
            >
                Value Packed Insights and Publications from An-Nur Press
            </p>
        {/if}
    </div>
    <!-- End Title -->

    <!-- Grid with staggered animation -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {#if visible}
            {#each posts as post, i}
                <!-- Enhanced Card with glassmorphism -->
                <a 
                    in:fly={{ y: 30, duration: 800, delay: 600 + (i * 200) }}
                    class="group flex flex-col h-full backdrop-blur-sm bg-white/80 border border-primary-200 hover:border-transparent hover:shadow-xl focus:outline-none focus:border-transparent focus:shadow-xl transition-all duration-500 rounded-xl overflow-hidden"
                    href={post.link}
                    target="_blank"
                    onmouseenter={() => hoveredPost = post.title}
                    onmouseleave={() => hoveredPost = null}
                >
                    <div class="relative overflow-hidden">
                        <div class="aspect-w-16 aspect-h-11 overflow-hidden">
                            <Image 
                                className="w-full object-cover h-[210px] transition-transform duration-700 group-hover:scale-110" 
                                loading="lazy"
                                width={600}
                                height={337}
                                fetchpriority="low"
                                src={post.featured_image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='337'%3E%3Crect fill='%23f3f4f6' width='600' height='337'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E"}
                                alt={post.title}
                            />
                        </div>
                        
                        <!-- Category badge if available -->
                        {#if post.categories && post.categories.length > 0}
                            <div class="absolute top-3 right-3">
                                <span class="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                                    {post.categories[0]}
                                </span>
                            </div>
                        {/if}
                    </div>
                    
                    <div class="flex-1 p-5 flex flex-col">
                        <h3 class="text-xl font-secondary font-semibold text-primary-700 group-hover:text-primary-800 transition-colors mb-3">
                            {@html post.title}
                        </h3>
                        <p class="text-gray-700 font-tertiary flex-grow">
                            {@html post.excerpt}
                        </p>
                        
                        <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div class="flex items-center gap-x-3">
                                {#if post.authors && post.authors.length > 0 && post.authors[0]}
                                    <Image 
                                        className="size-8 rounded-full shadow-sm border border-white" 
                                        loading="lazy" 
                                        width={48} 
                                        height={48} 
                                        src={post.authors[0].avatar_urls?.["48"] || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23e5e7eb'/%3E%3Ccircle cx='24' cy='20' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 40c0-8.8 7.2-16 16-16s16 7.2 16 16' fill='%239ca3af'/%3E%3C/svg%3E"}
                                        alt={post.authors[0].name || "Author"} 
                                    />
                                    <div>
                                        <p class="text-sm text-gray-700 font-secondary">
                                            By {post.authors[0].name} {post.authors.length > 1 ? "and " + (post.authors.length - 1) + " others" : ""}
                                        </p>
                                    </div>
                                {:else if post.author}
                                    <Image 
                                        className="size-8 rounded-full shadow-sm border border-white" 
                                        loading="lazy" 
                                        width={48} 
                                        height={48} 
                                        src={post.author.picture || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23e5e7eb'/%3E%3Ccircle cx='24' cy='20' r='8' fill='%239ca3af'/%3E%3Cpath d='M8 40c0-8.8 7.2-16 16-16s16 7.2 16 16' fill='%239ca3af'/%3E%3C/svg%3E"}
                                        alt={post.author.name || "Author"} 
                                    />
                                    <div>
                                        <p class="text-sm text-gray-700 font-secondary">
                                            By {post.author.name}
                                        </p>
                                    </div>
                                {/if}
                            </div>
                            
                            <span class="inline-flex items-center justify-center size-8 rounded-full bg-primary-50 text-primary-700 group-hover:bg-primary-100 transition-colors">
                                <ChevronRight class="size-4" />
                            </span>
                        </div>
                    </div>
                </a>
                <!-- End Card -->
            {/each}
        {/if}
    </div>
    <!-- End Grid -->

    <!-- Call to action buttons with animation -->
    {#if visible}
        <div 
            in:fly={{ y: 30, duration: 800, delay: 1000 }}
            class="mt-12 text-center gap-4 flex flex-wrap justify-center"
        >
            <a 
                class="py-3 px-5 inline-flex items-center gap-x-2 text-sm font-medium font-secondary rounded-xl border border-primary-200 bg-primary-700 text-white shadow-sm hover:bg-primary-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                href="/blog"
                aria-label="Read more from our blog"
            >
                Read more
                <ChevronRight class="size-4" />
            </a>
            <a 
                class="py-3 px-5 inline-flex items-center gap-x-2 text-sm font-medium font-secondary rounded-xl border border-primary-200 bg-white text-primary-700 shadow-sm hover:bg-primary-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                href="/blog#newsletter"
            >
                Join Newsletter
                <ChevronRight class="size-4" />
            </a>
        </div>
    {/if}
    <!-- End Call to action -->
</div>
{/if}