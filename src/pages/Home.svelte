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
      title="Webflow Advanced Forms"
      subtitle="This is a beta version of the builder for testing purposes. The
      Multi Steps builder is not ready yet, but you can start playing around
      with the Conditional Logic."
      primaryText="Get Started!"
      secondaryText="See Demos"
      on:primaryclick={startBuilder} />
  </section>
</TransitionWrap>
