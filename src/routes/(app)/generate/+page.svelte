<script>
  import { run } from 'svelte/legacy';

  import { fail, post, wait } from "$lib/utils";
  import { onMount } from "svelte";
  import { goto, invalidate } from "$app/navigation";
  import Pin from "$comp/Pin.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { loginRedirect, pin, password } from "$lib/store";
  import { generate } from "$lib/nostr";
  import { browser } from "$app/environment";

  let { data } = $props();
  let { user } = $state(data);

  let loaded = $state();
  let gen = async () => {
    if (!browser) return;

    if (user.pubkey) {
      goto($loginRedirect || `/${user.username}`, { invalidateAll: true });
      return;
    }

    try {
      await generate(user);
    } catch (e) {
      console.log("error generating", e);
    }

    try {
      user.pin = $pin;
      await post(`/generate`, user);
      goto($loginRedirect || `/${user.username}`, { invalidateAll: true });
    } catch (e) {
      $pin = "";
      if (e.message?.startsWith("Pin")) {
        fail("Wrong pin, try again");
      } else {
        fail("Failed to generate keys");
        goto("/");
      }
    }
  };

  onMount(() => browser && setTimeout(() => (loaded = true) && gen(), 50));

  run(() => {
    $pin?.length === 6 && gen(user);
  });
</script>

{#if loaded && user?.haspin && $pin?.length !== 6}
  <Pin />
{/if}

<div class="container px-4 text-center mx-auto">
  <h1 class="text-3xl md:text-4xl font-bold mb-6">
    Generating new account keys
  </h1>
  <div class="flex w-full py-5 max-w-[200px] mx-auto bg-black rounded-2xl">
    <Spinner />
  </div>
</div>
