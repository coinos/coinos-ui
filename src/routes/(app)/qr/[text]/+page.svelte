<script>
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { back, copy } from "$lib/utils";
  export let data;
  let { src, text } = data;
</script>

<div class="container px-4 max-w-4xl mx-auto space-y-5">
  <div class="flex justify-center items-center">
    <div
      class="md:shadow-xl rounded-3xl md:px-10 pt-5 pb-10 space-y-5 w-full md:mx-5"
    >
      <Qr {src} />

      <button
        type="button"
        class="flex gap-2 text-center break-all rounded-2xl hover:opacity-80 py-5 px-6 w-full mx-auto justify-center border text-xl hover:bg-slate-100"
        on:click={() => copy(text)}
      >
        <div class="my-auto">
          {text}
        </div>
      </button>
    </div>
  </div>
</div>
