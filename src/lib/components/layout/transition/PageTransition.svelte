<!-- 
  PageTransition.svelte - Smooth page transitions with layout stabilization
  This component helps prevent forced reflow and layout shifts during page transitions
-->
<script>
  import { fade } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  
  /**
   * @type {boolean} Whether the component is mounted and visible
   */
  let mounted = $state(false);
  
  
  
  
  /**
   * @typedef {Object} Props
   * @property {number} [duration]
   * @property {number} [delay]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { duration = 200, delay = 0, children } = $props();
  
  /**
   * @type {DOMRect|null} Dimensions of the content before transition
   */
  let initialDimensions = null;
  
  /**
   * @type {HTMLDivElement|null} Reference to the container element
   */
  let containerEl = $state(null);
  
  // Set mounted to true after component mounts
  onMount(() => {
    // Capture initial dimensions to prevent layout shifts
    if (containerEl) {
      initialDimensions = containerEl.getBoundingClientRect();
    }
    
    // Small delay to ensure content is rendered first
    setTimeout(() => {
      mounted = true;
    }, 10);
    
    return () => {
      mounted = false;
    };
  });
  
  /**
   * Sets a min-height on the container to prevent layout shifts during transitions
   * @param {HTMLDivElement} node - The container element
   */
  function preventLayoutShift(node) {
    if (initialDimensions) {
      // Set min-height to prevent layout shift
      node.style.minHeight = `${initialDimensions.height}px`;
      
      return {
        destroy() {
          node.style.minHeight = 'auto';
        }
      };
    }
  }
</script>

<div 
  class="page-transition-container"
  bind:this={containerEl}
  use:preventLayoutShift
>
  {#if mounted}
    <div 
      class="page-transition-content"
      transition:fade={{ duration, delay }}
    >
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .page-transition-container {
    position: relative;
    width: 100%;
  }
  
  .page-transition-content {
    width: 100%;
  }
</style> 