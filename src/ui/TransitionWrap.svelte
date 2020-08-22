<script lang="ts">
  // Svelte
  import { fade } from 'svelte/transition';

  // Exports
  export let extraClass: string = '';
</script>

<div class="content-wrap {extraClass}" in:fade={{ duration: 250 }}>
  <slot />
</div>
