<script lang="ts">
  // Helpers
  import { v4 as uuidv4 } from 'uuid';

  // Svelte
  import { onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';

  // UI Components
  import Input from '../../../ui/Input.svelte';
  import ControlButton from '../../../ui/ControlButton.svelte';

  // Stores
  import msfStore, { msfOptional } from '../../../stores/msf';

  // Types
  import type { ButtonText } from '../../../types';

  // Exports
  export let key: string;

  // Variables
  // Check if there is data already stored and it has at least one item
  let params: ButtonText[] =
    $msfStore[key] && $msfStore[key].length > 0
      ? $msfStore[key].map((param) => ({
          id: uuidv4(),
          ...param,
        }))
      : [{ id: uuidv4() }];

  // Reactive
  $: $msfStore[key] = checkFilled(params);

  // Functions
  // Return params that have step and text filled
  function checkFilled(params: ButtonText[]) {
    const filledParams: ButtonText[] = [];

    params.forEach((param) => {
      const { step, text } = param;
      if (step && text) filledParams.push({ step, text });
    });

    return filledParams;
  }

  // Add new button text
  function addButtonText() {
    params = [...params, { id: uuidv4() }];
  }

  // Remove button text
  function removeButtonText(targetIndex: number) {
    params = params.filter((param, index) => index !== targetIndex);
  }

  // Delete params
  function deleteParams() {
    delete $msfStore[key];
  }

  // Remove from store if unselected
  onDestroy(() => {
    if (!msfOptional.checkSelected(key)) deleteParams();
  });
</script>

{#each params as param, index (param.id)}
  <div
    class="hflex-c-sb no-wrap {index < params.length - 1 ? 'mb-8' : ''}"
    transition:slide|local={{ duration: 250 }}>
    <Input
      label="Step"
      type="number"
      id="next-text-step-{index}"
      name="Next Text Step {index}"
      placeholder="1"
      min="1"
      extraClass="_w-1-4"
      bind:value={params[index].step} />

    <Input
      label="Text"
      id="next-text-{index}"
      name="Next Text {index}"
      placeholder="Eg: Next Step"
      extraClass="flex-auto mx-2"
      bind:value={params[index].text} />

    <ControlButton
      action={index === 0 ? 'add' : 'delete'}
      on:click={() => {
        if (index === 0) addButtonText();
        else removeButtonText(index);
      }} />
  </div>
{/each}
