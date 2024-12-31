<script>
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { back, copy } from "$lib/utils";
  let { data } = $props();
  let { text } = $derived(data);
</script>

<div class="container px-4 max-w-4xl mx-auto space-y-5">
  <Qr {text} />

  <button
    type="button"
    class="btn break-all !h-auto flex-nowrap p-4 font-normal leading-normal"
    onclick={() => copy(text)}
  >
    <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
    <div class="my-auto">{text}</div>
  </button>
</div>
