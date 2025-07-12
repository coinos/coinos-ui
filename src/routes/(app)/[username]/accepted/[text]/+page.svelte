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
  <div class="border-8 border-black p-8 max-w-[710px] mx-auto mt-20 space-y-5">
    <div class="flex gap-2 mx-auto justify-center">
      <img src="/images/bitcoin.png" class="w-16 h-16 my-auto" />
      <h3 class="text-5xl font-bold text-center my-auto">
        Bitcoin Accepted Here
      </h3>
    </div>
    <Qr {text} />
    <div class="text-center text-4xl font-bold">
      coinos.io/{username.toLowerCase()}
    </div>
    {#if nfc}
      <div class="flex w-full justify-center gap-4 mt-10 text-2xl">
        <div class="flex gap-1 items-center">
          <img
            src="/images/tap.png"
            class="mx-auto my-auto"
            style="width: 120px"
          />

          <!-- <img src="/images/icon.png" class="mx-auto my-auto w-16" /> -->
        </div>
        <div class="flex ml-auto gap-1 items-center">
          <!-- <iconify-icon -->
          <!--   noobserver -->
          <!--   icon="ph:lightning-fill" -->
          <!--   class="text-yellow-300" -->
          <!--   width={48} -->
          <!-- ></iconify-icon> -->
          <img
            src="/images/lntap.png"
            class="ml-auto my-auto"
            style="width: 120px"
          />
        </div>
      </div>
    {/if}
  </div>
</div>
