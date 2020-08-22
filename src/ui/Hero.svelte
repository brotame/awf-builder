<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte';

  // Exports
  export let title: string,
    subtitle: string,
    primaryText: string = undefined,
    secondaryText: string = undefined;

  // Functions
  const dispatch = createEventDispatcher();
</script>

<div class="container max-w-xl vflex-c-c center">

  <!-- Title -->
  <h1 class="mb-4">{title}</h1>

  <!-- Subtitle -->
  <p class="mb-8">
    {@html subtitle}
  </p>

  <!-- Hero Buttons -->
  <div class="hero-buttons">
    {#if primaryText}
      <button
        class="button w-button"
        on:click={() => {
          dispatch('primaryclick');
        }}>
        {primaryText}
      </button>
    {/if}
    {#if secondaryText}
      <button
        class="button outline w-button"
        on:click={() => {
          dispatch('secondaryclick');
        }}>
        {secondaryText}
      </button>
    {/if}
  </div>
</div>
