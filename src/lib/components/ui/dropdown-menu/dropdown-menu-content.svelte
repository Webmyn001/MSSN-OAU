<script>
    import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
    import { cn, flyAndScale } from "$lib/utils.js";

    /**
     * @typedef {import("bits-ui").DropdownMenuContentProps} $$Props
     */

    /**
     * @typedef {import("bits-ui").DropdownMenuContentEvents} $$Events
     */

    /** @type {$$Props["class"]} */
    let className = undefined;

    /** @type {$$Props["sideOffset"]} */
    export let sideOffset = 4;

    /** @type {$$Props["transition"]} */
    export let transition = flyAndScale;

    /** @type {$$Props["transitionConfig"]} */
    export let transitionConfig = undefined;

    export { className as class };
</script>


<DropdownMenuPrimitive.Content
        {transition}
        {transitionConfig}
        {sideOffset}
        class={cn(
		"bg-popover text-popover-foreground z-50 min-w-[8rem] rounded-md border p-1 shadow-md focus:outline-none",
		className
	)}
        {...$$restProps}
        on:keydown
>
    <slot />
</DropdownMenuPrimitive.Content>