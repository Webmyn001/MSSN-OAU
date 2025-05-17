<script>
    import { cn } from '$lib/utils/cn.js';

    let { children,
        className = undefined,
        translateX = 0,
        translateY = 0,
        translateZ = 0,
        rotateX = 0,
        rotateY = 0,
        rotateZ = 0,
        isMouseEntered = false,
        ...restProps // Capture other props if any, though typically used for component props not HTML attributes
    } = $props();

    let ref;

    $effect(() => {
        // Ensure ref is available and props are defined before running animations
        if (ref && typeof translateX === 'number') { // Check one prop as a proxy for all being ready
            handleAnimations();
        }
    });

    const handleAnimations = () => {
        if (!ref) return;
        if (isMouseEntered) {
            ref.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        } else {
            ref.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
        }
    };
</script>

<div
    bind:this={ref}
    class={cn('w-fit transition duration-200 ease-linear', className)}
    {...restProps}
>
    {@render children?.()}
</div>