<script>
    import { ExternalLink } from '@lucide/svelte'

    let { data } = $props()
</script>

<div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center">
        <div class="animate-spin size-8 border-2 border-primary-700 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500">Redirecting to An-Nuur Press...</p>
        <a
            href="https://annuurpress.org.ng"
            target="_blank"
            class="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 mt-4 transition-colors"
        >
            Visit An-Nuur Press
            <ExternalLink class="size-3.5" />
        </a>
    </div>
</div>
