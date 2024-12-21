<script>
    import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

    /**
     * @typedef {import("bits-ui").DropdownMenuRadioGroupProps} $$Props
     */

    /** @type {$$Props["value"]} */
    export let value = undefined;
</script>


<DropdownMenuPrimitive.RadioGroup {...$$restProps} bind:value>
    <slot />
</DropdownMenuPrimitive.RadioGroup>