<script>
    import { onMount } from 'svelte';
    import { mosques } from '$lib/stores/mosques';
    import MosqueCard from './MosqueCard.svelte';
    import MosqueModal from './MosqueModal.svelte';
    
    let selectedMosqueId = "";
    let showMosqueModal = false;
    
    $: selectedMosque = $mosques.find(mosque => mosque.id === selectedMosqueId);
    
    function toggleMosqueModal(id) {
        selectedMosqueId = id;
        showMosqueModal = !showMosqueModal;
    }
</script>

<div class="flex flex-col items-center w-full">
    <div class="flex gap-2 w-[80dvw] sm:mx-auto overflow-scroll scrollbar-hide mt-8">
        {#each $mosques as mosque}
            <MosqueCard 
                {mosque} 
                onClick={() => toggleMosqueModal(mosque.id)}
            />
        {/each}
    </div>
</div>

{#if showMosqueModal && selectedMosque}
    <MosqueModal 
        mosque={selectedMosque} 
        isOpen={showMosqueModal}
        onClose={() => showMosqueModal = false}
    />
{/if} 