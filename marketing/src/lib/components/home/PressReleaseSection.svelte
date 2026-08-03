<script>
    import { fly, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { Image } from '$lib/components/ui/image';
    import { Link, Calendar, ExternalLink } from '@lucide/svelte';

    let { links = [] } = $props();

    let visible = $state(false);

    function formatDate(/** @type {string} */ dateStr) {
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
                    <Link class="w-4 h-4" />
                    From Our Blog
                </div>
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-secondary mb-4">
                    Press <span class="text-green-700">Releases</span>
                </h2>
                <p class="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg font-tertiary leading-relaxed">
                    Official press releases and featured articles from the An-Nuur Press.
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {#each links.slice(0, 3) as link, i (link.id)}
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                        in:scale={{ duration: 400, delay: 300 + (i * 100) }}
                    >
                        {#if link.image}
                            <div class="relative h-48 overflow-hidden">
                                <Image
                                    src={link.image}
                                    alt={link.title}
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
                                <span>{formatDate(link.date)}</span>
                            </div>

                            <h3 class="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-2 line-clamp-2">
                                {link.title}
                            </h3>

                            <p class="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
                                {link.description}
                            </p>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    </div>
</section>
