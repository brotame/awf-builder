<script lang="ts">
  // UI Components
  import Hero from '../../ui/Hero.svelte';
  import TransitionWrap from '../../ui/TransitionWrap.svelte';

  // Components
  import CodeBox from './components/CodeBox.svelte';
</script>

<TransitionWrap extraClass="justify-center">
  <section class="section">
    <!-- Hero -->
    <Hero
      title="Get the code!"
      subtitle={`All you have to do is copy and paste it in the <b>before &lt;/body&gt; tag</b> of the page that contains your form.`} />

    <!-- CodeBox -->
    <CodeBox />
  </section>
</TransitionWrap>
