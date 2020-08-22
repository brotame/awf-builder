<script lang="ts">
  // Helpers
  import { disableScroll, enableScroll } from '../helpers';

  // Svelte
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  // Components
  import ModalContent from './ModalContent.svelte';

  // Types
  import type { Slide } from '../types';
  import type ActionsBlock from '../pages/logic/components/ActionsBlock.svelte';

  // Exports
  export let slides: Slide[];

  // Variables
  let currentSlide = 0;

  // Functions
  function nextSlide() {
    currentSlide += 1;
  }
  function previousSlide() {
    currentSlide -= 1;
  }
  const dispatch = createEventDispatcher();

  onMount(() => {
    disableScroll();
  });

  onDestroy(() => {
    enableScroll();
  });
</script>

<style>
  .modal-overlay {
    backdrop-filter: blur(0.5rem);
  }
</style>

<div class="modal">
  <ModalContent
    {...slides[currentSlide]}
    {currentSlide}
    isLast={currentSlide === slides.length - 1}
    on:closemodal
    on:previous={previousSlide}
    on:next={() => {
      if (currentSlide === slides.length - 1) dispatch('closemodal');
      else nextSlide();
    }} />
  <div
    class="modal-overlay"
    in:fade={{ duration: 100 }}
    on:click={() => dispatch('closemodal')} />
</div>
