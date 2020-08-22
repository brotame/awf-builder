<script lang="ts">
  // Store
  import { logicParams } from '../../../stores/logic';

  // UI Components
  import Checkbox from '../../../ui/Checkbox.svelte';
  import MiniButton from '../../../ui/MiniButton.svelte';
</script>

<div>
  <div class="bold mb-3">Global Options:</div>

  <!-- Submit Hidden Inputs -->
  <div class="hflex-c-s mb-2">
    <Checkbox
      id="submit-hidden"
      name="Submit Hidden"
      bind:checked={$logicParams.submitHiddenInputs}
      label="Submit hidden inputs"
      extraClass="mr-3" />
    <MiniButton action="info" />
  </div>

  <!-- Check Conditions On Load -->
  <div class="hflex-c-s">
    <Checkbox
      id="check-conditions-on-load"
      name="Check Conditions On Load"
      bind:checked={$logicParams.checkConditionsOnLoad}
      label="Check conditions on load"
      extraClass="mr-3" />
    <MiniButton action="info" />
  </div>
</div>
