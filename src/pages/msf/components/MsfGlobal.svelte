<script lang="ts">
  // UI Components
  import Checkbox from '../../../ui/Checkbox.svelte';

  // Stores
  import msfStore from '../../../stores/msf';

  // Exports
  export let key: string;
</script>

<!-- Scroll Top -->
<Checkbox
  id="{key}-scroll-top"
  name="Scroll Top"
  label="Scroll to the top of the form when the user changes step."
  extraClass="mb-4"
  bind:checked={$msfStore.scrollTopOnStepChange} />

<!-- Hide Buttons On Submit -->
<Checkbox
  id="{key}-hide-nav"
  name="Hide Nav"
  label="Hide the navigation buttons when the form submits."
  bind:checked={$msfStore.hiddeButtonsOnSubmit} />
