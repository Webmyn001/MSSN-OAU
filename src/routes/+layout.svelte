<script>
	import '../app.css';
	let { children } = $props();
    import { afterNavigate } from "$app/navigation";
    import NavBar from "$lib/components/NavBar.svelte";
    import { Toaster } from "$lib/components/ui/sonner";
    import Footer from "$lib/components/Footer.svelte";

    afterNavigate(() => {
        window.HSStaticMethods.autoInit();
    });
</script>
<Toaster richColors />
<NavBar />
{@render children()}
<Footer />
