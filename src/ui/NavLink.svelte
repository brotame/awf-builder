<script lang="ts">
  // Stores
  import { currentPage } from '../stores/global';

  // Types
  import type { Pages } from '../types';

  // Exports
  export let link: Pages,
    text: string,
    extraClass: string = '';

  // Icons
  import IntroIcon from '../icons/intro-icon.svg';
  import MultiStepsIcon from '../icons/multi-steps-icon.svg';
  import ConditionalLogicIcon from '../icons/conditional-logic-icon.svg';
  import GenerateCodeIcon from '../icons/generate-code-icon.svg';

  // Variables
  const icons = [
    IntroIcon,
    MultiStepsIcon,
    ConditionalLogicIcon,
    GenerateCodeIcon,
  ];
</script>

<style>
  :global(button) {
    background-color: #ffffff00;
    padding: 0;
  }
  :global(button:focus) {
    outline: none;
  }
</style>

<button
  class="nav-item w-inline-block {extraClass}"
  class:w--current={$currentPage === link}
  on:click={() => ($currentPage = link)}>
  <div class="nav-icon">
    <svelte:component this={icons[link]} />
  </div>
  <div class="nav-text">{text}</div>
</button>
