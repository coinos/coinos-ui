<script>
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { back, copy } from "$lib/utils";
  export let data;
  let { src, text } = data;
</script>

<div class="container px-4 max-w-4xl mx-auto space-y-5">
  <Qr {src} />

  <button
    type="button"
    class="btn break-all !h-auto flex-nowrap p-4 font-normal leading-normal"
    on:click={() => copy(text)}
  >
    <iconify-icon icon="ph:copy-bold" width="32" />
    <div class="my-auto">{text}</div>
  </button>
</div>
