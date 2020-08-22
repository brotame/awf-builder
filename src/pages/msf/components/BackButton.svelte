<script lang="ts">
  // Svelte
  import { onDestroy } from 'svelte';

  // UI Components
  import Input from '../../../ui/Input.svelte';

  // Stores
  import msfStore, { msfOptional } from '../../../stores/msf';

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

<Input
  label="Back Button ID:"
  id="back-button"
  name="Back Button"
  placeholder="Eg: back-id"
  selector="id"
  bind:value />
