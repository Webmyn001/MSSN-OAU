<script>
	import '../app.css';
	let { children } = $props();
    import { afterNavigate } from "$app/navigation";
    import NavBar from "$lib/components/NavBar.svelte";

    afterNavigate(() => {
        window.HSStaticMethods.autoInit();
    });
</script>
<NavBar />
{@render children()}
