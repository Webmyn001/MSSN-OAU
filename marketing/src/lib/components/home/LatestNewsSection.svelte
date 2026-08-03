<script>
    import { fly, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { Image } from '$lib/components/ui/image';
    import { Newspaper, Calendar, ArrowRight } from '@lucide/svelte';

    let { items = [] } = $props();

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

<section class="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white">
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute -top-40 -right-40 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-green-700/5 rounded-full blur-3xl"></div>
    </div>

    <div class="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10">
        {#if visible}
            <div class="text-center mb-12" in:fly={{ y: 30, duration: 800, delay: 200 }}>
                <div class="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                    <Newspaper class="w-4 h-4" />
                    Latest Updates
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-secondary mb-4">
                    Latest <span class="text-green-700">News</span>
                </h2>
                <p class="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg font-tertiary leading-relaxed">
                    Official announcements, event reports, and updates from MSSN OAU.
                </p>
            </div>

            {#if items.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {#each items as item, i (item.id)}
                        <a
                            href="/latest-news/{item.id}"
                            class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                            in:scale={{ duration: 400, delay: 300 + (i * 100) }}
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

                <div class="text-center mt-10">
                    <a
                        href="/latest-news"
                        class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-700 hover:bg-green-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        View All News <ArrowRight class="w-4 h-4" />
                    </a>
                </div>
            {:else}
                <div class="text-center py-12">
                    <p class="text-gray-400 text-sm">No news items yet. Check back later.</p>
                </div>
            {/if}
        {/if}
    </div>
</section>
