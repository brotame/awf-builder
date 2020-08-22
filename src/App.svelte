<script lang="ts">
  // UI Components
  import Nav from './ui/Nav.svelte';

  // Pages
  import Home from './pages/Home.svelte';
  import Msf from './pages/msf/Msf.svelte';
  import Logic from './pages/logic/Logic.svelte';
  import Code from './pages/code/Code.svelte';

  // Stores
  import { currentPage } from './stores/global';

  const pages = [Home, Msf, Logic, Code];
</script>

<div class="page-wrap">
  <Nav />
  <main class="main">
    <svelte:component this={pages[$currentPage]} />
  </main>
</div>
