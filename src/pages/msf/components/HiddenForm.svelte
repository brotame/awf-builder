<script lang="ts">
  // Svelte
  import { onMount, onDestroy } from 'svelte';

  // UI Components
  import Input from '../../../ui/Input.svelte';

  // Stores
  import msfStore, { msfOptional } from '../../../stores/msf';

  // Exports
  export let key: string;

  // Variables
  let value = $msfStore.hiddenFormStep || '';

  // Reactive
  $: $msfStore.hiddenFormStep = +value > 0 ? +value : 1;

  function deleteParams() {
    delete $msfStore.sendHiddenForm;
    delete $msfStore.hiddenFormStep;
  }

  onMount(() => ($msfStore.sendHiddenForm = true));

  onDestroy(() => {
    if (!msfOptional.checkSelected(key)) deleteParams();
  });
</script>

<p class="mb-8">
  Check the info to learn how to add this functionality in Webflow.
</p>

<Input
  type="number"
  label="Step Goal"
  id="hidden-form-step"
  name="Hidden Form Step"
  placeholder="Send after step X. Default: 1"
  min="1"
  bind:value />
