<script>
    import { cn } from '$lib/utils/cn';
    import { onMount, onDestroy } from 'svelte';


    let { minSize = 8, maxSize = 16, speed = 12, particleColor = '#026d3b', secondaryColor = '#EBB957', particleDensity = 100, className = undefined } = $props();

    function getRandomValue(min, max) {
        return min + Math.random() * (max - min);
    }
    
    // Create blood cell-like particles
    let particles = $state(Array(particleDensity).fill(null).map(() => {
        const size = getRandomValue(minSize, maxSize);
        const isYellow = Math.random() < 0.2; // 20% chance of yellow cells
        
        return {
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: size,
            innerSize: size * 0.6, // The dimple size
            animationDuration: getRandomValue(speed, speed * 2),
            opacity: getRandomValue(0.6, 0.9),
            color: isYellow ? secondaryColor : particleColor,
            velocityX: getRandomValue(-0.1, 0.1),
            velocityY: getRandomValue(-0.1, 0.1),
            rotation: getRandomValue(0, 360)
        };
    }));
    
    // For moving particles
    let animationFrameId = $state(null);
    
    function animateParticles() {
        particles = particles.map(particle => {
            // Move particles with slight randomness
            let newTop = particle.top + particle.velocityY;
            let newLeft = particle.left + particle.velocityX;
            
            // Slightly change velocity for organic movement
            let newVelocityX = particle.velocityX + getRandomValue(-0.01, 0.01);
            let newVelocityY = particle.velocityY + getRandomValue(-0.01, 0.01);
            
            // Limit velocity
            newVelocityX = Math.max(-0.2, Math.min(0.2, newVelocityX));
            newVelocityY = Math.max(-0.2, Math.min(0.2, newVelocityY));
            
            // Keep particles within bounds with wrapping
            if (newTop < -5) newTop = 105;
            if (newTop > 105) newTop = -5;
            if (newLeft < -5) newLeft = 105;
            if (newLeft > 105) newLeft = -5;
            
            // Slowly rotate
            let newRotation = (particle.rotation + 0.1) % 360;
            
            return {
                ...particle,
                top: newTop,
                left: newLeft,
                velocityX: newVelocityX,
                velocityY: newVelocityY,
                rotation: newRotation
            };
        });
        
        animationFrameId = requestAnimationFrame(animateParticles);
    }
    
    onMount(() => {
        animationFrameId = requestAnimationFrame(animateParticles);
    });
    
    onDestroy(() => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });
</script>

<div class={cn('relative h-48 overflow-hidden', className)}>
    <div class="absolute inset-0">
        {#each particles as particle, i (`cell-${i}`)}
            <div
                class="absolute rounded-full"
                style={`
                    width: ${particle.size}px; 
                    height: ${particle.size}px; 
                    background-color: ${particle.color}; 
                    top: ${particle.top}%; 
                    left: ${particle.left}%; 
                    opacity: ${particle.opacity};
                    transform: rotate(${particle.rotation}deg);
                    box-shadow: 0 0 ${particle.size/4}px ${particle.size/8}px ${particle.color}40;
                `}
            >
                <!-- The dimple/depression in the center of the blood cell -->
                <div 
                    class="absolute rounded-full bg-white/20 backdrop-blur-sm"
                    style={`
                        width: ${particle.innerSize}px; 
                        height: ${particle.innerSize}px; 
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        box-shadow: inset 0 0 ${particle.size/8}px ${particle.size/10}px rgba(0,0,0,0.2);
                    `}
                ></div>
            </div>
        {/each}
    </div>
    
    <!-- Add subtle gradient overlays for depth -->
    <div class="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 pointer-events-none"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none"></div>
</div>