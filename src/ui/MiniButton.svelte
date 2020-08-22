<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte';

  // Exports
  export let action: 'info' | 'delete' = 'info',
    extraClass: string = '';

  // Icons
  import InfoIcon from '../icons/info-icon.svg';
  import DeleteIcon from '../icons/delete-icon.svg';

  // Functions
  const dispatch = createEventDispatcher();
</script>

<!-- Add Action -->
<button type="button" class={extraClass} on:click={() => dispatch(action)}>
  <div class="mini-button {action}">
    {#if action === 'info'}
      <InfoIcon />
    {:else}
      <DeleteIcon />
    {/if}
  </div>

</button>
