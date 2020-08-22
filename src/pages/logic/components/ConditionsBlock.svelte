<script lang="ts">
  //Svelte
  import { createEventDispatcher, tick } from 'svelte';

  // UI Components
  import ControlButton from '../../../ui/ControlButton.svelte';
  import Select from '../../../ui/Select.svelte';
  import Input from '../../../ui/Input.svelte';

  // Types
  import type { Condition, SelectOption } from '../../../types';

  // Exports
  export let condition: Condition, index: number;

  // Variables
  const types: SelectOption[] = [
    { name: 'Plain / Textarea Field', value: 'text' },
    { name: 'Email Field', value: 'email' },
    { name: 'Password Field', value: 'password' },
    { name: 'Phone Field', value: 'phone' },
    { name: 'Number Field', value: 'number' },
    { name: 'Select Field', value: 'select' },
    { name: 'Checkbox', value: 'checkbox' },
    { name: 'Radio Group', value: 'radios' },
  ];

  const operators: SelectOption[] = [
    {
      name: 'Be Equal To',
      value: 'equal',
      compatibleTypes: [
        'text',
        'email',
        'password',
        'phone',
        'number',
        'select',
        'radios',
      ],
    },
    {
      name: 'Not Be Equal To',
      value: 'not-equal',
      compatibleTypes: [
        'text',
        'email',
        'password',
        'phone',
        'number',
        'select',
        'radios',
      ],
    },
    {
      name: 'Contain',
      value: 'contain',
      compatibleTypes: [
        'text',
        'email',
        'password',
        'phone',
        'number',
        'select',
        'radios',
      ],
    },
    {
      name: 'Not Contain',
      value: 'not-contain',
      compatibleTypes: [
        'text',
        'email',
        'password',
        'phone',
        'number',
        'select',
        'radios',
      ],
    },
    {
      name: 'Be Empty',
      value: 'empty',
      compatibleTypes: [
        'text',
        'email',
        'password',
        'phone',
        'number',
        'select',
        'radios',
      ],
    },
    {
      name: 'Be Filled',
      value: 'filled',
      compatibleTypes: [
        'text',
        'email',
        'password',
        'phone',
        'number',
        'select',
        'radios',
      ],
    },
    { name: 'Be Greater Than', value: 'greater', compatibleTypes: ['number'] },
    {
      name: 'Be Greater or Equal Than',
      value: 'greater-equal',
      compatibleTypes: ['number'],
    },
    { name: 'Be Less Than', value: 'less', compatibleTypes: ['number'] },
    {
      name: 'Be Less or Equal Than',
      value: 'less-equal',
      compatibleTypes: ['number'],
    },
    { name: 'Be Checked', value: 'checked', compatibleTypes: ['checkbox'] },
    {
      name: 'Not Be Checked',
      value: 'not-checked',
      compatibleTypes: ['checkbox'],
    },
  ];

  // Reactive
  $: if (
    condition.operator === 'empty' ||
    condition.operator === 'filled' ||
    condition.type === 'checkbox'
  )
    delete condition.value;

  $: filteredOperators = operators.filter((operator) =>
    operator.compatibleTypes.includes(condition.type)
  );

  // Functions
  const dispatch = createEventDispatcher();
</script>

<div class="logic-block">
  <div class="condition-grid">

    <!-- Type Select -->
    <div class="hflex-c-s">
      <label for={`type-${index}`} class="mr-2">The</label>
      <Select
        id={`type-${index}`}
        name="Condition Origin Type"
        bind:value={condition.type}
        extraClass="flex-auto"
        options={types}
        on:input />
    </div>

    <!-- Selector Input -->
    <div class="hflex-c-s">
      <label for={`selector-${index}`} class="mr-2">
        {condition.type === 'radios' ? 'which Group Name is' : 'which ID is'}
      </label>

      <Input
        name="Condition Selector"
        placeholder="your-element"
        id={`selector-${index}`}
        bind:value={condition.selector}
        extraClass="flex-auto"
        on:input />

    </div>

    <!-- Condition Operator Select -->
    <div class="hflex-c-s">
      <label for={`operator-${index}`} class="mr-2">must</label>

      <Select
        id={`operator-${index}`}
        name="Condition Operator"
        options={filteredOperators}
        bind:value={condition.operator}
        extraClass="flex-auto"
        on:input />
    </div>

    <!-- Value Input -->
    {#if condition.type !== 'checkbox' && condition.operator !== 'empty' && condition.operator !== 'filled'}
      <div class="hflex-c-s">
        <label for={`value-${index}`} class="mr-2">the value</label>

        <Input
          type={condition.type === 'number' ? 'number' : 'text'}
          name="Condition Value"
          placeholder="Your Value"
          id={`value-${index}`}
          bind:value={condition.value}
          extraClass="flex-auto"
          on:input />
      </div>
    {/if}

  </div>
</div>

<!-- Condition Controls -->
<div>
  <!-- Add Condition -->
  <ControlButton
    extraClass="ml-4 mb-4"
    on:click={() => dispatch('addcondition')} />

  <!-- Remove Condition -->
  {#if index !== 0}
    <ControlButton
      action="delete"
      extraClass="ml-4"
      on:click={() => dispatch('removecondition', condition)} />
  {/if}
</div>
