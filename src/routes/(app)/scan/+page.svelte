<script>
  import { tick } from "svelte";
  import Icon from "$comp/Icon.svelte";
  import QrScanner from "qr-scanner";
  import { onMount, onDestroy } from "svelte";
  import { back } from "$lib/utils";
  import { goto } from "$app/navigation";

  let scanner, vid, resizing;

  let resize = () => {
    if (resizing) clearTimeout(resizing);
    resizing = setTimeout(initialize, 1000);
  };

  let initialize = async () => {
    if (scanner) {
      scanner.stop();
      await new Promise((r) => setTimeout(r, 1000));
    }

    let options = { highlightScanRegion: true, highlightCodeOutline: true };
    let cb = ({ data }) => scanner.stop() || goto(`/send/${encodeURI(data)}`);
    scanner = new QrScanner(vid, cb, options);
    await tick();
    scanner.start();
  };

  onMount(initialize);
  onDestroy(() => scanner?.stop());
</script>

<svelte:window on:resize={resize} />

<div class="flex w-full mb-4 p-4">
  <div class="mx-auto rounded-3xl">
    <video
      bind:this={vid}
      class="border-4 rounded-3xl border-black max-h-[calc(100vh*0.7)]"
    />
  </div>
</div>

<div class="flex justify-center">
  <button class="btn !w-auto" on:click={back}>Cancel</button>
</div>

<style>
  video {
    transition: transform 0.3s ease-out;
    transform: scale(1);
  }
</style>
