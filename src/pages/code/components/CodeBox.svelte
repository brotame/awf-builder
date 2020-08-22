<script lang="ts">
  // Helpers
  import Clipboard from 'clipboard';

  // Svelte
  import { onMount, onDestroy } from 'svelte';

  // Stores
  import generatedCode from '../../../stores/code';

  // UI Components
  import ControlButton from '../../../ui/ControlButton.svelte';

  // Variables
  let clipboard, code: HTMLElement, copyButton: HTMLElement;

  // Functions
  onMount(
    () => (clipboard = new Clipboard(copyButton, { target: () => code }))
  );

  onDestroy(() => clipboard.destroy());
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism.css" />
  <script src="/prism.js">

  </script>
</svelte:head>

<div class="container max-w-2xl">

  <!-- Divider -->
  <div class="logic-block-divider my-12" />

  <!-- Code Wrap -->
  <div class="code-wrap">

    <!-- Code -->
    <pre>
      <code id="generated-code" class="language-markup" bind:this={code}>
        {$generatedCode}
      </code>
    </pre>

    <!-- Copy Button -->
    <ControlButton action="copy" bind:button={copyButton} />

  </div>
</div>
