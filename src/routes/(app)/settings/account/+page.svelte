<script lang="ts">
  import { run } from "svelte/legacy";
  import { theme } from "$lib/store";

  import { onMount, tick } from "svelte";
  import { browser } from "$app/environment";
  import Numpad from "$comp/Numpad.svelte";
  import LocaleSelector from "$comp/LocaleSelector.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import { locale, t } from "$lib/translations";
  import { post, success, fail } from "$lib/utils";
  import { page } from "$app/stores";
  import { PUBLIC_VAPID_PUBKEY } from "$env/static/public";

  let { data } = $props();
  let { user } = $state(data);
  let { connect, rates, subscriptions } = data;
  let { currency, email, tip, verified } = $state(user);
  let rate = $derived(() => rates[currency]);

  let fiats = Object.keys(rates).sort((a, b) => a.localeCompare(b));
  let keypress = (e) => e.key === "Enter" && (e.preventDefault() || el.click());

  let editingReserve = $state(),
    editingThreshold = $state(),
    doneReserve = $state(),
    doneThreshold;
  let doneEditing = () => {
    editingReserve = false;
    editingThreshold = false;
  };

  let editReserve = async () => {
    editingReserve = true;
    await tick();
    reserveEl.focus();
  };

  let editThreshold = async () => {
    editingThreshold = true;
    await tick();
    thresholdEl.focus();
  };

  if (!user.threshold) user.threshold = 1000000;
  if (!user.reserve) user.reserve = 100000;
  let reserveEl = $state(),
    thresholdEl = $state();

  let push = $state(),
    pm,
    subscription;

  onMount(async () => {
    if (!browser) return;

    pm =
      navigator?.serviceWorker &&
      (await navigator.serviceWorker.getRegistration()).pushManager;

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
  <label for="language" class="font-bold block mb-1"
    >{$t("user.settings.locale")}</label
  >
  <LocaleSelector style="select-styles block py-3 w-full" />
</div>

<div>
  <label for="currency" class="font-bold block mb-1"
    >{$t("user.settings.localCurrency")}</label
  >
  <select name="currency" value={currency}>
    {#each fiats as fiat}
      <option value={fiat}>{fiat}</option>
    {/each}
  </select>
</div>

<div class="space-y-1 relative">
  <label for="email" class="font-bold block">{$t("user.settings.email")}</label>
  <p class="text-secondary">
    {$t("user.settings.emailDescription")}
  </p>

  <label
    class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2"
  >
    <input type="text" name="email" class="clean" bind:value={email} />
    {#if verified}
      <iconify-icon
        noobserver
        icon="ph:check-bold"
        class="text-success ml-auto"
        width="32"
      ></iconify-icon>
    {:else if email}
      <iconify-icon
        noobserver
        icon="ph:clock-bold"
        class="text-warning ml-auto"
        width="32"
      ></iconify-icon>
    {/if}
  </label>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.notifications")}</span>
    <Toggle id="notify" bind:value={user.notify} />
  </div>
  <p class="text-secondary mt-1 w-9/12">
    {$t("user.settings.notificationsDesc")}
  </p>
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
  <p class="text-secondary mt-1 w-9/12">
    {$t("user.settings.tipPromptDescription")}
  </p>
</div>

<div class="space-y-1 relative">
  <label for="tip" class="font-bold block">{$t("user.settings.tip")}</label>
  <p class="text-secondary">
    {$t("user.settings.tipDesc")}
  </p>

  <label
    class="input input-bordered border-primary input-lg rounded-2xl flex items-center gap-2"
  >
    <input type="text" name="tip" class="clean" bind:value={tip} />
  </label>
</div>

<div>
  <div class="flex justify-between items-center">
    <span class="font-bold">{$t("user.settings.autoWithdraw")}</span>
    <Toggle id="autowithdraw" bind:value={user.autowithdraw} />
  </div>
  <p class="text-secondary mt-1 w-9/12">
    {$t("user.settings.autoWithdrawDescription")}
  </p>
</div>

<div class:hidden={!user.autowithdraw}>
  <div class="mb-2">
    <label for="display" class="font-bold mb-1 block"
      >{$t("user.settings.destination")}</label
    >
    <textarea
      name="destination"
      placeholder={$t("user.settings.destinationPlaceholder")}
      onkeypress={keypress}
      class="w-full p-4 border rounded-xl h-48"
      bind:value={user.destination}
    ></textarea>
  </div>

  <div>
    <label for="display" class="font-bold mb-1 block"
      >{$t("user.settings.threshold")}</label
    >
    <button type="button" class="flex w-full" onclick={editThreshold}>
      <div class="p-4 border rounded-2xl rounded-r-none border-r-0 bg-base-200">
        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300"
        ></iconify-icon>
      </div>
      <div
        class="border-l-0 rounded-l-none pl-2 w-full p-4 border rounded-2xl text-left"
      >
        {user.threshold}
      </div>
      <input type="hidden" name="threshold" bind:value={user.threshold} />
    </button>
    <p class="text-secondary mt-1">
      {$t("user.settings.thresholdDesc")}
    </p>
  </div>

  <div>
    <label for="display" class="font-bold mb-1 block"
      >{$t("user.settings.reserve")}</label
    >
    <button type="button" class="flex w-full" onclick={editReserve}>
      <div class="p-4 border rounded-2xl rounded-r-none border-r-0 bg-base-200">
        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300"
        ></iconify-icon>
      </div>
      <div
        class="border-l-0 rounded-l-none pl-2 w-full p-4 border rounded-2xl text-left"
      >
        {user.reserve}
      </div>
      <input type="hidden" name="reserve" bind:value={user.reserve} />
    </button>
    <p class="text-secondary mt-1">
      {$t("user.settings.reserveDesc")}
    </p>
  </div>
</div>

{#if editingThreshold}
  <div
    class="fixed bg-base-100/90 inset-0 overflow-y-auto h-full w-full z-50 max-w-lg mx-auto"
  >
    <div class="relative p-5 border shadow-lg rounded-md bg-base-100 space-y-5">
      <h1 class="text-center text-2xl font-semibold">
        {$t("user.settings.threshold")}
      </h1>
      <Numpad
        bind:amount={user.threshold}
        {currency}
        bind:rate
        bind:submit={doneReserve}
        bind:element={thresholdEl}
      />

      <button
        bind:this={doneReserve}
        type="button"
        onclick={doneEditing}
        class="btn">Ok</button
      >
    </div>
  </div>
{/if}

{#if editingReserve}
  <div
    class="fixed bg-base-100/90 inset-0 overflow-y-auto h-full w-full z-50 mx-auto max-w-lg"
  >
    <div
      class="relative mx-auto p-5 border shadow-lg rounded-md bg-base-100 space-y-5 text-center"
    >
      <h1 class="text-2xl font-semibold">
        {$t("user.settings.reserve")}
      </h1>
      <Numpad
        bind:amount={user.reserve}
        bind:currency
        bind:rate
        bind:submit={doneReserve}
        bind:element={reserveEl}
      />
      <button
        bind:this={doneReserve}
        type="button"
        onclick={doneEditing}
        class="btn">Ok</button
      >
    </div>
  </div>
{/if}

{#if connect !== "connected"}
  <a href={connect} class="btn flex">
    <img src="/images/square.svg" class="w-12" alt="Square" />
    <div>{$t("user.settings.connectSquare")}</div></a
  >
{:else}
  <button type="button" onclick={revoke} class="btn">
    <img
      src="/images/square.svg"
      class="w-12"
      class:invert={$theme === "dark"}
      alt="Square"
    />
    <div>{$t("user.settings.revokeSquare")}</div>
  </button>
{/if}
