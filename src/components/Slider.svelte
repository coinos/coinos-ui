<script lang="ts">
  interface Props {
    value: any;
    handle: any;
    min?: number;
    max?: number;
  }

  let { value = $bindable(), handle, min = 0, max = 100 }: Props = $props();
</script>

<input
  id="slider"
  type="range"
  {min}
  {max}
  bind:value
  class="range w-full"
  oninput={handle}
/>

