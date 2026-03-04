<script lang="ts">
  import PhShareNetworkBold from "virtual:icons/ph/share-network-bold";
  import Numpad from "$comp/Numpad.svelte";
  import Toggle from "$comp/Toggle.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { loc, sats } from "$lib/utils";
  import { t } from "$lib/translations";

  let { data }: any = $props();

  let { id } = $page.params;
  let amount = $state(0);
  let rate = $derived(data.rate);
  let user = $derived(data.user);
  let currency = $derived(user ? user.currency : "CAD");
  let locale = $derived(loc(user));
  let fiat = $state(false);
  let linkInFiat = $state(false);
  let amountFiat = $state(0);
  let element: HTMLElement | undefined = $state();
  let submit: HTMLButtonElement | undefined = $state();

  function share() {
    let sweepUrl: string;
    if (linkInFiat) {
      sweepUrl = `${$page.url.origin}/fund/${id}/sweep/${amountFiat}/${currency}`;
    } else {
      sweepUrl = `${$page.url.origin}/fund/${id}/sweep/${amount}`;
    }
    goto(`/qr/${encodeURIComponent(sweepUrl)}`);
  }

  function shareAll() {
    goto(`/qr/${encodeURIComponent(`${$page.url.origin}/fund/${id}/sweep`)}`);
  }
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 pb-10 mt-10">
  <h1 class="text-center text-2xl font-semibold">{$t("payments.shareLink")}</h1>

  <Numpad bind:amount bind:fiat {currency} {rate} {locale} bind:element bind:amountFiat {submit} />

  <div class="flex items-center justify-between">
    <span class="text-lg">{$t("payments.denominateIn")} {currency}</span>
    <Toggle id="linkInFiat" bind:value={linkInFiat} />
  </div>

  <button class="btn" bind:this={submit} onclick={share}>
    <PhShareNetworkBold width="32" />
    {$t("payments.shareSetAmount")}
  </button>

  <div class="flex items-center gap-4">
    <hr class="grow border-white/20" />
    <span class="text-secondary shrink-0">or</span>
    <hr class="grow border-white/20" />
  </div>

  <button class="btn btn-accent" onclick={shareAll}>
    <PhShareNetworkBold width="32" />
    {$t("payments.shareEntireBalance")}
  </button>
</div>
