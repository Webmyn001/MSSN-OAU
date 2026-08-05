<script>
  /**
   * @typedef {Object} Props
   * @property {string} [className]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    className = '',
    children
  } = $props();
</script>

<div class={`viewport-container ${className}`}>
  {@render children?.()}
</div>

<style>
  .viewport-container {
    width: 100%;
  }
</style>
