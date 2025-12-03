<script>
    import { cn } from '$lib/utils/cn';

    let { children,className} = $props();
</script>

<div
        class={cn(
		'h-96 w-96 [transform-style:preserve-3d]  [&>*]:[transform-style:preserve-3d]',
		className
	)}
>
    {@render children?.()}
</div>