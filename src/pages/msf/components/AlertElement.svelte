<script lang="ts">
  //Svelte
  import { onDestroy } from 'svelte';

  // Stores
  import msfStore, { msfOptional } from '../../../stores/msf';

  // UI Components
  import Select from '../../../ui/Select.svelte';
  import Input from '../../../ui/Input.svelte';

  // Types
  import type { SelectOption } from '../../../types';

  // Exports
  export let key: string;

  // Variables
  const options: SelectOption[] = [
    { name: 'Default', value: 'default' },
    { name: 'Webflow Interaction', value: 'interaction' },
  ];
  let display: 'default' | 'interaction' = $msfStore.alertSelector
    ? 'default'
    : $msfStore.alertInteraction
    ? 'interaction'
    : 'default';
  let selector = $msfStore.alertSelector || $msfStore.alertInteraction || '';
  let input: HTMLInputElement;

  // Reactive
  $: if (display === 'default' && selector.length > 0)
    $msfStore.alertSelector = selector;
  else if (display === 'interaction' && selector.length > 0)
    $msfStore.alertInteraction = selector;
  else deleteParams();

  // Functions
  function deleteParams() {
    delete $msfStore.alertSelector;
    delete $msfStore.alertInteraction;
  }

  onDestroy(() => {
    if (!msfOptional.checkSelected(key)) deleteParams();
  });
</script>

<Select
  label="Display Method"
  id="alert-display"
  name="Alert Display"
  extraClass="mb-8"
  {options}
  bind:value={display}
  on:input={deleteParams} />

<Input
  label={display === 'default' ? 'Element ID' : 'Interaction Element ID'}
  id="alert-id"
  name="Alert ID"
  placeholder="Eg: alert-element"
  bind:value={selector}
  selector="id" />
