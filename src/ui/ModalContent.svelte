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
    video: string,
    isLast: boolean;

  // Variables
  let videoElement: HTMLMediaElement;

  // Reactive
  $: if (video) restartVideo();

  // Functions
  const dispatch = createEventDispatcher();

  function restartVideo() {
    if (!videoElement) return;
    videoElement.load();
  }
</script>

<style>
  .hidden {
    opacity: 0;
    pointer-events: none;
  }
  @media screen and (max-width: 767px) {
    .modal-image {
      -webkit-box-ordinal-group: -9998;
      -webkit-order: -9999;
      -ms-flex-order: -9999;
      order: -9999;
    }
  }

  video {
    width: 100%;
    height: auto;
    border-radius: 1rem;
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
      <div class="modal-text">
        {@html content}
      </div>

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

    <!-- Modal Image -->
    <div class="vflex-str-c modal-image">
      <!-- <img src={image} alt={title} class="rounded-4" /> -->

      <video
        autoplay={true}
        loop={true}
        muted={true}
        playsinline={true}
        bind:this={videoElement}>
        <source src={video} />
      </video>
    </div>
  </div>

  <!-- Modal Close -->
  <div class="modal-close" on:click={() => dispatch('closemodal')}>
    <div class="_w-full vflex-str-c">
      <ModalCloseIcon />
    </div>
  </div>
</div>
