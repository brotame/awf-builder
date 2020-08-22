<script lang="ts">
  //Svelte
  import { createEventDispatcher } from 'svelte';

  // UI Components
  import ControlButton from '../../../ui/ControlButton.svelte';
  import Select from '../../../ui/Select.svelte';
  import Input from '../../../ui/Input.svelte';
  import Checkbox from '../../../ui/Checkbox.svelte';

  // Types
  import type { Action, SelectOption } from '../../../types';

  // Exports
  export let action: Action, index: number;

  const test = new Map([['test', 'Test']]);

  // Variables
  const actionOptions: SelectOption[] = [
    { name: 'Show', value: 'show' },
    { name: 'Hide', value: 'hide' },
    { name: 'Enable', value: 'enable' },
    { name: 'Disable', value: 'disable' },
    { name: 'Require', value: 'require' },
    { name: 'Unrequire', value: 'unrequire' },
    { name: 'Custom', value: 'custom' },
  ];

  // Functions
  const dispatch = createEventDispatcher();
</script>

<div class="logic-block">
  <div class="action-grid">

    <!-- Trigger Select -->
    <div class="hflex-c-s">

      <label for={`action-${index}`} class="mr-2">Trigger</label>
      <Select
        id={`action-${index}`}
        name="Action"
        options={actionOptions}
        bind:value={action.action}
        extraClass="flex-auto"
        on:input />
    </div>

    <!-- Selector Input -->
    <div class="hflex-c-s">
      <label for={`action-selector-${index}`} class="mr-2">
        on the element with an ID of
      </label>

      <Input
        name="Action Selector"
        placeholder="your-target"
        id={`action-selector-${index}`}
        extraClass="flex-auto"
        bind:value={action.selector}
        on:input />
    </div>

    <!-- Clear Check -->
    <Checkbox
      id={`clear-${index}`}
      name="Clear Action Target"
      bind:checked={action.clear}
      label="And clear its value" />
  </div>
</div>

<!-- Action Controls -->
<div>

  <!-- Add Action -->
  <ControlButton
    extraClass="ml-4 mb-4"
    on:click={() => dispatch('addaction')} />

  <!-- Remove Action -->
  {#if index !== 0}
    <ControlButton
      action="delete"
      extraClass="ml-4"
      on:click={() => dispatch('removeaction', action)} />
  {/if}

</div>
