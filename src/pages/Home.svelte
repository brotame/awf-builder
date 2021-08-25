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
      subtitle={`
      <strong>Important note:</strong>This project is no longer maintained in favor of the upcoming (and more advanced) Form Logic project that I'm working on in Finsweet. Feel free to play around with this app as much as you want, but I recommend you don't use it in serious projects as I won't be offering any support for it!
      <br /><br />
      Welcome to the <strong>beta</strong> version of the Advanced
      Forms Builder. Now you can add multi step functionality and conditional
      logic to your Webflow Forms!
      Demos and tutorials are comming soon, as well as new feature releases!`}
      primaryText="Get Started!"
      secondaryText="See Demos"
      on:primaryclick={startBuilder}
    />
  </section>
</TransitionWrap>
