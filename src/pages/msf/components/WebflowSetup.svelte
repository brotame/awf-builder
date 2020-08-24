<script lang="ts">
  // Constants
  import { starterForm } from '../../../constants';

  // Stores
  import { msfCopy } from '../../../stores/msf';

  // Types
  type Notification = 'success' | 'error';

  // Variables
  let notification: Notification = undefined;
  let buttonText = 'Copy Starter Form';

  // Reactive
  $: if (notification === 'success')
    buttonText = 'Copied! Paste it in Webflow :)';
  else if (notification === 'error') buttonText = 'An error ocurred';
  else buttonText = 'Copy Starter Form';

  // Functions
  function createCopy() {
    document.execCommand('copy');
  }

  function handleCopy(e: ClipboardEvent) {
    try {
      // Copy starter form JSON to clipboard
      e.clipboardData.setData(
        'application/json',
        JSON.stringify(starterForm).trim()
      );
      e.preventDefault();

      // Set default selectors in the store (check Elements.svelte)
      $msfCopy = true;

      // Trigger notification
      triggerNotification('success');
    } catch {
      triggerNotification('error');
    }
  }

  function triggerNotification(state: Notification) {
    if (notification) return;

    notification = state;
    setTimeout(() => {
      notification = undefined;
    }, 2000);
  }
</script>

<p>Make sure your form meets the following requirements:</p>
<ul role="list">
  <li>
    It has a submit button set to
    <span class="opacity-75">display:none</span>
    . The script will use the button text and waiting text.
  </li>
  <li>
    <p class="mb-2">It has a slider inside it. The slider should have:</p>
    <ul role="list">
      <li class="mb-1">
        Swipe gestures
        <span class="opacity-75">deactivated</span>
        .
      </li>
      <li class="mb-1">
        Auto-play slides
        <span class="opacity-75">deactivated</span>
        .
      </li>
      <li class="mb-1">
        Its height forced to be
        <span class="opacity-75">auto</span>
        .
      </li>
      <li>
        The slider arrows and nav set to
        <span class="opacity-75">display:none</span>
        .
      </li>
    </ul>
  </li>
</ul>
<p
  class="button w-button"
  role="button"
  class:error={notification === 'error'}
  on:click={createCopy}
  on:copy={handleCopy}>
  {buttonText}
</p>
