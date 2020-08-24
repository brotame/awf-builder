<script lang="ts">
  // Helpers
  import { v4 as uuidv4 } from 'uuid';
  import { cloneDeep } from 'lodash-es';

  // Svelte
  import { createEventDispatcher, tick } from 'svelte';
  import { fade } from 'svelte/transition';

  // Store
  import logicStore from '../../../stores/logic';

  // Types
  import type { Logic, Condition, Action, SelectOption } from '../../../types';

  // Components
  import ConditionsBlock from './ConditionsBlock.svelte';
  import ActionsBlock from './ActionsBlock.svelte';

  // UI Components
  import BackButton from '../../../ui/BackButton.svelte';
  import Select from '../../../ui/Select.svelte';

  // Exports
  export let editID: string;

  // Variables
  const defaultCondition: Condition = {
    selector: '',
    type: 'text',
    operator: 'equal',
  };
  const defaultAction: Action = {
    selector: '',
    action: 'show',
  };
  const operators: SelectOption[] = [
    { name: 'All Conditions Are Met', value: 'and' },
    { name: 'One Condition Is Met', value: 'or' },
  ];

  let missingFields: boolean, triedToSubmit: boolean;
  let logic: Logic = {
    id: uuidv4(),
    conditions: [cloneDeep(defaultCondition)],
    operator: 'and',
    actions: [cloneDeep(defaultAction)],
  };

  // Reactive
  $: if (editID) logic = $logicStore.find((logic) => logic.id === editID);

  // Functions
  const dispatch = createEventDispatcher();

  async function checkFilledInputs() {
    await tick();

    for (const condition of logic.conditions) {
      missingFields =
        !condition.type || !condition.selector || !condition.operator;
      if (missingFields) break;
    }

    if (missingFields) return;

    for (const action of logic.actions) {
      missingFields = !action.selector || !action.action;
      if (missingFields) break;
    }
  }

  async function formSubmit() {
    if (!triedToSubmit) triedToSubmit = true;

    await checkFilledInputs();
    if (missingFields) return;

    if (editID) logicStore.modify(logic);
    else logicStore.add(logic);

    dispatch('cancel');
  }

  function addCondition() {
    logic.conditions = [...logic.conditions, cloneDeep(defaultCondition)];
  }

  function addAction() {
    logic.actions = [...logic.actions, cloneDeep(defaultAction)];
  }

  function removeCondition(e) {
    logic.conditions = logic.conditions.filter(
      (condition) => condition !== e.detail
    );

    checkFilledInputs();
  }

  function removeAction(e) {
    logic.actions = logic.actions.filter((action) => action !== e.detail);

    checkFilledInputs();
  }
</script>

<!-- Intro -->
<div class="container max-w-2xl">
  <div class="relative px-8">
    <BackButton on:click={() => dispatch('cancel')} />
    <h1 class="center">{editID ? 'Edit' : 'Add new'} logic</h1>
  </div>

  <!-- Form -->
  <form id="logic-editor" name="Logic Editor">

    <!-- Conditions -->
    {#each logic.conditions as condition, index (index)}
      <div class="hflex-c-s mb-4" transition:fade|local={{ duration: 250 }}>
        <ConditionsBlock
          {condition}
          {index}
          on:addcondition={addCondition}
          on:removecondition={removeCondition}
          on:input={checkFilledInputs} />
      </div>
    {/each}

    <!-- Operator Select -->
    <div class="hflex-c-s my-8">

      {#if logic.conditions.length > 1}
        <label for="operator" class="bold">If</label>

        <Select
          id="operator"
          name="Operator"
          options={operators}
          extraClass="_w-auto flex-initial mx-2"
          bind:value={logic.operator} />

        <div class="bold">then do the following actions:</div>
      {:else}
        <div class="bold">
          If the condition is met, then do the following actions:
        </div>
      {/if}

    </div>

    <!-- Actions -->
    {#each logic.actions as action, index (index)}
      <div class="hflex-c-s mb-4" transition:fade|local={{ duration: 250 }}>
        <ActionsBlock
          {action}
          {index}
          on:addaction={addAction}
          on:removeaction={removeAction}
          on:input={checkFilledInputs} />
      </div>
    {/each}

    <!-- Submit Buttons -->
    <div class="hflex-c-s">

      <!-- Cancel -->
      <button
        type="button"
        class="button outline mr-4 w-button"
        on:click={() => dispatch('cancel')}>
        Cancel
      </button>

      <!-- Submit -->
      <button
        type="submit"
        class="button w-button"
        class:error={missingFields && triedToSubmit}
        on:click|preventDefault={formSubmit}>
        {missingFields && triedToSubmit ? 'Some Fields Are Missing' : 'Save Logic'}
      </button>
    </div>

  </form>

</div>
