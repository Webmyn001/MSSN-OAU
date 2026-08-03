<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import * as Dialog from '$lib/components/ui/dialog/index.js';
    import * as Sheet from '$lib/components/ui/sheet/index.js';
    import { X } from '@lucide/svelte';

    let {
        open = $bindable(false),
        title = '',
        description = '',
        side = 'bottom',
        contentClass = '',
        onOpenChange,
        closeOnOutsideClick = true,
        closeOnEscape = true,
        portalTarget = '#modal-portal',
        trigger = undefined,
        header = undefined,
        children = undefined,
        footer = undefined
    } = $props();

    /** @type {boolean} */
    let isMobile = $state(false);
    
    /** @type {number} */
    let windowWidth = $state(0);

    /**
     * Updates the isMobile state based on the current window width.
     * Sets isMobile to true if the window width is less than 768px.
     */
    function updateIsMobile() {
        if (browser) {
            windowWidth = window.innerWidth;
            isMobile = windowWidth < 768; 
        }
    }

    onMount(() => {
        updateIsMobile();
        window.addEventListener('resize', updateIsMobile);
        return () => {
            window.removeEventListener('resize', updateIsMobile);
        };
    });

</script>

{#if trigger}
    {@render trigger()}
{/if}

{#if isMobile}
    <Sheet.Root bind:open={open} {onOpenChange}>
        <Sheet.Content
            {side}
            class="flex flex-col p-0 max-h-[85dvh] {contentClass}" 
            portalProps={{ target: portalTarget }}
            aria-describedby={description ? 'sheet-description' : undefined}
            onInteractOutside={(/** @type {any} */ e) => { if (closeOnOutsideClick) { e.preventDefault(); open = false; } }}
        >
            {#if header}
                 {@render header()}
            {:else if title}
                <Sheet.Header class="sticky top-0 bg-background/90 backdrop-blur-sm z-20 px-6 pt-5 pb-4 border-b text-left">
                    <Sheet.Title class="text-lg font-semibold text-foreground pr-8">{title}</Sheet.Title>
                    {#if description}
                        <Sheet.Description id="sheet-description" class="text-xs text-muted-foreground mt-0.5">{description}</Sheet.Description>
                    {/if}
                    <Sheet.Close
                        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                        <X class="h-5 w-5" />
                        <span class="sr-only">Close</span>
                    </Sheet.Close>
                </Sheet.Header>
            {/if}

            <div class="flex-1 overflow-y-auto p-6 dialog-inner-content-scrollable">
                {@render children?.()}
            </div>

            {#if footer}
                <Sheet.Footer class="sticky bottom-0 bg-background/90 backdrop-blur-sm z-20 p-4 border-t mt-auto">
                    {@render footer()}
                </Sheet.Footer>
            {/if}
        </Sheet.Content>
    </Sheet.Root>
{:else}
    <Dialog.Root bind:open={open} {onOpenChange}>
        <Dialog.Content
            class="sm:max-w-md flex flex-col {contentClass}" 
            portalProps={{ target: portalTarget }}
            aria-describedby={description ? 'dialog-description' : undefined}
        >
            {#if header}
                {@render header()}
            {:else if title}
                <Dialog.Header class="text-left">
                    <Dialog.Title class="text-xl font-semibold text-foreground">{title}</Dialog.Title>
                    {#if description}
                        <Dialog.Description id="dialog-description" class="text-sm text-muted-foreground mt-1">{description}</Dialog.Description>
                    {/if}
                </Dialog.Header>
                 <Dialog.Close
                    class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X class="h-4 w-4" />
                    <span class="sr-only">Close</span>
                </Dialog.Close>
            {/if}

            <div class="flex-1 overflow-y-auto py-4 dialog-inner-content-scrollable">
                {@render children?.()}
            </div>

            {#if footer}
                <Dialog.Footer class="mt-auto">
                    {@render footer()}
                </Dialog.Footer>
            {/if}
        </Dialog.Content>
    </Dialog.Root>
{/if} 