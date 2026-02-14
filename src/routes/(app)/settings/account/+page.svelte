<script lang="ts">
  import { run } from "svelte/legacy";
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
  let user = $state(data.user);
  let connect = $derived(data.connect);
  let rates = $derived(data.rates);
  let subscriptions = $derived(data.subscriptions);
  let { currency, email, tip, verified } = $state(user);

  let fiats = Object.keys(rates).sort((a, b) => a.localeCompare(b));

  let push = $state(),
    pm: any,
    subscription: any;

  onMount(async () => {
    if (!browser) return;

    pm = navigator?.serviceWorker && (await navigator.serviceWorker.getRegistration())?.pushManager;

    permission = await pm.permissionState({
      userVisibleOnly: true,
      applicationServerKey: PUBLIC_VAPID_PUBKEY,
    });

    if (permission === "granted") {
      subscription = await pm.getSubscription();
      if (subscriptions.includes(JSON.stringify(subscription))) push = true;
    }
  });

  let permission = $state();
  let updateNotifications = async (push) => {
    if (!browser || !pm) return (push = false);

    if (subscription && !push) {
      return post("/subscription/delete", { subscription });
    }

    if (push && permission !== "denied") {
      subscription = await pm.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_PUBKEY,
      });
    }

    if (subscription) {
      await post("/subscription", { subscription });
    }
  };
  run(() => {
    user.language = $locale;
  });
  run(() => {
    updateNotifications(push);
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
      <iconify-icon noobserver icon="ph:check-bold" class="text-success ml-auto" width="32"
      ></iconify-icon>
    {:else if email}
      <iconify-icon noobserver icon="ph:clock-bold" class="text-warning ml-auto" width="32"
      ></iconify-icon>
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

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.tipPrompt")}</span>
    <Toggle id="prompt" bind:value={user.prompt} />
  </div>
  <p class="text-secondary mt-1 w-9/12">{$t("user.settings.tipPromptDescription")}</p>
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
    <img src="/images/square.svg" class="w-12" alt="Square" />
    <div>{$t("user.settings.connectSquare")}</div>
  </a>
{:else}
  <button type="button" onclick={revoke} class="btn">
    <img src="/images/square.svg" class="w-12" class:invert={$theme === "dark"} alt="Square" />
    <div>{$t("user.settings.revokeSquare")}</div>
  </button>
{/if}
