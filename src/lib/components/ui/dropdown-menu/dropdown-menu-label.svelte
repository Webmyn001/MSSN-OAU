<script>
    import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
    import { cn } from "$lib/utils.js";

    /**
     * @typedef {import("bits-ui").DropdownMenuLabelProps} $$Props
     * @property {boolean} [inset] - Optional inset style.
     */

    /** @type {$$Props["class"]} */
    let className = undefined;

    /** @type {$$Props["inset"]} */
    export let inset = undefined;

    export { className as class };
</script>


<DropdownMenuPrimitive.Label
        class={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
        {...$$restProps}
>
    <slot />
</DropdownMenuPrimitive.Label>