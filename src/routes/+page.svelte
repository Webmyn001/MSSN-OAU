<script>
    import {
        BookOpenText,
        Clock,
        Copy,
        MapPinned,
        NotebookPen,
        Presentation,
        SquareArrowOutUpRight,
        UsersRound
    } from 'lucide-svelte'
    import {slide} from 'svelte/transition'
    import {toast} from 'svelte-sonner'
    import {JsonLd} from 'svelte-meta-tags';
    import {Badge} from "$lib/components/ui/badge/index.js";
    import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import {Button} from "$lib/components/ui/button/index.js";
    import copyTextToClipboard from '$lib/utils/copy.js'
    import slugify from "$lib/utils/slugify.js"
    import SEO from '$lib/components/SEO.svelte';

    let {data} = $props();

    let selectedMosque = $state("awolowo_hall")

    const mosques = [
        {
            id: "awolowo_hall",
            label: "Awolowo Hall",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: "Awolowo Hall of Residence, After Awo Cafe, OAU."
        },
        {
            id: "fajuyi_hall",
            label: "Fajuyi Hall",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: ""
        },
        {
            id: "etf_hall",
            label: "ETF Hall",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: ""
        },
        {
            id: "pg_hall",
            label: "PG Hall",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: ""
        },
        {
            id: "geology_grounds",
            label: "Geology Grounds",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: ""
        },
        {
            id: "computer_grounds",
            label: "Computer Grounds",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: ""
        },
        {
            id: "spider_grounds",
            label: "Spider Grounds",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: ""
        },
        {
            id: "chem_eng_grounds",
            label: "Chem. Eng Grounds",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: ""
        },
        {
            id: "central_mosque",
            label: "Central Mosque",
            url: "",
            images: ["https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vc3F1ZSUyMG5pZ2VyaWF8ZW58MHx8MHx8fDA%3D", "https://plus.unsplash.com/premium_photo-1678488478981-c8cf47f2c280?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383963284-91ef78fc9b6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995539989-1947b660b879?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://plus.unsplash.com/premium_photo-1678481816413-00aabc64678d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1600383962708-4f28dcbce116?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D", "https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9zcXVlJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"],
            address: ""
        }
    ];

    const selectedMosqueObject = $state(mosques.find(mosque => mosque.id === selectedMosque))

    let showMosqueModal = $state(false);


    const programmes = [
        {
            title: "Tutorials",
            text: "Academic tutorials organised by the Academic Committee.",
            image: "/images/chalkboard.webp",
            icon: BookOpenText
        },
        {
            title: "Madrasah",
            text: "Classes on Islamic Education organised by the Islamic Affairs Board.",
            image: "/images/madrasah.webp",
            icon: NotebookPen
        },
        {
            title: "Al-Usrah",
            text: "A weekly meetup centering on Islamic perspective of certain issues.",
            image: "/images/al-usrah.webp",
            icon: Presentation
        }, {
            title: "Sisters' Circle",
            text: "A weekly sisters-only meetup that aims to strengthen the bonds between sisters, and discuss issues pertaining to them.",
            image: "/images/sisters-circle.webp",
            icon: UsersRound
        }
    ]

    const copyAccNumber = async () => {
        const copy = await copyTextToClipboard(data.info.account.number)
        if (copy) {
            toast.success("Account Number Copied!")
        } else {
            toast.error("Failed to copy Account Number!")
        }
    }

    const copyAccDetails = async () => {
        const copy = await copyTextToClipboard(`Bank Name: ${data.info.account.bank}\nAccount Name: ${data.info.account.name}\nAccount Number: ${data.info.account.number}`)
        if (copy) {
            toast.success("Account Details Copied!")
        } else {
            toast.error("Failed to copy Account Details!")
        }
    }

    let selectedEvent = $state("Tutorials")

    const selectedImage = $derived(programmes.find(event => event.title === selectedEvent)?.image)


    let hijrahDate = $state("")
    let shortHijrahDate = $state("")

    function formatTime(dateInput) {
        const date = new Date(dateInput);  // Ensure it's a Date object

        const hours = date.getHours();
        const minutes = date.getMinutes();

        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12; // Convert hour to 12-hour format
        const minuteFormatted = minutes < 10 ? '0' + minutes : minutes; // Add leading zero for minutes

        return `${hour12}:${minuteFormatted} ${ampm}`;
    }

    function getFormattedDateVerbose() {
        const now = new Date();

        // Get day, month, and year
        const day = now.getDate();
        const month = now.toLocaleString('default', {month: 'long'}); // Full month name
        const year = now.getFullYear();

        // Determine the appropriate suffix for the day
        const suffix =
            day % 10 === 1 && day !== 11 ? 'st' :
                day % 10 === 2 && day !== 12 ? 'nd' :
                    day % 10 === 3 && day !== 13 ? 'rd' :
                        'th';

        // Format the date
        return `${day}${suffix} ${month}, ${year}`;
    }

    /**
     * Returns the current date in a shortened format: "12 Dec, 2024".
     * @returns {string} The formatted date.
     */
    function getFormattedDateVerboseShort() {
        const now = new Date();

        // Get day, month (short format), and year
        const day = now.getDate();
        const month = now.toLocaleString('default', {month: 'short'}); // Short month name (e.g., "Dec")
        const year = now.getFullYear();

        // Format the date in the "DD MMM, YYYY" format
        return `${day} ${month}, ${year}`;
    }


    function getFormattedDate() {
        const now = new Date();

        // Get the day, month, and year
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const year = now.getFullYear();

        // Format the date as DD-MM-YYYY
        return `${day}-${month}-${year}`;
    }

    let solahTimes = $derived(data.info.prayer_times)

    function getSolahPeriod() {


        // Helper to convert hours and minutes into a comparable "minutes since midnight"
        const toMinutes = (date) => {
            const tempdate = new Date(date ?? undefined)
            const hours = tempdate.getHours();
            const minutes = tempdate.getMinutes();
            return hours * 60 + minutes
        };

        function timeToMinutesSinceMidnight(hour, minute) {
            // Convert hour to minutes and add the minutes
            return (hour * 60) + minute;
        }

        // Define time thresholds in "minutes since midnight"
        const times = {
            morning: timeToMinutesSinceMidnight(6, 20),
            afternoon: timeToMinutesSinceMidnight(14, 0),
            evening: timeToMinutesSinceMidnight(16, 50),
            night: timeToMinutesSinceMidnight(19, 10),
            lateNight: timeToMinutesSinceMidnight(22, 0),
        };

        const currentTime = toMinutes(new Date().toISOString());

        // Determine the period based on the time
        if (currentTime >= times.lateNight || currentTime < times.morning) return 0;
        if (currentTime >= times.morning && currentTime < times.afternoon) return 1;
        if (currentTime >= times.afternoon && currentTime < times.evening) return 2;
        if (currentTime >= times.evening && currentTime < times.night) return 3;
        if (currentTime >= times.night && currentTime < times.lateNight) return 4;

        return -1; // Fallback (shouldn't be reached)
    }

    async function getHijrahDate() {
        try {
            const req = await fetch(`https://api.aladhan.com/v1/gToH/${getFormattedDate()}`)

            if (!req.ok) throw new Error("Bad Response")

            /**
             * @typedef {Object} Weekday
             * @property {string} en - Weekday name in English.
             * @property {string} [ar] - Weekday name in Arabic (optional).

             * @typedef {Object} Month
             * @property {number} number - Month number.
             * @property {string} en - Month name in English.
             * @property {string} [ar] - Month name in Arabic (optional).

             * @typedef {Object} Designation
             * @property {string} abbreviated - Abbreviated form of the designation (e.g., "AH" or "AD").
             * @property {string} expanded - Full form of the designation (e.g., "Anno Hegirae" or "Anno Domini").

             * @typedef {Object} Hijri
             * @property {string} date - Hijri date in the specified format.
             * @property {string} format - Format of the Hijri date (e.g., "DD-MM-YYYY").
             * @property {string} day - Day of the Hijri date.
             * @property {Weekday} weekday - Weekday information for the Hijri date.
             * @property {Month} month - Month information for the Hijri date.
             * @property {string} year - Year of the Hijri date.
             * @property {Designation} designation - Designation details for the Hijri date.
             * @property {string[]} holidays - List of holidays (if any).

             * @typedef {Object} Gregorian
             * @property {string} date - Gregorian date in the specified format.
             * @property {string} format - Format of the Gregorian date (e.g., "DD-MM-YYYY").
             * @property {string} day - Day of the Gregorian date.
             * @property {Weekday} weekday - Weekday information for the Gregorian date.
             * @property {Month} month - Month information for the Gregorian date.
             * @property {string} year - Year of the Gregorian date.
             * @property {Designation} designation - Designation details for the Gregorian date.

             * @typedef {Object} Data
             * @property {Hijri} hijri - Hijri date details.
             * @property {Gregorian} gregorian - Gregorian date details.

             * @typedef {Object} ApiResponse
             * @property {number} code - HTTP status code of the response.
             * @property {string} status - Status message of the response (e.g., "OK").
             * @property {Data} data - Data containing Hijri and Gregorian date details.
             */

            /**
             * @type {ApiResponse}
             */
            const res = await req.json()

            if (!res || res.code !== 200) throw new Error(res)

            hijrahDate = `${res.data.hijri.day} ${res.data.hijri.month.en}, ${res.data.hijri.year}${res.data.hijri.designation.abbreviated}`
            shortHijrahDate = res.data.hijri.date.replaceAll("-", "/") + res.data.hijri.designation.abbreviated


        } catch (e) {
            toast.error("Error retrieving Hijrah Date")
            console.error(e?.message)
        }
    }


    let upcoming_solat = $state(0);

    onMount(() => {
        upcoming_solat = getSolahPeriod()
        getHijrahDate()
        if (data.posts && data.posts.length === 0) {
            toast.error("Blog server is temporarily unavailable.", {
                duration: Number.POSITIVE_INFINITY,
                action: {
                    label: "Go to blog",
                    onClick: () => window.open("https://annuurpress.org.ng")
                }
            })
        }
    })

</script>

<SEO 
    path="/"
    title=""
    description="Welcome to the Muslim Students Society of Nigeria, OAU Branch – the official community of Muslim students at Obafemi Awolowo University. Join us for academic excellence, Islamic education, and community engagement."
    images={[
        {
            url: 'https://mssnoau.sirv.com/mssn-home.jpg',
            width: 1200,
            height: 630,
            alt: 'MSSNOAU - Muslim Students Society of Nigeria, OAU Branch'
        }
    ]}
    keywords="MSSN, MSSNOAU, Muslim Students Society, Obafemi Awolowo University, OAU, Islamic organization, Muslim community, prayer times, Islamic events, donate to MSSN, Great Ife"
    schema={{
        "@type": "WebPage",
        "@id": "https://mssnoau.org/#webpage",
        "url": "https://mssnoau.org/",
        "name": "Muslim Students Society of Nigeria, OAU Branch | MSSNOAU",
        "isPartOf": {
            "@id": "https://mssnoau.org/#website"
        },
        "about": {
            "@id": "https://mssnoau.org/#organization"
        },
        "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": "https://mssnoau.sirv.com/mssn-home.jpg"
        },
        "inLanguage": "en-US"
    }}
/>

<!-- Meta Tags -->
<MetaTags
        title="We are OAU Great Ìfẹ́'s Muslim Community"
        titleTemplate="%s | MSSNOAU"
        description="Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
        canonical="https://mssnoau-frontend.vercel.app/"
        openGraph={{
    url: 'https://mssnoau-frontend.vercel.app/',
    title: 'We are OAU Great Ìfẹ́\'s Muslim Community | MSSNOAU',
    description: 'Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.',
    images: [
      {
        url: 'https://i.ibb.co/zbWfh5B/home.webp',
        width: 1200,
        height: 640,
        alt: 'Website screenshot'
      }
    ],
    siteName: 'MSSNOAU'
  }}
/>
<JsonLd schema={{
            "@type": "WebPage",
            "name": "We are OAU Great Ìfẹ́'s Muslim Community | MSSNOAU",
            "description": "Welcome to the Muslim Students Society of Nigeria, Great Ìfẹ́ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University.",
            "publisher": {
                "@type": "Organization",
                "name": "MSSNOAU.org"
            }
        }}
/>
<!-- End Meta Tags -->

<!-- Hero -->
<section class="py-32 mx-auto w-full">
    <div class="container flex flex-col items-center text-center w-full">
        <h1 class="text-primary-900 oau -translate-x-3 my-6 text-pretty text-4xl font-bold lg:text-6xl" id="hero-text">We
            are Great <span
                    class="relative oau inline ml-2 mr-12 sm:ml-2 sm:mr-2 lg:ml-4 top-[-6px]"><span
                    class="yoruba oau top-[8px] sm:top-[10px] lg:top-[12px] absolute text-[#28145B] scale-105">Ife's</span><span
                    class="scale-105 oau yoruba absolute -z-10 text-[#EBB957]">Ìfẹ́'s</span></span>
        </h1>
        <!-- #EBB957, #28145B -->
        <p class="mb-8 max-w-3xl text-zinc-600 lg:text-xl">
            community of diverse, forward-thinking and progressive muslim men and women united in faith.
        </p>
            {#await import("$lib/components/Sparkles/Sparkles.svelte") then S}
                {@const Sparkles = S.default}
        <Sparkles
                minSize={0.8}
                maxSize={5}
                particleDensity={400}
                className="w-full mx-[10dvw] h-[20dvh]"
                particleColor="#026d3b"
        />
                {/await}
        <div class="flex w-full flex-col justify-center gap-2 sm:flex-row">
            <button
                    onclick={() => goto('/about')}
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary-900 text-white hover:bg-primary-900/90 h-10 px-4 py-2 w-full sm:w-auto">
                About Us
            </button>
            <button
                    onclick={() => goto('our-excos')}
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-primary-100 tet-primary-800 h-10 px-4 py-2 w-full sm:w-auto">
                Our Excos
            </button>
        </div>
    </div>
    <div class="mt-12 aspect-video overflow-clip sm:mt-32 md:aspect-auto md:h-[420px]">
        <div class="relative mx-auto flex max-w-3xl flex-col">
            <div
                    class="absolute right-[calc(100%+63px)] top-0 hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_1.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+195px)] top-[52px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_1.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+34px)] top-[144px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_2.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+268px)] top-[164px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_2.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+156px)] top-[240px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_3.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+242px)] top-[340px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_3.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute right-[calc(100%+66px)] top-[366px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_4.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+53px)] top-0 hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_4.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+202px)] top-[34px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_5.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+97px)] top-[141px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_5.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+282px)] top-[138px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_6.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+42px)] top-[262px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_6.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+234px)] top-[282px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/man_7.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div
                    class="absolute left-[calc(100%+112px)] top-[365px] hidden size-[64px] rounded-2xl bg-zinc-100 ring-1 ring-inset ring-accent-foreground/10 md:block">
                <img src="/images/woman_7.webp" alt="person"
                     loading="eager"
                     class="h-full w-full rounded-md object-cover object-center"/>
            </div>
            <div class="container mx-auto">
                <img
                        src="/images/bg-1.webp"
                        loading="lazy"
                        style="object-fit: cover; object-position: center"
                        alt="central mosque of unity"
                        class="mt-2 flex aspect-[16/9] min-h-[300px] max-h-[500px] w-full flex-col items-center overflow-clip rounded-md border border-border bg-zinc-100 shadow-sm sm:rounded-xl"/>

                <!--                <img-->
                <!--                        src="/images/bg-2.webp"-->
                <!--                        style="object-fit: cover; object-position: center"-->
                <!--                        alt="central mosque of unity"-->
                <!--                        class="mt-6 flex aspect-[27/10] max-h-[300px] w-full flex-col items-center overflow-clip rounded-xl border border-border bg-zinc-100 shadow-sm" />-->
            </div>
        </div>
    </div>
</section>
<!-- End Hero -->

<!-- Events -->
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <div class="relative p-6 md:p-16">
        <!-- Grid -->
        <div class="relative z-10 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
            <div class="mb-10 lg:mb-0 lg:col-span-6 lg:col-start-8 lg:order-2">
                <h2 class="text-2xl text-neutral-800 font-bold sm:text-3xl font-primary">
                    Our Programmes
                </h2>

                <!-- Tab Navs -->
                <nav class="grid gap-4 mt-5 md:mt-10">

                    {#each programmes as programme}
                        <button type="button"
                                onclick={() => {
                                    selectedEvent = programme.title
                                }}
                                class="{selectedEvent === programme.title ? 'bg-white shadow-md hover:border-transparent' : ''} text-start hover:bg-gray-200 focus:outline-none focus:bg-gray-200 p-4 md:p-5 rounded-xl active"
                                id={programme.title} aria-selected={selectedEvent === programme.title}>
            <span class="flex gap-x-6">
    {#if programme.title === "Tutorials"}
        <BookOpenText
                class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer"/>
        {:else if programme.title === "Madrasah"}
        <NotebookPen
                class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer"/>
        {:else if programme.title === "Al-Usrah"}
        <Presentation
                class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer"/>
        {:else if programme.title === "Sisters' Circle"}
        <UsersRound
                class="shrink-0 mt-2 size-6 md:size-7 {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800 cursor-pointer"/>
        {/if}
                <span class="grow">
                <span class="block text-lg font-semibold font-secondary {selectedEvent === programme.title ? 'text-primary-700' : ''} text-neutral-800">{programme.title}</span>
                    {#if selectedEvent === programme.title}
                <span in:slide out:slide class="block mt-1 text-neutral-800 font-tertiary">{programme.text}</span>
                      {/if}
              </span>
            </span>
                        </button>
                    {/each}

                    <button type="button"
                            onclick={() => {
                                    goto('/programmes')
                                }}
                            class="text-start hover:bg-gray-200 focus:outline-none focus:bg-gray-200 p-4 md:p-5 rounded-xl active"
                    >
            <span class="flex gap-x-6">
                <SquareArrowOutUpRight class="shrink-0 mt-2 size-6 md:size-7    text-neutral-800 cursor-pointer"/>
              <span class="grow">
                <span class="block text-lg font-semibold text-neutral-800">See More</span>
              </span>
            </span>
                    </button>

                </nav>
                <!-- End Tab Navs -->
            </div>
            <!-- End Col -->

            <div class="lg:col-span-6">
                <div class="relative">
                    <!-- Tab Content -->
                    <div>
                        <div id="tabs-with-card-1" role="tabpanel" aria-labelledby="tabs-with-card-item-1">
                            {#key selectedImage}
                                <img loading="lazy" class="shadow-xl shadow-gray-200 rounded-xl"
                                     src={selectedImage}
                                     alt={selectedEvent}/>
                            {/key}
                        </div>
                    </div>
                    <!-- End Tab Content -->

                    <!-- SVG Element -->
                    <div class="hidden absolute top-0 end-0 translate-x-20 md:block lg:translate-x-20">
                        <svg class="w-16 h-auto text-primary-800" width="121" height="135" viewBox="0 0 121 135"
                             fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 16.4754C11.7688 27.4499 21.2452 57.3224 5 89.0164" stroke="currentColor"
                                  stroke-width="10" stroke-linecap="round"/>
                            <path d="M33.6761 112.104C44.6984 98.1239 74.2618 57.6776 83.4821 5" stroke="currentColor"
                                  stroke-width="10" stroke-linecap="round"/>
                            <path d="M50.5525 130C68.2064 127.495 110.731 117.541 116 78.0874" stroke="currentColor"
                                  stroke-width="10" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <!-- End SVG Element -->
                </div>
            </div>
            <!-- End Col -->
        </div>
        <!-- End Grid -->

        <!-- Background Color -->
        <div class="absolute inset-0 grid grid-cols-12 size-full">
            <div class="col-span-full lg:col-span-7 lg:col-start-6 bg-gray-100 w-full h-5/6 rounded-xl sm:h-3/4 lg:h-full"></div>
        </div>
        <!-- End Background Color -->
    </div>
</div>
<!-- End Events -->

<!-- Prayer Times -->
<div id="prayer-times" class="w-[80%] mx-auto space-y-8 mt-12">
    <div class="w-full flex flex-row justify-between items-center my-4">
        <div>
            <h1 class="mx-auto font-primary font-bold text-2xl sm:text-3xl md:text-4xl">Prayer Times</h1>
            <p class="text-primary-800 font-secondary hidden sm:block">For all mosques at OAU, Ile-Ife.</p>
        </div>

        <div class="font-secondary">
            <p class="text-primary-800 font-tertiary hidden sm:block">{getFormattedDateVerbose()}</p>
            <p class="text-primary-800 font-tertiary sm:hidden block">{getFormattedDateVerboseShort()}</p>
            <p class="text-[#333333] font-tertiary font-semibold hidden sm:block">{hijrahDate}</p>
            <p class="text-[#333333] font-tertiary font-semibold sm:hidden block">{shortHijrahDate}</p>
        </div>
    </div>
    <div class="grid grid-rows-5 grid-cols-none sm:grid-cols-2 sm:grid-rows-none lg:grid-cols-5 gap-4 mt-8">

        <div class="relative flex flex-col bg-white border shadow-sm rounded-xl w-full h-32 sm:aspect-square {upcoming_solat === 0 ? 'scale-110 shadow-xl' : ''} justify-center items-center gap-2 bg-[url('/images/midnight.webp')] bg-no-repeat bg-cover bg-center">
            <div class="absolute inset-0 {upcoming_solat === 0 ? 'bg-gradient-to-r  from-transparent via-black/30' : 'bg-black/70'} blur-sm rounded-xl"></div>
            <h2 class="z-10 font-primary font-bold {upcoming_solat === 0 ? 'text-white text-2xl' : 'text-primary-100 text-xl'}">
                Fajr</h2>

            <span
                    class="z-10 inline-flex flex-nowrap items-center {upcoming_solat === 0 ? 'bg-white border-white' : 'bg-primary-100 border-primary-200'} border rounded-xl p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        {formatTime(solahTimes.subhi.adhan)} • {formatTime(solahTimes.subhi.iqamah)}
                    </span>
                </span>
        </div>

        <div class="relative flex flex-col bg-white border shadow-sm rounded-xl w-full h-32 sm:aspect-square {upcoming_solat === 1 ? 'scale-110 shadow-xl' : ''} justify-center items-center gap-2 bg-[url('/images/noon.webp')] bg-no-repeat bg-cover bg-center">
            <div class="absolute inset-0 {upcoming_solat === 1 ? 'bg-gradient-to-r  from-transparent via-black/30' : 'bg-black/70'} blur-sm rounded-xl"></div>
            <h2 class="z-10 {upcoming_solat === 1 ? 'text-white text-2xl' : 'text-primary-100 text-xl'} font-primary font-bold">
                Dhuhr</h2>

            <span
                    class="z-10 inline-flex flex-nowrap items-center {upcoming_solat === 1 ? 'bg-white border-white' : 'bg-primary-100 border-primary-200'} border rounded-xl p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        {formatTime(solahTimes.dhuhr.adhan)} • {formatTime(solahTimes.dhuhr.iqamah)}
                    </span>
                </span>
        </div>

        <div class="relative flex flex-col bg-white border shadow-sm rounded-xl w-full {upcoming_solat === 2 ? 'scale-110 shadow-xl' : ''} h-32 sm:aspect-square justify-center items-center gap-2 bg-[url('/images/evening.webp')] bg-no-repeat bg-cover bg-center">
            <div class="absolute inset-0 {upcoming_solat === 2 ? 'bg-gradient-to-r  from-transparent via-black/30' : 'bg-black/70'} blur-sm rounded-xl"></div>
            <h2 class="z-10 font-primary font-bold {upcoming_solat === 2 ? 'text-white text-2xl' : 'text-primary-100 text-xl'}">
                ‘Asr</h2>

            <span
                    class="z-10 inline-flex flex-nowrap items-center {upcoming_solat === 2 ? 'bg-white border-white' : 'bg-primary-100 border-primary-200'} border rounded-xl p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        {formatTime(solahTimes.asr.adhan)} • {formatTime(solahTimes.asr.iqamah)}
                    </span>
                </span>
        </div>

        <div class="relative flex flex-col bg-white border shadow-sm rounded-xl w-full h-32 sm:aspect-square {upcoming_solat === 3 ? 'scale-110 shadow-xl' : ''} justify-center items-center gap-2 bg-[url('/images/late-evening.webp')] bg-no-repeat bg-cover bg-center">
            <div class="absolute inset-0 {upcoming_solat === 3 ? 'bg-gradient-to-r  from-transparent via-black/30' : 'bg-black/70'} blur-sm rounded-xl"></div>
            <h2 class="z-10 font-primary font-bold {upcoming_solat === 3 ? 'text-white text-2xl' : 'text-primary-100 text-xl'}">
                Maghrib</h2>

            <span
                    class="z-10 inline-flex flex-nowrap items-center {upcoming_solat === 3 ? 'bg-white border-white' : 'bg-primary-100 border-primary-200'} border rounded-xl p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        {formatTime(solahTimes.maghrib.adhan)} • {formatTime(solahTimes.maghrib.iqamah)}
                    </span>
                </span>
        </div>

        <div class="relative flex flex-col bg-white border shadow-sm rounded-xl w-full h-32 sm:aspect-square {upcoming_solat === 4 ? 'scale-110 shadow-xl' : ''} justify-center items-center gap-2 bg-[url('/images/night.webp')] bg-no-repeat bg-cover bg-center">
            <div class="absolute inset-0 {upcoming_solat === 4 ? 'bg-gradient-to-r  from-transparent via-black/30' : 'bg-black/70'} blur-sm rounded-xl"></div>
            <h2 class="z-10 font-primary font-bold {upcoming_solat === 4 ? 'text-white text-2xl' : 'text-primary-100 text-xl'}">
                ‘Isha'h</h2>

            <span
                    class="z-10 inline-flex flex-nowrap items-center {upcoming_solat === 4 ? 'bg-white border-white' : 'bg-primary-100 border-primary-200'} border rounded-xl p-1 gap-1">
    <Clock class="shrink-0 size-3 text-green-900"/>
                    <span class="whitespace-nowrap font-medium text-green-900 text-xs">
                        {formatTime(solahTimes.isha.adhan)} • {formatTime(solahTimes.isha.iqamah)}
                    </span>
                </span>
        </div>

    </div>

    <div class="flex justify-center items-center w-full mt-8">
        <span class="p-4 bg-primary-800 text-white rounded-md font-tertiary text-xs">Friday Sermon starts at 1:30 PM and Prayer commences at 2:00 PM</span>
    </div>

    <div class="flex gap-2 w-[80dvw] sm:mx-auto overflow-scroll scrollbar-hide">
        {#each mosques as mosque}
            <Badge class="cursor-pointer" variant="outline" onclick={() => {
                    selectedMosque = mosque.id
                    showMosqueModal = !showMosqueModal
                }}>{mosque.label}</Badge>
        {/each}
    </div>

    <div>
    </div>
</div>
<!-- End Prayer Times -->


<!-- Upcoming Events Section -->
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Title -->
    <div class="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-10 lg:mb-14">
        <div class="text-right sm:text-center">
            <h2 class="text-2xl font-bold font-primary md:text-4xl md:leading-tight ">Upcoming Events</h2>
            <p class="mt-1 text-primary-800 sm:text-center font-secondary">More info and registration for some of
                our upcoming community events.</p>
        </div>

        <div class="mt-12 text-center">
            <a class="py-3 text-nowrap px-4 inline-flex items-center gap-x-1 text-sm font-medium rounded-xl border border-primary-200 bg-white text-primary-800 shadow-sm hover:bg-primary-50 focus:outline-none focus:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none"
               href="/events">
                All Events
                <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                     stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                </svg>
            </a>
        </div>

    </div>
    <!-- End Title -->

    <!-- Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.events as event}
            <!-- Card -->
            <a class="group flex flex-col focus:outline-none"
               href={`/events#${slugify(event.title + " " + event.date)}`}>
                <div class="relative pt-[50%] sm:pt-[70%] rounded-xl overflow-hidden">
                    <img loading="lazy"
                         class="size-full absolute top-0 start-0 object-cover group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out rounded-xl"
                         src={event.image}
                         alt={event.title}>
                    {#if event.paid && event.price && event.price.length > 0}
                            <span class="font-tertiary absolute top-0 end-0 rounded-se-xl rounded-es-xl text-xs font-medium bg-primary-800 text-white py-1.5 px-3">
          Paid - {event.price}
        </span>
                    {/if}
                </div>

                <div class="mt-7">
                    <h3 class="text-xl font-secondary font-semibold text-gray-800 group-hover:text-gray-600">
                        {event.title}
                    </h3>
                    <p class="mt-3 font-tertiary text-gray-800 line-clamp-2 text-ellipsis">
                        {event.summary}
                    </p>
                    <button onclick={ () => goto(`/events#${slugify(event.title + " " + event.date)}`)}
                            class="mt-5 inline-flex items-center gap-x-1 text-sm text-primary-700 decoration-2 group-hover:underline group-focus:underline font-medium font-secondary">
                        More Info
                        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                             stroke-linecap="round" stroke-linejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </button>
                </div>
            </a>
            <!-- End Card -->
        {/each}

        <!-- Article Card -->
        <a class="group relative flex flex-col w-full min-h-60 bg-[url('https://plus.unsplash.com/premium_photo-1676496046182-356a6a0ed002?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=560&q=80')] bg-center bg-cover rounded-xl hover:shadow-lg focus:outline-none focus:shadow-lg transition"
           href="#">
            <div class="absolute inset-0 bg-black/40 blur-sm rounded-xl"></div>
            <div class="flex-auto p-4 md:p-6 z-10">
                <h3 class="text-xl text-white/90 group-hover:text-white font-tertiary"><span
                        class="font-bold text-primary-100 font-secondary">How To</span> register for Paid MSSN
                    Events online via the website.</h3>
            </div>
            <div class="pt-0 p-4 md:p-6">
                <div class="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-white/70 group-focus:text-white/70">
                    Read Article
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                    </svg>
                </div>
            </div>
        </a>
        <!-- Article Card -->
    </div>
    <!-- End Grid -->
</div>
<!-- End Upcoming Events -->

<!-- Blog Section -->
<div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
    <!-- Title -->
    <div class="max-w-2xl mx-auto text-left mb-10 lg:mb-14">
        <h2 class="text-2xl font-bold md:text-4xl md:leading-tight font-primary">From the Press</h2>
        <p class="mt-1 font-secondary text-primary-900">Value Packed Insights and Publications from An-Nur Press</p>
    </div>
    <!-- End Title -->

    <!-- Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.posts as post}
            <!-- Card -->
            <a class="group flex flex-col h-full border border-primary-200 hover:border-transparent hover:shadow-lg focus:outline-none focus:border-transparent focus:shadow-lg transition duration-300 rounded-xl p-5"
               href={post.link}
               target="_blank"
            >
                <div class="aspect-w-16 aspect-h-11">
                    <img class="w-full object-cover rounded-xl h-[210px]" loading="lazy"
                         src={post.featured_image}
                         alt={post.title}>
                </div>
                <div class="my-6">
                    <h3 class="text-xl font-secondary font-semibold text-primary-900">
                        {@html post.title}
                    </h3>
                    <p class="mt-5 text-gray-600 font-tertiary">
                        {@html post.excerpt}
                    </p>
                </div>
                <div class="mt-auto flex items-center gap-x-3">
                    <img class="size-8 rounded-full" loading="lazy" src={post.authors[0].avatar_urls["48"]}
                         alt={post.authors[0].name}>
                    <div>
                        <h5 class="text-sm text-neutral-800 font-secondary">
                            By {post.authors[0].name} {post.authors.length > 1 ? "and " + post.author.length - 1 + " others" : ""}</h5>
                    </div>
                </div>
            </a>
            <!-- End Card -->
        {/each}
    </div>
    <!-- End Grid -->

    <!-- Card -->
    <div class="mt-12 text-center gap-4">
        <a class="py-3 px-4 inline-flex items-center gap-x-1 text-sm font-medium rounded-xl border border-primary-200 bg-primary-700 text-white shadow-sm hover:bg-primary-700/90 focus:outline-none focus:bg-primary-700/90 disabled:opacity-50 disabled:pointer-events-none"
           href="/blog">
            Read more
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                 viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
            </svg>
        </a>
        <a class="py-3 px-4 inline-flex items-center gap-x-1 text-sm font-medium rounded-xl border border-primary-200 bg-white text-primary-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
           href="/blog#newsletter">
            Join Newsletter
            <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                 viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
            </svg>
        </a>
    </div>
    <!-- End Card -->
</div>
<!-- End Blog Section -->

<!-- Donation CTA -->
<div id="donate" class="bg-white py-6 sm:py-8 lg:py-12">
    <div class="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div class="flex flex-col items-center justify-between gap-4 rounded-xl bg-gray-100 p-4 sm:flex-row md:p-8">
            <div class="gap-6">
                <h2 class="text-xl font-bold text-neutral-800 font-primary md:text-2xl">Invest in your Ākhirah</h2>
                <p class="text-primary-900">We are a non-profit student organisation that only exists due to individual
                    and
                    collective efforts, both in cash and kind.</p>
            </div>
            {#await import('$lib/components/ui/alert-dialog/index.js') then AlertDialog}
            <AlertDialog.Root>
                <AlertDialog.Trigger>
                    <button type="button"
                            class="inline-block font-secondary rounded-xl bg-primary-700 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-primary-300 transition duration-100 hover:bg-primary-800 focus-visible:ring active:bg-primary-800 md:text-base">
                        Donate
                    </button>

                </AlertDialog.Trigger>
                <AlertDialog.Content class="scrollbar-hide lg:max-w-[60dvw] overflow-y-scroll max-h-screen">
                    <AlertDialog.Header>
                        <AlertDialog.Title class="font-primary text-primary-800">Donate
                        </AlertDialog.Title>
                    </AlertDialog.Header>
                    <!-- List -->
                    <div class="space-y-3">
                        <dl class="flex flex-col sm:flex-row gap-1">
                            <dt class="min-w-40">
                                <span class="block text-sm text-gray-500 ">Account Name:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li class="me-1 after:content-[','] inline-flex items-center text-sm text-neutral-800">
                                        {data.info.account.name}
                                    </li>
                                </ul>
                            </dd>
                        </dl>

                        <dl class="flex flex-col sm:flex-row gap-1">
                            <dt class="min-w-40">
                                <span class="block text-sm text-gray-500 ">Bank Name:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li class="me-1 after:content-[','] inline-flex items-center text-sm text-neutral-800">
                                        {data.info.account.bank}
                                    </li>
                                </ul>
                            </dd>
                        </dl>

                        <dl class="flex flex-col sm:flex-row gap-1">
                            <dt class="min-w-40">
                                <span class="block text-sm text-gray-500">Account Number:</span>
                            </dt>
                            <dd>
                                <ul>
                                    <li class="me-1 inline-flex items-center text-sm text-neutral-800">
                                        {data.info.account.number}
                                        <Copy onclick={copyAccNumber}
                                              class="size-4 text-primary-700 cursor-pointer ml-4"/>
                                    </li>
                                </ul>
                            </dd>
                        </dl>
                    </div>
                    <!-- End List -->
                    <AlertDialog.Footer>
                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                        <AlertDialog.Action class="bg-primary-800 text-white bg-primary-800/90"
                                            onclick={copyAccDetails}>Copy
                        </AlertDialog.Action>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog.Root>
                {/await}
        </div>
    </div>
</div>
<!-- End Donation CTA -->

<!-- Suggestions CTA -->
<div class="bg-white py-6 sm:py-8 lg:py-12">
    <div class="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div class="flex flex-col overflow-hidden rounded-xl bg-gray-200 sm:flex-row md:h-80">


            <!-- content - start -->
            <div class="flex w-full flex-col p-4 sm:w-1/2 sm:p-8 lg:w-3/5">
                <h2 class="mb-4 text-xl font-bold text-neutral-800 md:text-2xl lg:text-4xl font-primary">Complaints?
                    Suggestions</h2>

                <p class="mb-8 max-w-md text-primary-900">We're committed to improving through thoughtful planning and
                    constructive feedback, and we'd love to hear anything you think could make us better. Your
                    perspective matters to us!</p>

                <div class="mt-auto">
                    <a href="/contact"
                       class="inline-block rounded-xl bg-primary-800 px-8 py-3 text-center text-sm font-semibold text-white outline-none ring-primary-300 transition duration-100 hover:bg-primary-800/90 focus-visible:ring active:bg-primary-800/90 md:text-base">Leave
                        us a message</a>
                </div>
            </div>
            <!-- content - end -->

            <!-- image - start -->
            <div class="order-first h-48 w-full bg-gray-300 sm:order-none sm:h-auto sm:w-1/2 lg:w-2/5">
                <img src="https://images.unsplash.com/photo-1612955625275-08aebd897b3a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHN1Z2dlc3Rpb24lMjBib3h8ZW58MHx8MHx8fDA%3D"
                     loading="lazy" alt="Suggestion Box"
                     class="h-full w-full object-cover object-center"/>
            </div>
            <!-- image - end -->
        </div>
    </div>
</div>
<!-- End Suggestions CTA -->

{#if selectedMosqueObject}
    {#await import('$lib/components/ui/sheet/index.js') then Sheet}
    <Sheet.Root bind:open={showMosqueModal}>
        <Sheet.Content class="scrollbar-hide" onCloseAutoFocus={event => event.preventDefault()} side="bottom">
            <Sheet.Header>
                <Sheet.Title class="font-primary">{selectedMosqueObject?.label}</Sheet.Title>
                <Sheet.Description class="font-tertiary text-xs">
                    At {selectedMosqueObject?.address}
                </Sheet.Description>
            </Sheet.Header>
            {#await import('$lib/components/ui/carousel/index.js') then Carousel}
                {#await import('embla-carousel-autoplay') then A}
                    {@const Autoplay = A.default}
            <Carousel.Root
                    plugins={[
                        Autoplay({
                            delay: 5000,
                        }),
                    ]}
                    class="w-full"
                    opts={{ align: "center", loop: true }}
            >
                <Carousel.Content>
                    {#each selectedMosqueObject?.images as image, i}
                        <Carousel.Item>
                            <img class="h-[40dvh] sm:h-[50dvh] w-full object-cover rounded-xl mx-auto my-6"
                                 src={image}
                                 alt={`${selectedMosqueObject.label} ${i + 1}`}/>
                        </Carousel.Item>
                    {/each}
                </Carousel.Content>
                <Carousel.Previous/>
                <Carousel.Next/>
            </Carousel.Root>
                    {/await}
                {/await}

            <Sheet.Footer class="gap-3">
                <Button onclick={() => (showMosqueModal = !showMosqueModal)} variant="outline">Close</Button>
                <Button class="bg-primary-800 hover:bg-primary-800/90 text-white"
                        onclick={() => (window.open(selectedMosqueObject?.url, '_blank'))}>
                    <MapPinned class="size-6 mx-2"/>
                    View on Maps
                </Button>
            </Sheet.Footer>
        </Sheet.Content>
    </Sheet.Root>
        {/await}
{/if}

<style>
    .yoruba {
        font-family: "Charis SIL", sans-serif;
        top: 12px;
    }

    /* charis-sil-latin-400-normal */
    @font-face {
        font-family: 'Charis SIL';
        font-style: normal;
        font-display: swap;
        font-weight: 400;
        src: url(https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff2) format('woff2'), url(https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff) format('woff');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

    .oau {
        cursor: url('/oau-logo.png') 32 32, auto;
    }

</style>
