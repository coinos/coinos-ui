<script>
  import PhArrowLeftBold from "virtual:icons/ph/arrow-left-bold";
  import PhCopyBold from "virtual:icons/ph/copy-bold";
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
    <PhCopyBold width="32" />
    <div class="my-auto">{text}</div>
  </button>

  <div class="flex justify-center">
    <button type="button" class="btn btn-accent !w-auto" onclick={back}>
      <PhArrowLeftBold width="24" />
      Back
    </button>
  </div>
</div>
