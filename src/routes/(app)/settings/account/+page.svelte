<script lang="ts">
  import PhCheckBold from "virtual:icons/ph/check-bold";
  import PhClockBold from "virtual:icons/ph/clock-bold";
  import { theme } from "$lib/store";

  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import LocaleSelector from "$comp/LocaleSelector.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import { locale, t } from "$lib/translations";
  import { post, success, fail } from "$lib/utils";
  import { page } from "$app/stores";
  import { PUBLIC_VAPID_PUBKEY } from "$env/static/public";

  let { data } = $props();
  let user = $state((() => data.user)());
  let connect = $derived(data.connect);
  let rates = $derived(data.rates);
  let subscriptions = $derived(data.subscriptions);
  let { currency, email, tip, verified } = $state((() => user)());

  let fiats = $derived(Object.keys(rates).sort((a, b) => a.localeCompare(b)));

  let push = $state(),
    pm: any,
    subscription: any;

  let permission = $state();
  let pmReady = $state(false);

  onMount(async () => {
    if (!browser) return;

    try {
      if (!navigator?.serviceWorker) { pmReady = true; return; }
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) reg = await navigator.serviceWorker.register("/service-worker.js");
      if (reg && !reg.active) {
        await new Promise<void>((resolve) => {
          const sw = reg.installing || reg.waiting;
          if (!sw) { resolve(); return; }
          sw.addEventListener("statechange", () => {
            if (sw.state === "activated") resolve();
          });
        });
      }
      pm = reg?.pushManager;
      if (!pm) { pmReady = true; return; }

      permission = await pm.permissionState({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_PUBKEY,
      });

      if (permission === "granted") {
        subscription = await pm.getSubscription();
        if (subscriptions.includes(JSON.stringify(subscription))) push = true;
      }
    } catch (e) {
      console.error("push init failed", e);
    }

    pmReady = true;
  });

  const togglePush = async (on: boolean) => {
    if (!pm) return;
    try {
      if (subscription && !on) {
        await post("/subscription/delete", { subscription });
        return;
      }

      if (on && permission !== "denied") {
        subscription = await pm.subscribe({
          userVisibleOnly: true,
          applicationServerKey: PUBLIC_VAPID_PUBKEY,
        });
      }

      if (subscription) {
        await post("/subscription", { subscription });
      }
    } catch (e) {
      console.error("push toggle failed", e);
      push = false;
    }
  };

  let pushInitialized = false;
  $effect(() => {
    // Track push so this effect re-runs when it changes
    const val = push;
    if (!pmReady) return;
    // Skip the first run after pmReady (initial state from onMount)
    if (!pushInitialized) { pushInitialized = true; return; }
    togglePush(val);
  });

  $effect(() => {
    user.language = $locale;
  });

  $effect(() => {
    if (email !== user.email) verified = false;
  });

  let revoke = () => {};
</script>

<div>
  <label for="language" class="font-bold block mb-1">{$t("user.settings.locale")}</label>
  <LocaleSelector style="select-styles block py-3 w-full" />
</div>

<div>
  <label for="currency" class="font-bold block mb-1">{$t("user.settings.localCurrency")}</label>
  <select name="currency" value={currency}>
    {#each fiats as fiat}
      <option value={fiat}>{fiat}</option>
    {/each}
  </select>
</div>

<div class="space-y-1 relative">
  <label for="email" class="font-bold block">{$t("user.settings.email")}</label>
  <p class="text-secondary">{$t("user.settings.emailDescription")}</p>

  <label class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2">
    <input type="text" name="email" class="clean" bind:value={email} />
    {#if verified}
      <PhCheckBold width="32" class="text-success ml-auto" />
    {:else if email}
      <PhClockBold width="32" class="text-warning ml-auto" />
    {/if}
  </label>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.notifications")}</span>
    <Toggle id="notify" bind:value={user.notify} />
  </div>
  <p class="text-secondary mt-1 w-9/12">{$t("user.settings.notificationsDesc")}</p>
</div>

{#if pm}
<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.pushNotifications")}</span>
    {#if permission !== "denied"}
      <Toggle id="push" bind:value={push} />
    {/if}
  </div>
  <p class="text-secondary mt-1 w-9/12">
    {#if permission === "denied"}
      {$t("user.settings.pushNotificationsDisabled")}
    {:else}
      {$t("user.settings.pushNotificationsDesc")}
    {/if}
  </p>
</div>
{/if}

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.tipPrompt")}</span>
    <Toggle id="prompt" bind:value={user.prompt} />
  </div>
  <p class="text-secondary mt-1 w-9/12">{$t("user.settings.tipPromptDescription")}</p>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.bip353")}</span>
    <Toggle id="bip353" bind:value={user.bip353} />
  </div>
  <p class="text-secondary mt-1 w-9/12">{$t("user.settings.bip353Description")}</p>
</div>

<div class="space-y-1 relative">
  <label for="tip" class="font-bold block">{$t("user.settings.tip")}</label>
  <p class="text-secondary">{$t("user.settings.tipDesc")}</p>

  <label class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2">
    <input type="text" name="tip" class="clean" bind:value={tip} />
  </label>
</div>

{#if connect !== "connected"}
  <a href={connect} class="btn flex">
    <img src="/images/square.svg" class="w-12" class:invert={$theme === "dark"} alt="Square" />
    <div>{$t("user.settings.connectSquare")}</div>
  </a>
{:else}
  <button type="button" onclick={revoke} class="btn">
    <img src="/images/square.svg" class="w-12" class:invert={$theme === "dark"} alt="Square" />
    <div>{$t("user.settings.revokeSquare")}</div>
  </button>
{/if}
