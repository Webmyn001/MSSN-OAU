<script>
    import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="py-16 sm:py-20 lg:py-24">
    <div class="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        <div class="flex flex-col items-center gap-4">
            <Skeleton class="h-8 w-48 rounded-full" />
            <Skeleton class="h-10 w-72 sm:w-96" />
            <Skeleton class="h-5 w-80 sm:w-[28rem] max-w-full" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            {#each Array(3) as _}
                <Skeleton class="h-72 w-full rounded-2xl" />
            {/each}
        </div>
    </div>
</div>
