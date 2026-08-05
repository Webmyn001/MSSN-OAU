<script>
    import { page } from '$app/state';
    import SEO from '$lib/components/SEO.svelte';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import { Calendar, User, Tag, ArrowLeft } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';

    let { data } = $props();
    const item = $derived(data.item);
    const id = $derived(page.params.id);

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

{#if item}
    <SEO
        title={item.title}
        description={item.summary}
        path="/latest-news/{id}"
        type="Article"
        images={item.image ? [{ url: item.image, width: 1200, height: 630, alt: item.title }] : []}
    />

    <PageHeader subtitle="Stay up to date with announcements, updates and stories from across the MSSN OAU community.">
        Latest News
    </PageHeader>

    <article class="py-12 sm:py-16 relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>

        <div class="max-w-3xl mx-auto px-5 sm:px-10 relative z-10">
            {#if visible}
                <div in:fly={{ y: 30, duration: 800, delay: 100 }}>
                    <a href="/#latest-news" class="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 font-medium mb-6 transition-colors">
                        <ArrowLeft class="w-4 h-4" /> Back to Home
                    </a>

                    <div class="flex items-center gap-3 flex-wrap mb-4">
                        {#if item.category}
                            <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                <Tag class="w-3 h-3" /> {item.category}
                            </span>
                        {/if}
                        <span class="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Calendar class="w-3.5 h-3.5" /> {formatDate(item.date)}
                        </span>
                        {#if item.author}
                            <span class="inline-flex items-center gap-1 text-xs text-gray-400">
                                <User class="w-3.5 h-3.5" /> {item.author}
                            </span>
                        {/if}
                    </div>

                    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-secondary leading-tight mb-6">
                        {item.title}
                    </h1>

                    {#if item.image}
                        <div class="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
                            <img
                                src={item.image}
                                alt={item.title}
                                class="w-full h-auto max-h-[400px] object-cover"
                            />
                        </div>
                    {/if}

                    <div class="bg-green-50/50 border border-green-100 rounded-xl p-5 mb-8">
                        <p class="text-sm text-gray-700 leading-relaxed font-medium">{item.summary}</p>
                    </div>

                    {#if item.image2}
                        <div class="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
                            <img
                                src={item.image2}
                                alt={item.title}
                                class="w-full h-auto max-h-[350px] object-cover"
                            />
                        </div>
                    {/if}

                    {#if item.content}
                        <div class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-700 prose-img:rounded-xl">
                            {@html item.content}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </article>
{:else}
    <PageHeader>Not Found</PageHeader>
    <div class="py-20 text-center">
        <p class="text-gray-500 mb-4">This news item could not be found.</p>
        <a href="/" class="text-green-700 hover:text-green-800 font-medium text-sm">Return to Home</a>
    </div>
{/if}
