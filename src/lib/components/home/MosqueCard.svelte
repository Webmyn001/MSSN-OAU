<script>
    import { Badge } from "$lib/components/ui/badge";
    
    export let mosque = {
        id: "",
        label: "",
        url: "",
        images: [""],
        address: ""
    };
    
    export let onClick = () => {};
</script>

<Badge 
    variant="outline" 
    class="cursor-pointer hover:bg-primary-50 hover:text-primary-700 transition-colors"
    onclick={onClick}
>
    {mosque.label}
</Badge> 