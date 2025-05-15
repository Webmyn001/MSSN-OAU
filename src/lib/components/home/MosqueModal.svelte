<script>
    import { onMount } from 'svelte';
    import * as Sheet from '$lib/components/ui/sheet';
    import * as Carousel from '$lib/components/ui/carousel';
    import { Button } from '$lib/components/ui/button';
    import { MapPinned } from 'lucide-svelte';
    
    export let mosque = {
        id: "",
        label: "",
        url: "",
        images: [""],
        address: ""
    };
    
    export let isOpen = false;
    export let onClose = () => {};
    
    // For Carousel autoplay
    let Autoplay;
    
    onMount(async () => {
        const autoplayModule = await import('embla-carousel-autoplay');
        Autoplay = autoplayModule.default;
    });
</script>

{#if Autoplay}
    <Sheet.Root bind:open={isOpen}>
        <Sheet.Content class="scrollbar-hide" onCloseAutoFocus={() => {}} side="bottom">
            <Sheet.Header>
                <Sheet.Title class="font-primary">{mosque.label}</Sheet.Title>
                <Sheet.Description class="font-tertiary text-xs">
                    {mosque.address}
                </Sheet.Description>
            </Sheet.Header>
            
            <Carousel.Root
                plugins={[
                    Autoplay({
                        delay: 5000,
                    }),
                ]}
                class="w-full"
                opts={{ align: "center", loop: true }}
            >
                <Carousel.Content class="w-full">
                    {#each mosque.images as image, i}
                        <Carousel.Item class="basis-full">
                            <img 
                                class="h-[40dvh] sm:h-[50dvh] w-full object-cover rounded-xl mx-auto my-6"
                                src={image}
                                alt={`${mosque.label} ${i + 1}`}
                            />
                        </Carousel.Item>
                    {/each}
                </Carousel.Content>
                <Carousel.Previous class="left-2" />
                <Carousel.Next class="right-2" />
            </Carousel.Root>

            <Sheet.Footer class="gap-3">
                <Button variant="outline" onclick={onClose}>Close</Button>
                {#if mosque.url}
                    <Button 
                        class="bg-primary-800 hover:bg-primary-800/90 text-white"
                        onclick={() => window.open(mosque.url, '_blank')}
                    >
                        <MapPinned class="size-5 mr-2" />
                        View on Maps
                    </Button>
                {/if}
            </Sheet.Footer>
        </Sheet.Content>
    </Sheet.Root>
{/if} 