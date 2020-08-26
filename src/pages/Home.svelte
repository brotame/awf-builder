<script lang="ts">
  // UI Components
  import Hero from '../ui/Hero.svelte';
  import TransitionWrap from '../ui/TransitionWrap.svelte';

  // Stores
  import { currentPage } from '../stores/global';

  // Types
  import { Pages } from '../types';

  const startBuilder = () => {
    $currentPage = Pages.MSF;
  };
</script>

<TransitionWrap extraClass="justify-center">
  <section class="section">
    <Hero
      title="Advanced Webflow Forms"
      subtitle={`Welcome to the <strong>beta</strong> version of the Advanced
      Forms Builder. Now you can add multi step functionality and conditional
      logic to your Webflow Forms!<br />Found a bug? Got a request? Let me know
      <a href="mailto:alex@brota.me?subject=Advanced%20Webflow%20Forms">alex@brota.me</a>.`}
      primaryText="Get Started!"
      secondaryText="See Demos"
      on:primaryclick={startBuilder} />
  </section>
</TransitionWrap>
