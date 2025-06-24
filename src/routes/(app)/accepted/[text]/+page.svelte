<script>
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { back, copy } from "$lib/utils";
  let { data } = $props();
  let { text } = $derived(data);
  let { username } = $derived(data.user);
  let url = `https://coinos.io/p/${username}`;
</script>

<div class="px-2">
<div class="border-8 border-black p-2 max-w-[710px] mx-auto mt-20 space-y-5">
  <div class="flex gap-2 mx-auto justify-center">
    <img src="/images/bitcoin.png" class="w-16 h-16 my-auto" />
    <h3 class="text-4xl font-bold text-center my-auto">Bitcoin Accepted</h3>
  </div>
  <Qr {text} />
  <div class="text-center text-5xl font-bold">coinos.io/{username}</div>
  <div class="flex w-full justify-center gap-4 mt-10">
    <img
       src="/images/logo.png"
       class="ml-auto my-auto"
       style="width: 180px"
       />
  </div>
</div>
</div>
