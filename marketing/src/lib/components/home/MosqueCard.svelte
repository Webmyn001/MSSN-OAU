<script>
    import { Badge } from "$lib/components/ui/badge";
    
    
    let { mosque = {
        id: "",
        label: "",
        url: "",
        images: [""],
        address: ""
    }, onClick = () => {} } = $props();
</script>

<Badge 
    variant="outline" 
    class="cursor-pointer hover:bg-primary-50 hover:text-primary-700 transition-colors"
    onclick={onClick}
>
    {mosque.label}
</Badge> 