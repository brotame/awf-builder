<script lang="ts">
  // Svelte
  import { setContext } from 'svelte';
  import { fade } from 'svelte/transition';

  // Stores
  import logicStore from '../../stores/logic';

  // Types
  import type { Slide } from '../../types';

  // UI Components
  import Hero from '../../ui/Hero.svelte';
  import TransitionWrap from '../../ui/TransitionWrap.svelte';
  import Modal from '../../ui/Modal.svelte';

  // Components
  import LogicList from './components/LogicList.svelte';
  import LogicEditor from './components/LogicEditor.svelte';

  // Slides
  import logicSlides from './logic-slides';

  // Variables
  let editMode: boolean = false;
  let editID: string | null = null;
  let showModal: boolean = false;
  let slides: Slide[] = [];

  // Functions
  function newLogic() {
    editMode = true;
  }

  function editLogic(id: string) {
    editMode = true;
    editID = id;
  }

  function cancelEdit() {
    editMode = false;
    editID = null;
  }

  function openModal(key: string) {
    slides = logicSlides[key];
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  // Context
  setContext('logic', { editLogic, openModal });
</script>

<!-- Logic Editor -->
{#if editMode}
  <TransitionWrap>
    <section class="section min-h-screen">
      <LogicEditor on:cancel={cancelEdit} {editID} />
    </section>
  </TransitionWrap>

  <!-- Main Content -->
{:else}
  <TransitionWrap>
    <section class="section">
      <!-- Hero -->
      <Hero
        title="Conditional Logic"
        subtitle="Here you can build all the conditions and actions that you
        want to add to the form."
        primaryText="Quick intro"
        secondaryText="Watch tutorials"
        on:primaryclick={() => openModal('intro')} />

      <!-- Logic List -->
      <LogicList on:newLogic={newLogic} />
    </section>
  </TransitionWrap>
{/if}

<!-- Modal -->
{#if showModal}
  <Modal on:closemodal={closeModal} {slides} />
{/if}
