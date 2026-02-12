<script>
  import Qr from "$comp/Qr.svelte";
  import { back, copy } from "$lib/utils";
  import { bech32 } from "@scure/base";
  import { page } from "$app/stores";
  import { PUBLIC_DOMAIN } from "$env/static/public";

  let { encode, toWords } = bech32;
  let { data } = $props();
  let { nfc, text } = $derived(data);
  let { username } = $derived(data.subject);
  let url = $derived(() => `https://coinos.io/p/${username.toLowerCase()}`);

  let lnurl = $derived(
    `https://${PUBLIC_DOMAIN}/ln/${encode(
      "lnurl",
      toWords(new TextEncoder().encode(`https://${PUBLIC_DOMAIN}/p/${username}`)),
      20000,
    )}`,
  );
</script>

<div class="px-2">
  <div class="border-8 border-black p-8 max-w-[580px] mx-auto mt-20 space-y-2 rounded-3xl relative">
    <div class="flex gap-2 mx-auto justify-center">
      <!-- <img src="/images/bitcoin.png" class="w-16 h-16 my-auto" /> -->
      <img src="/images/bitcoin-logo.png" class="my-auto w-[400px]" alt="Bitcoin" />
      <!-- <h3 class="text-5xl font-bold text-center my-auto"> -->
      <!--   bitcoin -->
      <!-- </h3> -->
    </div>
    {#if nfc}
      <img src="/images/tap.png" class="w-24 absolute top-52 left-4 rotate-[-10deg]" alt="Tap" />
      <img
        src="/images/arrow.png"
        class="w-24 scale-x-[-1] rotate-[120deg] absolute top-52 left-32 w-20 h-52"
        alt="Arrow"
      />
    {/if}
    <Qr {text} icon="icon.png" />
    <div class="text-center text-4xl font-bold break-all">coinos.io/{username.toLowerCase()}</div>
  </div>

  <button onclick={() => copy(lnurl)} class="flex gap-1 m-auto my-8">
    <iconify-icon icon="ph:copy-bold" width={32}></iconify-icon>
    LNURL
  </button>
</div>
