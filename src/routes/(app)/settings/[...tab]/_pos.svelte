<script>
  import { tick } from "svelte";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import LocaleSelector from "$comp/LocaleSelector.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import { locale, t } from "$lib/translations";
  import { success, fail } from "$lib/utils";
  import { page } from "$app/stores";

  export let user, rates, submit;

  let { currency } = user;
  let rate = rates[currency];

  let fiats = Object.keys(rates).sort((a,b) => a.localeCompare(b));
  $: user.language = $locale;
  let keypress = (e) => e.key === "Enter" && (e.preventDefault() || el.click());

  let editingReserve, editingThreshold, doneReserve, doneThreshold;
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
  let reserveEl, thresholdEl;
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
  <select
    name="currency"
    class="select-styles block py-3 w-full"
    value={user.currency}
  >
    {#each fiats as fiat}
      <option value={fiat}>{fiat}</option>
    {/each}
  </select>
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
    <span class="font-bold">{$t("user.settings.tipPrompt")}</span>
    <Toggle id="prompt" bind:value={user.prompt} />
  </div>
  <p class="text-secondary mt-1 w-9/12">
    {$t("user.settings.tipPromptDescription")}
  </p>
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

{#if user.autowithdraw}
  <div class="mb-2">
    <label for="display" class="font-bold mb-1 block"
      >{$t("user.settings.destination")}</label
    >
    <textarea
      name="destination"
      placeholder={$t("user.settings.destinationPlaceholder")}
      on:keypress={keypress}
      class="w-full p-4 border rounded-xl h-48"
      bind:value={user.destination}
    />
  </div>

  <div>
    <label for="display" class="font-bold mb-1 block"
      >{$t("user.settings.threshold")}</label
    >
    <button type="button" class="flex w-full" on:click={editThreshold}>
      <div class="p-4 border rounded-2xl rounded-r-none border-r-0 bg-primary">
        ⚡️
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
    <button type="button" class="flex w-full" on:click={editReserve}>
      <div class="p-4 border rounded-2xl rounded-r-none border-r-0 bg-primary">
        ⚡️
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
{/if}

{#if editingThreshold}
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative top-40 mx-auto p-5 border shadow-lg rounded-md bg-white space-y-5 w-lg max-w-lg"
    >
      <h1 class="text-center text-2xl font-semibold">
        {$t("user.settings.threshold")}
      </h1>
      <Numpad
        bind:amount={user.threshold}
        bind:currency
        bind:rate
        bind:submit={doneReserve}
        bind:element={thresholdEl}
      />

      <button
        bind:this={doneReserve}
        type="button"
        on:click={doneEditing}
        class="p-4 bg-black text-white rounded-2xl text-lg font-semibold w-full"
        >Ok</button
      >
    </div>
  </div>
{/if}

{#if editingReserve}
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative top-40 mx-auto p-5 border shadow-lg rounded-md bg-white space-y-5 w-lg max-w-lg text-center"
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
        on:click={doneEditing}
        class="p-4 bg-black text-white rounded-2xl text-lg font-semibold w-full"
        >Ok</button
      >
    </div>
  </div>
{/if}

<a href="./shopify">
  <button
    type="button"
    class="flex rounded-full border py-2 px-4 font-bold hover:opacity-80 w-full gap-2 my-5 justify-center"
  >
    <img src="/icons/shopify.svg" class="w-8" />
    <div class="my-auto">{$t("user.settings.shopify")}</div>
  </button>
</a>
