<script>
  import { t } from "$lib/translations";
  import { post, success, fail, focus, setCookie } from "$lib/utils";
  import Pinpad from "$comp/Pinpad.svelte";
  import { pin } from "$lib/store";
  import { onMount } from "svelte";

  export let value = "";
  export let title = $t("user.settings.verifyPIN");
  export let cancel = () => (p = "");
  export let notify = true;

  let p = "";

  $: update(value);
  let update = (value) => (p = value);

  $: p.toString().length > 5 && (value = p.toString());

  let loaded;
  onMount(() => setTimeout(() => (loaded = true), 500));

  let locktime = 30 * 60;

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
      if (locktime) setCookie("pin", p, locktime);
      $pin = p;
    } else {
      fail("Invalid pin");
      value = "";
    }
  };
</script>

{#if loaded}
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white space-y-5"
    >
      <h1 class="text-center text-2xl font-semibold">{title}</h1>
      <Pinpad bind:v={p} {cancel} />

      <div>
        <label for="locktime" class="font-bold"
          >{$t("user.settings.rememberFor")}</label
        >
        <select
          name="locktime"
          class="select-styles block py-3 w-full"
          bind:value={locktime}
        >
          <option value={30}>30 {$t("user.settings.seconds")}</option>
          <option value={5 * 60}>5 {$t("user.settings.minutes")}</option>
          <option value={10 * 60}>10 {$t("user.settings.minutes")}</option>
          <option value={30 * 60}>30 {$t("user.settings.minutes")}</option>
          <option value={60 * 60}>1 {$t("user.settings.hour")}</option>
          <option value={8 * 60 * 60}>8 {$t("user.settings.hours")}</option>
        </select>
      </div>

      <div class="w-full flex">
        <button
          class="border-2 border-black rounded-xl font-semibold mx-auto py-3 w-40 hover:opacity-80 mx-auto"
          on:click|preventDefault={cancel}
        >
          <div class="my-auto">Cancel</div>
        </button>
      </div>
    </div>
  </div>
{/if}
