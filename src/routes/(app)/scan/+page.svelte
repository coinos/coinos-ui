<script>
  import { tick } from "svelte";
  import Icon from "$comp/Icon.svelte";
  import QrScanner from "qr-scanner";
  import { onMount, onDestroy } from "svelte";
  import { back } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { BarcodeDetector } from "barcode-detector/ponyfill";

  let scanner,
    vid = $state(),
    resizing;

  let resize = () => {
    if (resizing) clearTimeout(resizing);
    resizing = setTimeout(initialize, 1000);
  };

  let initialize = async () => {
    if (scanner) {
      scanner.stop();
      await new Promise((r) => setTimeout(r, 1000));
    }

    let options = {
      highlightScanRegion: true,
      highlightCodeOutline: true,
      qrEngine: BarcodeDetector,
    };
    let cb = ({ data }) =>
      scanner.stop() || goto(`/send/${encodeURIComponent(data)}`);
    scanner = new QrScanner(vid, cb, options);
    await tick();
    scanner.start();
  };

  onMount(initialize);
  onDestroy(() => scanner?.stop());
</script>

<svelte:window onresize={resize} />

<div class="flex w-full mb-4 p-4">
  <div class="mx-auto rounded-3xl">
    <video
      bind:this={vid}
      class="border-4 rounded-3xl border-black max-h-[calc(100vh*0.7)]"
    ></video>
  </div>
</div>

<div class="flex justify-center">
  <button class="btn !w-auto" onclick={back}>Cancel</button>
</div>

<style>
  video {
    transition: transform 0.3s ease-out;
    transform: scale(1);
  }
</style>
