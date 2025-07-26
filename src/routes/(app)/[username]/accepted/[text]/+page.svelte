<script>
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { back, copy } from "$lib/utils";
  let { data } = $props();
  let { nfc, text } = $derived(data);
  let { username } = $derived(data.subject);
  let url = `https://coinos.io/p/${username.toLowerCase()}`;
</script>

<div class="px-2">
  <div
    class="border-8 border-black p-8 max-w-[580px] mx-auto mt-20 space-y-2 rounded-3xl relative"
  >
    <div class="flex gap-2 mx-auto justify-center">
      <!-- <img src="/images/bitcoin.png" class="w-16 h-16 my-auto" /> -->
      <img src="/images/bitcoin-logo.png" class="my-auto w-[400px]" />
      <!-- <h3 class="text-5xl font-bold text-center my-auto"> -->
      <!--   bitcoin -->
      <!-- </h3> -->
    </div>
    {#if nfc}
      <img src="/images/tap.png" class="w-24 absolute top-40 left-4" />
      <img src="/images/arrow.png" class="w-24 scale-x-[-1] rotate-[105deg] absolute top-52 left-32 w-16 h-52" />
    {/if}
    <Qr {text} />
    <div class="text-center text-4xl font-bold break-all">
      coinos.io/{username.toLowerCase()}
    </div>
  </div>
</div>
