<script lang="ts">
  // Svelte
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // Stores
  import { msfActivated, msfRequired, msfOptional } from '../../stores/msf';

  // Types
  import type { Slide } from '../../types';

  // Slides
  import msfSlides from './msf-slides';

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
  import Modal from '../../ui/Modal.svelte';

  // Variables
  let showModal: 'optional' | 'info' = undefined;
  let slides: Slide[] = [];
  const components = {
    alertSelector: AlertElement,
    alertText: AlertText,
    backText: BackText,
    backSelector: BackButton,
    completedPercentageSelector: DisplayCompleted,
    currentStepSelector: DisplayCurrentStep,
    customNav: CustomNav,
    displayValues: DisplayValues,
    elements: Elements,
    hiddenForm: HiddenForm,
    msfGlobal: MsfGlobal,
    nextText: NextText,
    warningClass: WarningClass,
    webflowSetup: WebflowSetup,
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

  function openModal(mode: 'optional' | 'info', key?: string) {
    if (key) slides = msfSlides[key];
    showModal = mode;
  }

  function closeModal() {
    showModal = undefined;
  }

  function addOptional(e: CustomEvent) {
    const key: string = e.detail;
    msfOptional.modify(key, true);

    showModal = undefined;
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
      secondaryText="Watch tutorials"
      on:primaryclick={() => openModal('info', 'intro')} />

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

              <MsfBlock
                {title}
                required={true}
                on:info={() => openModal('info', key)}>
                <svelte:component this={components[key]} />
              </MsfBlock>

            </div>
          {/each}
        </div>

        <!-- Optional Header -->
        <div class="hflex-c-s mb-6" transition:fade|local={{ duration: 250 }}>
          <h2 class="mb-0 mr-4">Optional setup</h2>
          <ControlButton on:click={() => openModal('optional')} />
        </div>

        <!-- Optional Grid -->
        <div class="msf-grid" transition:fade|local={{ duration: 250 }}>
          {#each optionalBlocks as { key, title } (key)}
            <div
              class="msf-block"
              transition:fade|local={{ duration: 250 }}
              animate:flip={{ duration: 250 }}>

              <MsfBlock
                {title}
                on:info={() => openModal('info', key)}
                on:delete={() => deleteOptional(key)}>
                <svelte:component this={components[key]} {key} />
              </MsfBlock>

            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  {#if showModal === 'optional'}
    <MsfModal
      blocks={unselectedOptionalBlocks}
      on:closemodal={closeModal}
      on:addoptional={addOptional} />
  {:else if showModal === 'info'}
    <Modal on:closemodal={closeModal} {slides} />
  {/if}

</TransitionWrap>
