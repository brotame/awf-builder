<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // Types
  import type { msfBlocks } from '../../../types';

  // Exports
  export let blocks: msfBlocks[] = [];

  // Functions
  const dispatch = createEventDispatcher();
</script>

<style>
  .modal-overlay {
    backdrop-filter: blur(0.5rem);
  }
</style>

<div class="modal msf">
  <div class="msf-modal-content" transition:fly={{ x: 100, duration: 250 }}>
    <h3 class="center">Add optional</h3>
    <ul role="list" class="msf-optional-list">
      {#each blocks as { key, title } (key)}
        <li class="msf-optional" on:click={() => dispatch('addoptional', key)}>
          {title}
        </li>
      {/each}
    </ul>
  </div>
  <div
    class="modal-overlay"
    on:click={() => dispatch('closemodal')}
    transition:fade={{ duration: 250 }} />
</div>
