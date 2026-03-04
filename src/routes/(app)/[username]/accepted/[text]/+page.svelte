<script>
  import PhCopyBold from "virtual:icons/ph/copy-bold";
  import Qr from "$comp/Qr.svelte";
  import { back, copy } from "$lib/utils";
  import { t } from "$lib/translations";
  import { bech32 } from "@scure/base";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { PUBLIC_DOMAIN } from "$env/static/public";

  let { encode, toWords } = bech32;
  let { data } = $props();
  let { nfc, text } = $derived(data);
  let { username } = $derived(data.subject);

  let toggleNfc = () => {
    const url = new URL($page.url);
    if (nfc) url.searchParams.delete("nfc");
    else url.searchParams.set("nfc", "true");
    goto(url.pathname + url.search, { invalidateAll: true });
  };
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
  <div class="border-8 border-black bg-white text-black p-8 max-w-[580px] mx-auto mt-20 space-y-2 rounded-3xl relative">
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

  <div class="flex items-center justify-center gap-4 my-8">
    <button onclick={() => copy(lnurl)} class="flex gap-1">
      <PhCopyBold width={32} />
      {$t("user.copyLnurl")}
    </button>
    <button onclick={toggleNfc} class="flex items-center gap-2">
      <span class="font-semibold">NFC</span>
      <div class="w-11 h-6 rounded-full relative {nfc ? 'bg-green-500' : 'bg-gray-400'}">
        <div class="absolute top-0.5 left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-all {nfc ? 'translate-x-full' : ''}"></div>
      </div>
    </button>
  </div>
</div>
