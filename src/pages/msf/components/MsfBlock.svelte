<script lang="ts">
  // Exports
  export let title: string,
    required: boolean = false;

  // UI Components
  import MiniButton from '../../../ui/MiniButton.svelte';
</script>

<!-- Header -->
<div class="hflex-c-sb mb-8">
  <!-- Title -->
  <!-- prettier-ignore -->
  <h3 class="mb-0">{title}{#if required}<span class="sea-green">*</span>{/if}<span class="sea-green" /></h3>

  <!-- Buttons -->
  <div class="hflex-c-s">
    <!-- Info Button -->
    <MiniButton on:info />

    <!-- Delete Button -->
    {#if !required}
      <MiniButton action="delete" extraClass="ml-4" on:delete />
    {/if}
  </div>
</div>

<!-- Content Slot -->
<slot />
