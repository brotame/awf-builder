<script lang="ts">
  // Svelte
  import { onDestroy } from 'svelte';

  // UI Components
  import Checkbox from '../../../ui/Checkbox.svelte';

  // Stores
  import msfStore, { msfOptional } from '../../../stores/msf';

  // Exports
  export let key: string;

  // Functions
  onDestroy(() => {
    if (!msfOptional.checkSelected(key)) {
      $msfStore.scrollTopOnStepChange = false;
      $msfStore.hiddeButtonsOnSubmit = true;
    }
  });
</script>

<!-- Scroll Top -->
<Checkbox
  id="scroll-top"
  name="Scroll Top"
  label="Scroll to the top of the form when the user changes step."
  extraClass="mb-4"
  bind:checked={$msfStore.scrollTopOnStepChange} />

<!-- Hide Buttons On Submit -->
<Checkbox
  id="hide-nav"
  name="Hide Nav"
  label="Hide the navigation buttons when the form submits."
  bind:checked={$msfStore.hiddeButtonsOnSubmit} />
