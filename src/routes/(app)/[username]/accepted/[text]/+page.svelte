<script>
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { back, copy } from "$lib/utils";
  let { data } = $props();
  let { nfc, text } = $derived(data);
  let { username } = $derived(data.subject);
  let url = `https://coinos.io/p/${username}`;
</script>

<div class="px-2">
  <div class="border-8 border-black p-8 max-w-[710px] mx-auto mt-20 space-y-5">
    <div class="flex gap-2 mx-auto justify-center">
      <img src="/images/bitcoin.png" class="w-16 h-16 my-auto" />
      <h3 class="text-5xl font-bold text-center my-auto">Bitcoin Accepted Here</h3>
    </div>
    <Qr {text} />
    <div class="text-center text-4xl font-bold">coinos.io/{username}</div>
    {#if nfc}
      <div class="flex w-full justify-center gap-4 mt-10 text-2xl">
        <div class="gap-1">
          <div class="flex items-center gap-2">
            <img
              src="/images/tap.png"
              class="mx-auto my-auto"
              style="width: 120px"
            />
            <img src="/images/icon.svg" class="my-auto w-12" />
            <div>Coinos</div>
          </div>
        </div>
        <div class="ml-auto gap-1">
          <div class="flex items-center gap-1">
            <iconify-icon
              noobserver
              icon="ph:lightning-fill"
              class="text-yellow-300"
              width={48}
            ></iconify-icon>
            <div>Other</div>
            <img
              src="/images/tap.png"
              class="ml-auto my-auto"
              style="width: 120px"
            />
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
