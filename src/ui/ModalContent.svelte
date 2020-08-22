<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  // Icons
  import ModalCloseIcon from '../icons/modal-close-icon.svg';
  import BackIcon from '../icons/back-icon.svg';
  import NextIcon from '../icons/next-icon.svg';

  // Exports
  export let currentSlide: number,
    title: string,
    content: string,
    image: string,
    isLast: boolean;

  // Functions
  const dispatch = createEventDispatcher();
</script>

<style>
  .hidden {
    opacity: 0;
    pointer-events: none;
  }
</style>

<div
  class="modal-content-wrap"
  transition:fly={{ y: 100, duration: 250, easing: quintOut }}>

  <div class="modal-content">

    <!-- Modal Content -->
    <div class="vflex-str-s">

      <!-- Title -->
      <h3 class="mb-2">{title}</h3>

      <!-- Divider -->
      <div class="logic-block-divider mb-4" />

      <!-- Text -->
      {@html content}

      <!-- Navigation -->
      <div class="hflex-c-sb mt-auto">

        <!-- Back Button -->
        <div
          class="modal-nav"
          class:hidden={currentSlide === 0}
          on:click={() => dispatch('previous')}>
          <BackIcon class="icon mr-2" />
          <div class="uppercase">Back</div>
        </div>

        <!-- Next / Finish Button -->
        <div class="modal-nav" on:click={() => dispatch('next')}>
          <div class="uppercase mr-2">{isLast ? 'Finish' : 'Next'}</div>
          {#if !isLast}
            <NextIcon class="icon" />
          {/if}
        </div>
      </div>
    </div>

    <!-- Modal Close -->
    <div class="modal-close" on:click={() => dispatch('closemodal')}>
      <div class="_w-full vflex-str-c">
        <ModalCloseIcon />
      </div>
    </div>

    <!-- Modal Image -->
    <div class="vflex-str-c">
      <img src={image} alt={title} class="rounded-4" />
    </div>
  </div>
</div>
