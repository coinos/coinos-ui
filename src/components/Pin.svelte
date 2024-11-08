<script lang="ts">
  import { run, createBubbler, preventDefault } from "svelte/legacy";

  const bubble = createBubbler();
  import { t } from "$lib/translations";
  import { post, success, fail, focus, setCookie } from "$lib/utils";
  import Pinpad from "$comp/Pinpad.svelte";
  import { pin } from "$lib/store";
  import { onMount } from "svelte";

  interface Props {
    value?: string;
    title?: any;
    cancel?: any;
    notify?: boolean;
  }

  let {
    value = $bindable(""),
    title = $t("user.settings.verifyPIN"),
    cancel = () => (p = ""),
    notify = true,
  }: Props = $props();

  let p = $state("");

  let update = (value) => (p = value);

  let loaded = $state();
  onMount(() => setTimeout(() => (loaded = true), 500));

  let locktime = $state(30 * 60);

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
  run(() => {
    p.toString().length > 5 && (value = p.toString());
  });
  run(() => {
    update(value);
  });
  run(() => {
    loaded && checkPin(p);
  });
</script>

{#if loaded}
  <div
    class="fixed bg-base-100 bg-opacity-90 inset-0 h-full w-full z-50 cursor-default"
    onclick={preventDefault(bubble("click"))}
  >
    <div
      class="mx-auto p-5 border shadow-lg rounded-md bg-base-100 space-y-5 max-w-lg"
    >
      <h1 class="text-center text-2xl font-semibold">{title}</h1>
      <Pinpad bind:v={p} {cancel} />

      <div>
        <label for="locktime" class="font-bold"
          >{$t("user.settings.rememberFor")}</label
        >
        <select name="locktime" bind:value={locktime}>
          <option value={30}>30 {$t("user.settings.seconds")}</option>
          <option value={5 * 60}>5 {$t("user.settings.minutes")}</option>
          <option value={10 * 60}>10 {$t("user.settings.minutes")}</option>
          <option value={30 * 60}>30 {$t("user.settings.minutes")}</option>
          <option value={60 * 60}>1 {$t("user.settings.hour")}</option>
          <option value={8 * 60 * 60}>8 {$t("user.settings.hours")}</option>
        </select>
      </div>

      <div class="w-full flex">
        <button class="btn" onclick={preventDefault(cancel)}>
          <div class="my-auto">Cancel</div>
        </button>
      </div>
    </div>
  </div>
{/if}
