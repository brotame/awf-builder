<script lang="ts">
  // Svelte
  import { onMount } from 'svelte';

  // Exports
  export let label: string = undefined,
    required: boolean = false,
    type: string = 'text',
    id: string,
    name: string,
    value: string | number = '',
    placeholder: string,
    extraClass: string = '',
    min: string = undefined,
    max: string = undefined,
    selector: 'id' | 'class' = undefined;

  // Variables
  let input: HTMLInputElement;

  // Functions
  // Add id or class selector if needed
  function addSelector(value: string) {
    if (!selector) return value;
    if (selector === 'id') return `#${value}`;
    if (selector === 'class') return `.${value}`;
  }

  // Remove the selector from the value
  function removeSelector(value: string) {
    if (!selector) return value;
    const strings = {
      id: '#',
      class: '.',
    };

    const reg = new RegExp(strings[selector]);
    return value.replace(reg, '');
  }

  // Handle Input, add the selector only if input has value
  function handleInput() {
    value = input.value.length > 0 ? addSelector(input.value) : '';
  }

  // Remove the selector on Mount
  onMount(() => {
    input.value = removeSelector(value.toString());
  });
</script>

<div class="relative {extraClass}">
  <!-- Optional Label -->
  {#if label}
    <!-- prettier-ignore -->
    <label for={id} class="input-label">{label}{#if required}<span class="sea-green">*</span>{/if}</label>
  {/if}
  <input
    {type}
    {name}
    {placeholder}
    {id}
    {min}
    {max}
    class="input-field w-input"
    maxlength="256"
    bind:this={input}
    on:input
    on:input={handleInput} />
</div>
