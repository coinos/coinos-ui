<script>
  import { fail, post, wait } from "$lib/utils";
  import { onMount } from "svelte";
  import { goto, invalidate } from "$app/navigation";
  import Pin from "$comp/Pin.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { loginRedirect, pin, password } from "$lib/store";
  import { getMnemonic } from "$lib/nostr";
  import { browser } from "$app/environment";
  import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
  export let data;
  let { user } = data;

  let loaded;
  let gen = async () => {
    if (!browser) return;

    if (user.cpub) {
      goto($loginRedirect || `/${user.username}`, { invalidateAll: true });
      return;
    }

    try {
      let mnemonic = await getMnemonic(user);

      const mintUrl = "http://localhost:3338";
      const mint = new CashuMint(mintUrl);
      const wallet = new CashuWallet(mint, { mnemonicOrSeed: mnemonic });


      console.log(mnemonic);
      console.log(wallet)
    } catch (e) {
      console.log("error generating", e);
    }

    try {
      user.pin = $pin;
      await post(`/${user.username}/update`, user);
      goto($loginRedirect || `/${user.username}`, { invalidateAll: true });
    } catch (e) {
      $pin = "";
      if (e.message?.startsWith("Pin")) {
        fail("Wrong pin, try again");
      } else {
        fail("Failed to issue e-cash");
        goto("/");
      }
    }
  };

  onMount(() => browser && setTimeout(() => (loaded = true) && gen(), 50));

  $: $pin?.length === 6 && gen(user);
</script>

{#if loaded && user?.haspin && $pin?.length !== 6}
  <Pin />
{/if}

<div class="container px-4 text-center mx-auto">
  <h1 class="text-3xl md:text-4xl font-bold mb-6">Issuing e-cash</h1>
  <div class="flex w-full py-5 max-w-[200px] mx-auto bg-black rounded-2xl">
    <Spinner />
  </div>
</div>
