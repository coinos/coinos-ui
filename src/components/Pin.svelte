<script>
  import { t } from "$lib/translations";
  import { post, success, fail, focus } from "$lib/utils";
  import Pinpad from "$comp/Pinpad.svelte";
  import { pin } from "$lib/store";
  import { onMount } from "svelte";

  export let value = "";
  export let title = $t("user.settings.verifyPIN");
  export let cancel = () => (p = "");
  export let persist = true;
  export let notify = true;

  let p = "";

  $: update(value);
  let update = (value) => (p = value);

  $: p.toString().length > 5 && (value = p.toString());

  let loaded;
  onMount(() => setTimeout(() => (loaded = true), 500));

  $: loaded && checkPin(p);
  let checkPin = async (p) => {
    if (p?.length !== 6) return;
    let result;
    try {
      result = await post("/pin", { pin: p });
    } catch (e) {
      console.log("Pin check failed", e);
    }

    if (result) {
      if (notify) success("Pin confirmed");
      if (persist) $pin = p;
    } else {
      fail("Invalid pin");
      value = "";
    }
  };
</script>

{#if loaded}
  <div
    class="fixed inset-0 bg-gray-600 dark:bg-stone-950 dark:bg-opacity-90 bg-opacity-50 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white dark:bg-stone-800 dark:border-0 space-y-5"
    >
      <h1 class="text-center text-2xl font-semibold">{title}</h1>
      <Pinpad bind:v={p} {cancel} />
      <div class="w-full flex">
        <button
          class="border-2 border-black dark:border-gray-50 dark:text-gray-50 rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80"
          on:click|preventDefault={cancel}
        >
          <div class="my-auto">Cancel</div>
        </button>
      </div>
    </div>
  </div>
{/if}
