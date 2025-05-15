<script>
    import { fly, fade } from 'svelte/transition'
    import { onMount } from 'svelte'

    let { children } = $props()
    
    let visible = $state(false);
    
    onMount(() => {
        visible = true
    })
</script>

<div class="relative h-[20dvh] sm:h-[30dvh] lg:h-[40dvh] bg-[url('/images/bg-1.webp')] w-full bg-no-repeat bg-cover bg-center overflow-hidden">
    <!-- Enhanced gradient overlay with animation -->
    <div class="absolute inset-0 w-full h-full">
        <div
            in:fade={{ duration: 1000 }}
            class="w-full h-full backdrop-blur-[2px]"
            style="background: linear-gradient(85.35deg, hsl(var(--primary-700) / 0.85) 2.89%, hsl(var(--primary-600) / 0.75) 96.95%);"
        >
            <!-- Decorative elements -->
            <div class="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div class="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                <div class="absolute -bottom-40 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    </div>
    
    <!-- Content with animation -->
    <div class="relative w-full h-full z-[2] flex justify-center items-center">
        {#if visible}
            <h2 
                in:fly={{ y: 30, duration: 800, delay: 300 }}
                class="font-secondary text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-xl flex justify-center items-center flex-col text-center px-4"
            >
                {@render children?.()}
            </h2>
        {/if}
    </div>
    
    <!-- Decorative bottom curve -->
    <div class="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 40" class="w-full h-auto fill-white">
            <path d="M0,32L80,26.7C160,21,320,11,480,10.7C640,11,800,21,960,26.7C1120,32,1280,32,1360,32L1440,32L1440,40L1360,40C1280,40,1120,40,960,40C800,40,640,40,480,40C320,40,160,40,80,40L0,40Z"></path>
        </svg>
    </div>
</div>