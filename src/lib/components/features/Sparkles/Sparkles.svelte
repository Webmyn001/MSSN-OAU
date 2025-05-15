<script>
    import { cn } from '$lib/utils/cn';
    import { onMount } from 'svelte';
    let randomMove = () => Math.random() * 4 - 2;

    export let minSize = 0.6;
    export let maxSize = 1.5;
    export let speed = 5;
    export let particleColor = '#ffffff';
    export let particleDensity = 200;
    export let className = undefined;

    function getRandomValue() {
        return minSize + Math.random() * (maxSize - minSize);
    }
    
    let particles = Array(particleDensity).fill(null).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: getRandomValue(),
        animationDuration: Math.random() * 10 + speed,
        opacity: Math.random()
    }));
</script>

<div class={cn('relative h-48', className)}>
    <div class="absolute inset-0">
        {#each particles as particle, i (`star-${i}`)}
            <span
                class="inline-block absolute rounded-full animate-pulse"
                style={`
                    width: ${particle.size}px; 
                    height: ${particle.size}px; 
                    background-color: ${particleColor}; 
                    top: ${particle.top}%; 
                    left: ${particle.left}%; 
                    opacity: ${particle.opacity};
                    animation-duration: ${particle.animationDuration}s;
                `}
            ></span>
        {/each}
    </div>
</div>

<style>
    @keyframes pulse {
        0% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1.2); }
        100% { opacity: 0; transform: scale(0); }
    }
    .animate-pulse {
        animation-name: pulse;
        animation-iteration-count: infinite;
    }
</style>