<script lang="ts">
  // UI Components
  import NavLink from './NavLink.svelte';

  // Icons
  import Logo from '../icons/logo.svg';

  // Types
  import { Pages } from '../types';
</script>

<header class="nav-wrap">
  <!-- Logo -->
  <a href="https://brota.me/" target="_blank" class="logo-wrap w-inline-block">
    <Logo class="logo" />
  </a>

  <!-- Nav -->
  <nav class="nav">
    <!-- Intro Link -->
    <NavLink link={Pages.HOME} text="Intro" />

    <!-- Multi Steps Link -->
    <NavLink link={Pages.MSF} text="Multi Steps" />

    <!-- Conditional Logic Link -->
    <NavLink link={Pages.LOGIC} text="Conditional Logic" />

    <!-- Generate Code Link -->
    <NavLink link={Pages.CODE} text="Generate Code" extraClass="last" />
  </nav>

  <!-- About Section -->
  <!-- prettier-ignore -->
  <p class="nav-about">A project by <a href="https://webflow.com/alexiglesias" target="_blank">Alex Iglesias</a>.</p>
</header>
