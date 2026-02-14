<script lang="ts">
  import { page } from "$app/stores";
  import Mnemonic from "$comp/Mnemonic.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import WalletPass from "$comp/WalletPass.svelte";
  import { goto } from "$app/navigation";
  import { copy, fail, focus, post } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import { tick } from "svelte";
  import { entropyToMnemonic, mnemonicToSeed } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import { getRememberedWalletPassword, forgetWalletPassword } from "$lib/passwordCache";

  let { data } = $props();
  let account = $derived(data.account);
  let user = $derived(data.user);
  let rates = $derived(data.rates);
  let id = $derived(account.id);
  let seed = $derived(account.seed || (account.fingerprint && user.seed));
  let displayType = $derived(
    account.type === "ark"
      ? $t("accounts.ark")
      : seed
        ? $t("accounts.bitcoin")
        : $t("accounts.custodial"),
  );
  let name = $state(data.account.name || displayType);
  let currency = $state(data.account.currency || data.user.currency);
  let autowithdraw = $state(data.account.autowithdraw || false);
  let threshold = $state(data.account.threshold || data.user.threshold || 1000000);
  let reserve = $state(data.account.reserve ?? 0);
  let destination = $state(data.account.destination || data.user.destination || "");

  let rate = $derived(rates[currency]);
  let fiats = $derived(Object.keys(rates).sort((a, b) => a.localeCompare(b)));

  let mnemonic: string | undefined = $state(),
    password: string | undefined = $state();
  let passwordPrompt = $state();
  let cancel = $state(() => (passwordPrompt = false));
  let toggle = () => (passwordPrompt = !passwordPrompt);

  let editingReserve = $state(false),
    editingThreshold = $state(false),
    doneReserve = $state(),
    doneThreshold;
  let reserveEl: any = $state(),
    thresholdEl: any = $state();

  let doneEditing = () => {
    editingReserve = false;
    editingThreshold = false;
  };

  let editReserve = async () => {
    editingReserve = true;
    await tick();
    reserveEl?.focus();
  };

  let editThreshold = async () => {
    editingThreshold = true;
    await tick();
    thresholdEl?.focus();
  };

  let keypress = (e: any) => e.key === "Enter" && e.preventDefault();

  let isCustodial = $derived(!seed && account.type !== "ark");

  let revealWithCachedPassword = async () => {
    const cached = getRememberedWalletPassword();
    if (!cached) return false;
    try {
      const { decrypt } = await import("nostr-tools/nip49");
      let entropy = await decrypt(seed, cached);
      mnemonic = entropyToMnemonic(entropy, wordlist);
      password = cached;
      return true;
    } catch (e: any) {
      forgetWalletPassword();
      return false;
    }
  };

  let requestMnemonic = async () => {
    if (await revealWithCachedPassword()) return;
    toggle();
  };

  let submit = $state(async () => {
    passwordPrompt = false;
    try {
      const { decrypt } = await import("nostr-tools/nip49");
      let entropy = await decrypt(seed, password as string);
      mnemonic = entropyToMnemonic(entropy, wordlist);
    } catch (e: any) {
      fail("Invalid password, try again");
      passwordPrompt = true;
    }
  });

  let del = async () => {
    try {
      await post("/api/account/delete", { id });
      goto(`/${user.username}`);
    } catch (e: any) {
      fail(e.message);
    }
  };
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold flex items-center justify-center gap-2">
    {#if account.type === "ark"}
      <img src="/images/ark.png" class="w-8 h-8 rounded-full object-cover" alt="Ark" />
    {:else if seed}
      <iconify-icon noobserver icon="cryptocurrency-color:btc" width="32"></iconify-icon>
    {:else}
      <img src="/images/icon.png" class="w-8 h-8" alt="Coinos" />
    {/if}
    {displayType} {$t("payments.accountSettings").toLowerCase()}
  </h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <form class="space-y-5 pb-8" method="POST" use:enhance>

      <div class="space-y-1">
        <label for="name" class="font-bold block">{$t("accounts.name")}</label>
        <label
          class="input input-bordered border-primary input-lg flex items-center gap-2"
        >
          <input type="text" name="name" class="clean" bind:value={name} />
        </label>
      </div>

      <div>
        <label for="currency" class="font-bold block mb-1">{$t("user.settings.localCurrency")}</label>
        <select name="currency" bind:value={currency}>
          {#each fiats as fiat}
            <option value={fiat}>{fiat}</option>
          {/each}
        </select>
      </div>

      {#if isCustodial}
        <div>
          <div class="flex justify-between items-center">
            <span class="font-bold">{$t("user.settings.autoWithdraw")}</span>
            <Toggle id="autowithdraw" bind:value={autowithdraw} />
          </div>
          <p class="text-secondary mt-1 w-9/12">{$t("user.settings.autoWithdrawDescription")}</p>
        </div>

        <div class:hidden={!autowithdraw}>
          <div class="mb-2">
            <label for="destination" class="font-bold mb-1 block">{$t("user.settings.destination")}</label>
            <textarea
              name="destination"
              placeholder={$t("user.settings.destinationPlaceholder")}
              onkeypress={keypress}
              class="w-full p-4 border rounded-xl h-48"
              bind:value={destination}
            ></textarea>
          </div>

          <div>
            <label for="threshold" class="font-bold mb-1 block">{$t("user.settings.threshold")}</label>
            <button type="button" class="flex w-full" onclick={editThreshold}>
              <div class="p-4 border rounded-2xl rounded-r-none border-r-0 bg-base-200">
                <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"></iconify-icon>
              </div>
              <div class="border-l-0 rounded-l-none pl-2 w-full p-4 border rounded-2xl text-left">
                {threshold}
              </div>
              <input type="hidden" name="threshold" bind:value={threshold} />
            </button>
            <p class="text-secondary mt-1">{$t("user.settings.thresholdDesc")}</p>
          </div>

          <div>
            <label for="reserve" class="font-bold mb-1 block">{$t("user.settings.reserve")}</label>
            <button type="button" class="flex w-full" onclick={editReserve}>
              <div class="p-4 border rounded-2xl rounded-r-none border-r-0 bg-base-200">
                <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"></iconify-icon>
              </div>
              <div class="border-l-0 rounded-l-none pl-2 w-full p-4 border rounded-2xl text-left">
                {reserve}
              </div>
              <input type="hidden" name="reserve" bind:value={reserve} />
            </button>
            <p class="text-secondary mt-1">{$t("user.settings.reserveDesc")}</p>
          </div>
        </div>
      {/if}

      <div class="space-y-2">
        {#if mnemonic}
          <Mnemonic {mnemonic} />

          <button onclick={() => copy(mnemonic as string)} type="button" class="btn">
            <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
            <div class="my-auto">{$t("accounts.copy")}</div>
          </button>
        {:else if seed}
          <button onclick={requestMnemonic} type="button" class="btn">
            <iconify-icon noobserver icon="ph:eye-bold" width="32"></iconify-icon>
            <div class="my-auto">{$t("accounts.revealMnemonic")}</div>
          </button>
        {/if}

        {#if seed || account.type === "ark"}
          <button onclick={del} type="button" class="btn">
            <iconify-icon noobserver icon="ph:trash-bold" width="32"></iconify-icon>
            <div class="my-auto">{$t("accounts.deleteAccount")}</div>
          </button>
        {/if}
      </div>

      <button type="submit" class="btn btn-accent !w-full">
        <div class="my-auto">{$t("accounts.submit")}</div>
      </button>
    </form>
  </div>
</div>

{#if passwordPrompt}
  <WalletPass bind:password bind:cancel {submit} />
{/if}

{#if editingThreshold}
  <div class="fixed bg-base-100/90 inset-0 overflow-y-auto h-full w-full z-50 max-w-lg mx-auto">
    <div class="relative p-5 border shadow-lg rounded-md bg-base-100 space-y-5">
      <h1 class="text-center text-2xl font-semibold">{$t("user.settings.threshold")}</h1>
      <Numpad
        bind:amount={threshold}
        {currency}
        bind:rate
        bind:submit={doneReserve}
        bind:element={thresholdEl}
      />
      <button bind:this={doneReserve} type="button" onclick={doneEditing} class="btn">Ok</button>
    </div>
  </div>
{/if}

{#if editingReserve}
  <div class="fixed bg-base-100/90 inset-0 overflow-y-auto h-full w-full z-50 mx-auto max-w-lg">
    <div class="relative mx-auto p-5 border shadow-lg rounded-md bg-base-100 space-y-5 text-center">
      <h1 class="text-2xl font-semibold">{$t("user.settings.reserve")}</h1>
      <Numpad
        bind:amount={reserve}
        {currency}
        bind:rate
        bind:submit={doneReserve}
        bind:element={reserveEl}
      />
      <button bind:this={doneReserve} type="button" onclick={doneEditing} class="btn">Ok</button>
    </div>
  </div>
{/if}
