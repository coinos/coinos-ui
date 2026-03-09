<script lang="ts">
  import PhGearBold from "virtual:icons/ph/gear-bold";
  import PhPlusBold from "virtual:icons/ph/plus-bold";
  import PhHandCoinsBold from "virtual:icons/ph/hand-coins-bold";
  import PhShareNetworkBold from "virtual:icons/ph/share-network-bold";
  import PhTrashBold from "virtual:icons/ph/trash-bold";
  import PhCopyBold from "virtual:icons/ph/copy-bold";
  import PhWifiBold from "virtual:icons/ph/wifi-high-bold";
  import Amount from "$comp/Amount.svelte";
  import Payments from "$comp/Payments.svelte";
  import { invalidate } from "$app/navigation";
  import { page } from "$app/stores";
  import Avatar from "$comp/Avatar.svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { t } from "$lib/translations";
  import { copy, sats, loc, post } from "$lib/utils";
  import { loginRedirect } from "$lib/store";
  import { registerPlugin } from "@capacitor/core";

  const Hce = (window as any).Capacitor ? registerPlugin("Hce") : null;

  let { data }: any = $props();

  let amount = $derived(data.amount);
  let payments = $derived(data.payments);
  let managers = $derived(data.managers);
  let authorizations = $derived(data.authorizations || []);
  let rate = $derived(data.rate);
  let user = $derived(data.user);
  let { id } = $page.params;
  let locale = $derived(loc(user));

  let currency = $derived(user ? user.currency : "CAD");
  let isManager = $derived(!managers.length || managers.some((m) => m.id === user?.id));

  let amountFiat = $derived(parseFloat(((amount * rate) / sats).toFixed(2)));

  let hceActive = $state(false);

  $effect(() => {
    $loginRedirect = $page.url.pathname;
  });

  function enableHce() {
    if (!Hce) return;
    const url = `${$page.url.origin}/api/lnurlw/${id}`;
    Hce.setUrl({ url });
    hceActive = true;
    toast.push("NFC armed — ready to tap");
  }

  function disableHce() {
    if (!Hce) return;
    Hce.setUrl({ url: "https://coinos.io" });
    hceActive = false;
  }

  async function deleteAuth(authId: string) {
    try {
      await post(`/fund/${id}/authorization/${authId}/delete`, {});
      invalidate("app:payments");
    } catch (e: any) {
      toast.push(e.message);
    }
  }
</script>

<div class="container px-4 max-w-4xl mx-auto mt-10 space-y-5">
  <div class="flex justify-center items-center">
    <div class="md:shadow-xl rounded-3xl md:px-10 pt-5 pb-10 space-y-5 w-full md:mx-5">
      <div class="flex justify-center gap-4">
        <Amount {amount} {currency} {rate} {locale} />
      </div>
      <div class="flex flex-wrap space-y-2 items-center">
        <div class="grow text-center">
          <div class="font-bold text-xl">
            <div>{$t("funds.withdrawAccess")}</div>
          </div>
          {#if managers.length}
            <div class="flex justify-center">
              {#each managers as c, i}
                <div class:-ml-3={i > 0}>
                  <a href={`/pay/${c.username}`} class="contents">
                    <Avatar user={c} size={12} />
                  </a>
                </div>
              {/each}
            </div>
          {:else}
            <div>{$t("funds.anyone")}</div>
          {/if}
        </div>

        {#if user && isManager}
          <a href={`/fund/${id}/access`} class="btn !w-auto ml-auto text-secondary grow">
            <PhGearBold width={32} />
            {$t("funds.manage")}
          </a>
        {/if}
      </div>
      <div class="flex flex-wrap gap-2" data-sveltekit-prefetch="off">
        <div class="grow">
          <a href={`/send/fund/${id}`}>
            <button class="btn">
              <PhPlusBold width="32" />
              {$t("payments.addFunds")}
            </button>
          </a>
        </div>
        {#if isManager}
          <div class="grow">
            <a href={`/fund/${id}/withdraw`}>
              <button class="btn">
                <PhHandCoinsBold width="32" style="transform: scaleX(-1)" />
                {$t("payments.takeFunds")}
              </button>
            </a>
          </div>
        {/if}
      </div>
      <div class="flex gap-2" data-sveltekit-prefetch="off">
        <a href={`/fund/${id}/share`} class="btn grow">
          <PhShareNetworkBold width="32" />
          <div class="my-auto">{$t("payments.shareLink")}</div>
        </a>
      </div>
      {#if Hce && amount > 0}
        <div class="flex gap-2">
          <button
            class="btn grow"
            class:!bg-green-600={hceActive}
            class:!text-white={hceActive}
            onclick={() => hceActive ? disableHce() : enableHce()}
          >
            <PhWifiBold width="32" />
            <div class="my-auto">{hceActive ? "NFC Active — Ready to Tap" : "Enable NFC Tap to Pay"}</div>
          </button>
        </div>
      {/if}
      {#if isManager && authorizations.length}
        <div class="space-y-2">
          <div class="font-bold text-lg">{$t("funds.authorizations")}</div>
          {#each authorizations as auth}
            <div class="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
              <div>
                <span class="font-semibold">{auth.fiat} {auth.currency}</span>
                <span class="text-sm opacity-60 ml-2">{new Date(auth.created).toLocaleDateString(locale)}</span>
              </div>
              <div class="flex gap-2">
                <button onclick={() => { copy(`${$page.url.origin}/fund/${id}/sweep/auth/${auth.authId}`); }} class="opacity-60 hover:opacity-100">
                  <PhCopyBold width={20} />
                </button>
                <button onclick={() => deleteAuth(auth.authId)} class="text-red-500 hover:text-red-400">
                  <PhTrashBold width={20} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      <Payments {payments} fund={true} {locale} {user} />
    </div>
  </div>
</div>
