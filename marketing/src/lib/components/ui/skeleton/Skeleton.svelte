<script>
    import { cn } from '$lib/utils/cn';

    let { class: className = '', ...rest } = $props();
</script>

<div class={cn('animate-pulse rounded-md bg-primary-900/10', className)} {...rest}></div>
