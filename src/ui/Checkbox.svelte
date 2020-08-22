<script lang="ts">
  // Exports
  export let id: string,
    name: string,
    checked: boolean = false,
    label: string,
    extraClass: string = '';
</script>

<style>
  input {
    opacity: 0;
    position: absolute;
    z-index: -1;
  }
</style>

<label class="w-checkbox checkbox-field flex-auto {extraClass}">
  <div
    class="w-checkbox-input w-checkbox-input--inputType-custom checkbox"
    class:w--redirected-checked={checked} />
  <input type="checkbox" {id} {name} bind:checked />
  <span for={name} class="w-form-label leading-normal">{label}</span>
</label>
