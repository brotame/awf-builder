<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  // Store
  import logicStore from '../../../stores/logic';

  // Components
  import LogicBlock from './LogicBlock.svelte';
  import LogicGlobal from './LogicGlobal.svelte';

  // UI Components
  import ControlButton from '../../../ui/ControlButton.svelte';

  // Functions
  const deleteLogic = (e: CustomEvent) => {
    logicStore.remove(e.detail);
  };
  const dispatch = createEventDispatcher();
</script>

<div class="container max-w-2xl">

  <!-- Divider -->
  <div class="logic-block-divider my-12" />

  <!-- Content -->
  <div class="vflex-str-s">

    <div class="hflex-c-sb mb-8">

      <!-- Add New -->
      <div class="hflex-c-s">
        <h2 class="mb-0 mr-4">Add New</h2>
        <ControlButton on:click={() => dispatch('newLogic')} />
      </div>

      <!-- Global Options -->
      <LogicGlobal />
    </div>

    <!-- Logic Blocks -->
    {#each $logicStore as logic, index (logic.id)}
      <div class="logic-block mb-4" transition:fade|local={{ duration: 250 }}>
        <LogicBlock {...logic} {index} on:delete={deleteLogic} />
      </div>
    {/each}
  </div>
</div>
