<script lang="ts">
  // Exports
  export let action: 'add' | 'delete' | 'copy' = 'add',
    extraClass: string = '';
  export let button: HTMLElement = null;

  // Icons
  import AddIcon from '../icons/plus-icon.svg';
  import RemoveIcon from '../icons/minus-icon.svg';
  import CopyIcon from '../icons/copy-icon.svg';
</script>

<!-- Add Action -->
<button
  type="button"
  class="control-button {action}
  {extraClass}"
  on:click
  bind:this={button}>
  {#if action === 'add'}
    <AddIcon class="small-icon" />
  {:else if action === 'delete'}
    <RemoveIcon class="small-icon" />
  {:else}
    <CopyIcon class="small-icon" />
  {/if}
</button>
