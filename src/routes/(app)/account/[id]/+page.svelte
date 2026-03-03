<script lang="ts">
  import CryptocurrencyColorBtc from "virtual:icons/cryptocurrency-color/btc";
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import PhEyeBold from "virtual:icons/ph/eye-bold";
  import PhTrashBold from "virtual:icons/ph/trash-bold";
  import PhWarningBold from "virtual:icons/ph/warning-bold";
  import { page } from "$app/stores";
  import Numpad from "$comp/Numpad.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import { goto } from "$app/navigation";
  import { fail, focus, loc, post } from "$lib/utils";
  import { importing } from "$lib/store";
  import { enhance } from "$app/forms";
  import { t } from "$lib/translations";
  import { tick } from "svelte";
  import { mnemonicToSeed, validateMnemonic, mnemonicToEntropy } from "@scure/bip39";
  import { wordlist } from "@scure/bip39/wordlists/english.js";
  import { HDKey } from "@scure/bip32";
  import { versions } from "$lib/utils";
  import { getCachedPrfKey } from "$lib/passwordCache";
  import { prfEncrypt } from "$lib/crypto";
  import Spinner from "$comp/Spinner.svelte";

  let { data } = $props();
  let account = $derived(data.account);
  let user = $derived(data.user);
  let rates = $derived(data.rates);
  let id = $derived(account.id);
  let seed = $derived(account.seed || account.fingerprint);
  let displayType = $derived(
    account.type === "ark"
      ? $t("accounts.ark")
      : seed
        ? $t("accounts.bitcoin")
        : $t("accounts.custodial"),
  );
  let name = $state((() => data.account.name || displayType)());
  let currency = $state((() => data.account.currency || data.user.currency)());
  let userCurrency = $derived(data.user.currency);
  let locale = $derived(loc(data.user));
  let currencyChanged = $derived(currency !== userCurrency);
  let updateUserCurrency = $state(false);

  $effect(() => {
    updateUserCurrency = currencyChanged;
  });

  let autowithdraw = $state((() => data.account.autowithdraw || false)());
  let threshold = $state((() => data.account.threshold || data.user.threshold || 1000000)());
  let reserve = $state((() => data.account.reserve ?? 0)());
  let destination = $state((() => data.account.destination || data.user.destination || "")());

  let rate = $derived(rates[currency]);
  let fiats = $derived(Object.keys(rates).sort((a, b) => a.localeCompare(b)));

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

  let showImport = $state(false);
  let importText = $state("");
  let importSubmitting = $state(false);

  let importSeed = async () => {
    let text = importText.replace(/,/g, " ").trim();
    if (!validateMnemonic(text, wordlist)) {
      fail($t("accounts.invalidSeedPhrase"));
      return;
    }

    importSubmitting = true;
    try {
      const { getWalletEntropy } = await import("$lib/walletEntropy");
      let prfKey = getCachedPrfKey() || await getWalletEntropy();
      if (!prfKey) {
        fail($t("accounts.failedToDecryptSeed"));
        importSubmitting = false;
        return;
      }

      let entropy = mnemonicToEntropy(text, wordlist);
      let seed = await prfEncrypt(prfKey, entropy);

      let s = await mnemonicToSeed(text);
      let master = HDKey.fromMasterSeed(s, versions);
      let child = master.derive(`m/84'/0'/${account.accountIndex ?? 0}'`);
      let pubkey = child.publicExtendedKey;
      let fp = child.fingerprint.toString(16).padStart(8, "0");

      await post(`/post/account/${id}`, {
        fingerprint: fp,
        pubkey,
        seed,
      });

      $importing = new Set([...$importing, id]);
      showImport = false;
      importText = "";
      goto(`/${user.username}`, { invalidateAll: true });
    } catch (e: any) {
      fail(e.message || $t("accounts.importFailed"));
    }
    importSubmitting = false;
  };

  let showDeleteConfirm = $state(false);

  let del = async () => {
    try {
      await post("/post/account/delete", { id });
      goto(`/${user.username}`);
    } catch (e: any) {
      fail(e.message);
    }
  };
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold flex items-center justify-center gap-2">
    {#if account.type === "ark"}
      <img src="/images/ark.png" class="w-8 h-8 rounded-full object-cover bg-neutral" alt="Ark" />
    {:else if seed}
      <CryptocurrencyColorBtc width="32" />
    {:else}
      <img src="/images/icon.png" class="w-8 h-8" alt="Coinos" />
    {/if}
    {$t("accounts.accountTitle", { type: displayType } as any)}
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

      {#if currencyChanged}
        <div class="flex justify-between items-center">
          <span>{$t("accounts.updateCurrency", { currency } as any)}</span>
          <Toggle id="updateUserCurrency" bind:value={updateUserCurrency} />
        </div>
      {/if}

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
                <PhLightningFill class="text-yellow-300" />
              </div>
              <div class="border-l-0 rounded-l-none pl-2 w-full p-4 border rounded-2xl text-left">
                {threshold}
              </div>
              <input type="hidden" name="threshold" bind:value={threshold} />
            </button>
            <p class="text-secondary mt-1">{$t("user.settings.thresholdDesc")}</p>
          </div>
        </div>
      {/if}

      <button type="submit" class="btn btn-accent !w-full">
        <div class="my-auto">{$t("accounts.submit")}</div>
      </button>

      <div class="space-y-2">
        {#if seed || account.type === "ark"}
          <button onclick={() => goto(`/account/${id}/seed`)} type="button" class="btn">
            <PhEyeBold width="32" />
            <div class="my-auto">{$t("accounts.viewMnemonic")}</div>
          </button>
        {/if}

        {#if account.type === "bitcoin"}
          {#if showImport}
            <div class="space-y-2">
              <textarea
                placeholder={$t("accounts.enterSeed")}
                class="w-full p-4 border rounded-xl h-36 text-lg"
                bind:value={importText}
                autocapitalize="none"
              ></textarea>
              <div class="flex gap-2">
                <button type="button" class="btn !w-auto grow" onclick={() => (showImport = false)}>
                  {$t("accounts.back")}
                </button>
                <button type="button" class="btn btn-accent !w-auto grow" onclick={importSeed} disabled={importSubmitting}>
                  {#if importSubmitting}
                    <Spinner />
                  {:else}
                    {$t("accounts.import")}
                  {/if}
                </button>
              </div>
            </div>
          {/if}
        {/if}

        {#if seed || account.type === "ark"}
          <button onclick={() => (showDeleteConfirm = true)} type="button" class="btn">
            <PhTrashBold width="32" class="text-error" />
            <div class="my-auto">{$t("accounts.deleteAccount")}</div>
          </button>
        {/if}

      </div>

    </form>
  </div>
</div>

{#if editingThreshold}
  <div class="fixed bg-base-100/90 inset-0 overflow-y-auto h-full w-full z-50 max-w-lg mx-auto">
    <div class="relative p-5 border shadow-lg rounded-md bg-base-100 space-y-5">
      <h1 class="text-center text-2xl font-semibold">{$t("user.settings.threshold")}</h1>
      <Numpad
        bind:amount={threshold}
        {currency}
        {locale}
        bind:rate
        bind:submit={doneReserve}
        bind:element={thresholdEl}
      />
      <button bind:this={doneReserve} type="button" onclick={doneEditing} class="btn">{$t("payments.ok")}</button>
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
        {locale}
        bind:rate
        bind:submit={doneReserve}
        bind:element={reserveEl}
      />
      <button bind:this={doneReserve} type="button" onclick={doneEditing} class="btn">{$t("payments.ok")}</button>
    </div>
  </div>
{/if}

{#if showDeleteConfirm}
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    role="button"
    tabindex="0"
    onclick={() => (showDeleteConfirm = false)}
    onkeydown={(e) => e.key === "Escape" && (showDeleteConfirm = false)}
  >
    <div class="bg-base-100 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center" role="none" onclick={(e) => e.stopPropagation()}>
      <PhWarningBold width="48" class="text-error" />
      <h2 class="text-xl font-semibold">{$t("accounts.deleteAccount")}</h2>
      <p class="text-secondary">{$t("accounts.deleteConfirm")}</p>
      <div class="flex gap-2">
        <button type="button" class="btn !w-auto grow" onclick={() => (showDeleteConfirm = false)}>
          {$t("accounts.cancel")}
        </button>
        <button type="button" class="btn btn-error !w-auto grow" onclick={del}>
          {$t("accounts.delete")}
        </button>
      </div>
    </div>
  </div>
{/if}
