<script lang="ts">
  // Types
  import type { SelectOption } from '../types';

  // Exports
  export let label: string = undefined,
    id: string,
    name: string,
    options: SelectOption[],
    value: string = options[0].value,
    extraClass: string;
</script>

<div class="relative {extraClass}">
  <!-- Optional Label -->
  {#if label}
    <label for={id} class="input-label">{label}</label>
  {/if}

  <!-- Select -->
  <select {id} {name} class="input-field w-select" bind:value on:input>
    {#each options as option (option.value)}
      <option value={option.value} disabled={option.disabled}>
        {option.name}
      </option>
    {/each}
  </select>
</div>
