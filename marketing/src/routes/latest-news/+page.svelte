<script>
    import SEO from '$lib/components/SEO.svelte';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import { Image } from '$lib/components/ui/image';
    import { Calendar, ArrowRight } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';

    let { data } = $props();
    const items = $derived(data.items || []);

    let visible = $state(false);

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    onMount(() => {
        visible = true;
    });
</script>

<SEO
    title="Latest News"
    description="Official announcements, event reports, and updates from MSSN OAU."
    path="/latest-news"
/>

<PageHeader subtitle="Stay up to date with announcements, updates and stories from across the MSSN OAU community.">
    Latest News
</PageHeader>

<section class="py-12 sm:py-16 relative overflow-hidden">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-green-700/10 rounded-full blur-3xl"></div>

    <div class="max-w-6xl mx-auto px-5 sm:px-10 relative z-10">
        {#if visible}
            {#if items.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {#each items as item, i (item.id)}
                        <a
                            href="/latest-news/{item.id}"
                            class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                            in:fly={{ y: 30, duration: 400, delay: i * 80 }}
                        >
                            {#if item.image}
                                <div class="relative h-48 overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        width={400}
                                        height={200}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                    {#if item.category}
                                        <span class="absolute top-3 left-3 px-3 py-1 bg-green-700 text-white text-[11px] font-semibold rounded-full">
                                            {item.category}
                                        </span>
                                    {/if}
                                </div>
                            {/if}

                            <div class="p-5 flex flex-col flex-1">
                                <div class="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                                    <Calendar class="w-3 h-3" />
                                    <span>{formatDate(item.date)}</span>
                                    {#if item.author}
                                        <span>•</span>
                                        <span>{item.author}</span>
                                    {/if}
                                </div>

                                <h3 class="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-2 line-clamp-2">
                                    {item.title}
                                </h3>

                                <p class="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
                                    {item.summary}
                                </p>

                                <span class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-green-700 group-hover:text-green-800">
                                    Read More <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-20">
                    <p class="text-gray-400 text-sm">No news items yet. Check back later.</p>
                </div>
            {/if}
        {/if}
    </div>
</section>
