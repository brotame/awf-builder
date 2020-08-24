<script lang="ts">
  //Svelte
  import { createEventDispatcher } from 'svelte';

  // UI Components
  import ControlButton from '../../../ui/ControlButton.svelte';
  import Select from '../../../ui/Select.svelte';
  import Input from '../../../ui/Input.svelte';

  // Types
  import type {
    ConditionType,
    ConditionOperator,
    Condition,
    SelectOption,
  } from '../../../types';

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
      name: '-- Select Operator --',
      value: '',
      compatibleTypes: [
        'text',
        'email',
        'password',
        'phone',
        'number',
        'select',
        'radios',
        'number',
        'checkbox',
      ],
      disabled: true,
    },
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

  let type: ConditionType = condition.type || 'text';
  let selector = condition.selector || '';
  let operator: ConditionOperator = condition.operator || '';
  let value = condition.value || '';

  // Reactive
  $: condition.type = type;
  $: condition.selector = selector;
  $: condition.operator = operator;
  $: condition.value = value;
  // $: if (operator === 'checked') {
  //   condition.operator = 'equal';
  //   condition.value = 'true';
  // }
  // $: if (operator === 'not-checked') {
  //   condition.operator = 'equal';
  //   condition.value = 'false';
  // }
  $: if (['empty', 'filled'].includes(operator)) delete condition.value;
  $: filteredOperators = operators.filter((operator) =>
    operator.compatibleTypes.includes(type)
  );

  // Functions
  const dispatch = createEventDispatcher();

  function deleteOperator() {
    operator = '';
  }
</script>

<div class="logic-block">
  <div class="condition-grid">

    <!-- Type Select -->
    <div class="hflex-c-s">
      <label for={`type-${index}`} class="mr-2">The</label>
      <Select
        id={`type-${index}`}
        name="Condition Origin Type"
        bind:value={type}
        extraClass="flex-auto"
        options={types}
        on:input={deleteOperator}
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
        bind:value={selector}
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
        bind:value={operator}
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
          bind:value
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
