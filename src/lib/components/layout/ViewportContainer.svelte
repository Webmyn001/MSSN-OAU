<!-- 
  ViewportContainer.svelte - Optimize content rendering with content-visibility
  This component uses modern browser features to optimize rendering
  performance for content not currently in the viewport
-->
<script>
  /**
   * @type {string} The CSS content-visibility value
   */
  export let visibility = 'auto';
  
  /**
   * @type {string} Additional CSS classes
   */
  export let className = '';
  
  /**
   * @type {number} The contain-intrinsic-size height in pixels
   * This helps browsers allocate the right amount of space before actual rendering
   */
  export let estimatedHeight = 400;
</script>

<div 
  class={`viewport-container ${className}`}
  style="content-visibility: {visibility}; 
         contain-intrinsic-size: 0 {estimatedHeight}px"
>
  <slot />
</div>

<style>
  .viewport-container {
    /* Extra properties to improve performance */
    contain: content;
    will-change: contents;
  }
</style> 