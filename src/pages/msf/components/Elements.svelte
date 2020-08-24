<script lang="ts">
  // UI Components
  import Input from '../../../ui/Input.svelte';

  // Stores
  import msfStore, { msfActivated, msfCopy } from '../../../stores/msf';

  // Variables
  let form = $msfStore.formSelector || '',
    next = $msfStore.nextSelector || '';

  // Reactive
  $: if (!$msfActivated) deleteParams();
  $: if ($msfCopy) setDefaults();
  $: if (form.length > 0) $msfStore.formSelector = form;
  else delete $msfStore.formSelector;
  $: if (next.length > 0) $msfStore.nextSelector = next;
  else delete $msfStore.nextSelector;

  // Functions
  function deleteParams() {
    delete $msfStore.formSelector;
    delete $msfStore.nextSelector;
  }

  function setDefaults() {
    form = '#msf';
    next = '#msf-next';
    console.log($msfStore);
    $msfCopy = false;
  }
</script>

<Input
  label="Form ID"
  required={true}
  id="form"
  name="Form"
  placeholder="Eg: form-id"
  extraClass="mb-8"
  selector="id"
  bind:value={form} />

<Input
  label="Next Button ID"
  required={true}
  id="next-button"
  name="Next Button"
  placeholder="Eg: next-id"
  selector="id"
  bind:value={next} />
