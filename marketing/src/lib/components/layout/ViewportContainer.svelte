<!-- 
  ViewportContainer.svelte - Optimize content rendering with content-visibility
  This component uses modern browser features to optimize rendering
  performance for content not currently in the viewport
-->
<script>
  
  
  
  
  
  /**
   * @typedef {Object} Props
   * @property {string} [visibility]
   * @property {string} [className]
   * @property {number} [estimatedHeight]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    visibility = 'auto',
    className = '',
    estimatedHeight = 400,
    children
  } = $props();
</script>

<div 
  class={`viewport-container ${className}`}
  style="content-visibility: {visibility}; 
         contain-intrinsic-size: 0 {estimatedHeight}px"
>
  {@render children?.()}
</div>

<style>
  .viewport-container {
    /* Extra properties to improve performance */
    contain: content;
    will-change: contents;
  }
</style> 