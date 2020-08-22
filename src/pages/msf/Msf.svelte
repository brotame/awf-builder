<script lang="ts">
  // Svelte
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // Stores
  import { msfActivated, msfRequired, msfOptional } from '../../stores/msf';

  // Components
  import AlertElement from './components/AlertElement.svelte';
  import AlertText from './components/AlertText.svelte';
  import BackButton from './components/BackButton.svelte';
  import BackText from './components/BackText.svelte';
  import CustomNav from './components/CustomNav.svelte';
  import DisplayCompleted from './components/DisplayCompleted.svelte';
  import DisplayCurrentStep from './components/DisplayCurrentStep.svelte';
  import DisplayValues from './components/DisplayValues.svelte';
  import Elements from './components/Elements.svelte';
  import HiddenForm from './components/HiddenForm.svelte';
  import MsfBlock from './components/MsfBlock.svelte';
  import MsfGlobal from './components/MsfGlobal.svelte';
  import MsfModal from './components/MsfModal.svelte';
  import NextText from './components/NextText.svelte';
  import WarningClass from './components/WarningClass.svelte';
  import WebflowSetup from './components/WebflowSetup.svelte';

  // UI Components
  import ControlButton from '../../ui/ControlButton.svelte';
  import Hero from '../../ui/Hero.svelte';
  import TransitionWrap from '../../ui/TransitionWrap.svelte';

  // Variables
  let showModal = false;
  const components = {
    webflowSetup: WebflowSetup,
    elements: Elements,
    alertElement: AlertElement,
    alertText: AlertText,
    backText: BackText,
    backSelector: BackButton,
    customNav: CustomNav,
    displayCompleted: DisplayCompleted,
    displayCurrentStep: DisplayCurrentStep,
    displayValues: DisplayValues,
    hiddenForm: HiddenForm,
    msfGlobal: MsfGlobal,
    nextText: NextText,
    warningClass: WarningClass,
  };

  // Reactive
  $: optionalBlocks = $msfOptional.filter((block) => block.selected);
  $: unselectedOptionalBlocks = $msfOptional.filter((block) => !block.selected);

  // Functions
  function toggleMsf() {
    if ($msfActivated) {
      $msfRequired = $msfRequired.map((block) => ({
        ...block,
        selected: false,
      }));
    }

    $msfActivated = !$msfActivated;
  }

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function addOptional(e) {
    const key: string = e.detail;
    msfOptional.modify(key, true);

    showModal = false;
  }

  function deleteOptional(key: string) {
    msfOptional.modify(key, false);
  }
</script>

<TransitionWrap>
  <section class="section">
    <!-- Hero -->
    <Hero
      title="Multi Steps"
      subtitle="Set up multi-step functionality for your forms."
      primaryText="Quick intro"
      secondaryText="Watch tutorials" />

    <!-- Msf Content -->
    <div class="container max-w-3xl">
      <div class="logic-block-divider my-12" />

      <!-- Required Header -->
      <div class="hflex-c-s mb-6">
        <h2 class="mb-0 mr-4">
          {$msfActivated ? 'Required setup' : 'Activate'}
        </h2>
        <ControlButton
          action={$msfActivated ? 'delete' : 'add'}
          on:click={toggleMsf} />
      </div>

      {#if $msfActivated}
        <!-- Required Grid -->
        <div class="msf-grid first" transition:fade|local={{ duration: 250 }}>
          {#each $msfRequired as { key, title } (key)}
            <div class="msf-block" transition:fade|local={{ duration: 250 }}>

              <MsfBlock {title} required={true}>
                <svelte:component this={components[key]} />
              </MsfBlock>

            </div>
          {/each}
        </div>

        <!-- Optional Header -->
        <div class="hflex-c-s mb-6" transition:fade|local={{ duration: 250 }}>
          <h2 class="mb-0 mr-4">Optional setup</h2>
          <ControlButton on:click={openModal} />
        </div>

        <!-- Optional Grid -->
        <div class="msf-grid" transition:fade|local={{ duration: 250 }}>
          {#each optionalBlocks as { key, title } (key)}
            <div
              class="msf-block"
              transition:fade|local={{ duration: 250 }}
              animate:flip={{ duration: 250 }}>

              <MsfBlock {title} on:delete={() => deleteOptional(key)}>
                <svelte:component this={components[key]} {key} />
              </MsfBlock>

            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  {#if showModal}
    <MsfModal
      blocks={unselectedOptionalBlocks}
      on:closemodal={closeModal}
      on:addoptional={addOptional} />
  {/if}

</TransitionWrap>
