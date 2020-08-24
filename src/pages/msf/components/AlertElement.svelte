<script lang="ts">
  //Svelte
  import { onDestroy } from 'svelte';

  // Stores
  import msfStore, { msfOptional } from '../../../stores/msf';

  // UI Components
  import Select from '../../../ui/Select.svelte';
  import Input from '../../../ui/Input.svelte';

  // Exports
  export let key: string;

  // Variables
  let value = $msfStore[key] || '';

  // Reactive
  $: if (value.length > 0) $msfStore[key] = value;
  else deleteParams();

  // Functions
  function deleteParams() {
    delete $msfStore[key];
  }

  onDestroy(() => {
    if (!msfOptional.checkSelected(key)) deleteParams();
  });
</script>

<p class="mb-8">
  Check the info to learn how to show / hide it using Webflow interactions.
</p>

<Input
  label="Element ID"
  id="alert-id"
  name="Alert ID"
  placeholder="Eg: alert-element"
  selector="id"
  bind:value />
