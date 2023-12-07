<script>
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { back } from "$lib/utils";
  export let data;
  let { src, text } = data;
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
  <Icon icon="arrow-left" style="w-10" />
</button>

<div class="container px-4 max-w-4xl mx-auto mt-10 space-y-5">
  <div class="flex justify-center items-center">
    <div
      class="md:shadow-xl rounded-3xl md:px-10 pt-5 pb-10 space-y-5 w-full md:mx-5"
    >
      <Qr {src} />

      <div class="text-center w-full text-2xl py-10 break-all">
        {text}
      </div>
    </div>
  </div>
</div>
