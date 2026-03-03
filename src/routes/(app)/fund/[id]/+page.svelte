<script lang="ts">
  import PhGearBold from "virtual:icons/ph/gear-bold";
  import PhPlusBold from "virtual:icons/ph/plus-bold";
  import PhHandCoinsBold from "virtual:icons/ph/hand-coins-bold";
  import PhLinkBold from "virtual:icons/ph/link-bold";
  import PhGiftBold from "virtual:icons/ph/gift-bold";
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import Amount from "$comp/Amount.svelte";
  import Payments from "$comp/Payments.svelte";
  import { format } from "date-fns";
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import Avatar from "$comp/Avatar.svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { t } from "$lib/translations";
  import { types, copy, f, s, sat, sats, loc } from "$lib/utils";
  import { loginRedirect } from "$lib/store";
  import { bech32 } from "@scure/base";
  const encoder = new TextEncoder();

  let { data }: any = $props();

  let amount = $derived(data.amount);
  let payments = $derived(data.payments);
  let managers = $derived(data.managers);
  let rate = $derived(data.rate);
  let user = $derived(data.user);
  let { id } = $page.params;
  let locale = $derived(loc(user));

  let currency = $derived(user ? user.currency : "CAD");

  let amountFiat = $derived(parseFloat(((amount * rate) / sats).toFixed(2)));
  $effect(() => {
    $loginRedirect = $page.url.pathname;
  });

  let show = $state();
  let toggle = () => (show = !show);
  let href = $derived(encodeURIComponent($page.url.href));
  // let withdrawUrl = encoder.encode(
  //   `${$page.url.origin}/api/fund/${id}/withdraw`,
  // );
  // let lnurlw = bech32.encode("lnurl", bech32.toWords(withdrawUrl), 20000);
</script>

<div class="container px-4 max-w-4xl mx-auto mt-10 space-y-5">
  <div class="flex justify-center items-center">
    <div class="md:shadow-xl rounded-3xl md:px-10 pt-5 pb-10 space-y-5 w-full md:mx-5">
      {#if show}
        <div class="max-w-[360px] mx-auto">
          <img src={`/qr/${href}/raw`} class="z-10 border-4 border-white w-" alt="URL" />
        </div>
      {/if}
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

        {#if (user && !managers.length) || managers.some((m) => m.id === user?.id)}
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
        {#if !managers.length || managers.some((m) => m.id === user?.id)}
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
        <a href={`/qr/${href}`} class="btn !w-auto grow">
          <PhLinkBold width="32" />
          <div class="my-auto">{$t("payments.shareLink")}</div>
        </a>
        <a href={`${$page.url.pathname}/gift`} class="btn !w-auto grow">
          <PhGiftBold width="32" />
          <div class="my-auto">{$t("payments.giftLink")}</div>
        </a>
        <!-- <a href={`/qr/${lnurlw}`} class="btn !w-auto grow"> -->
        <!--   <PhLightningFill width="24" class="text-yellow-300" /> -->
        <!--   {$t("payments.lnurlw")} -->
        <!-- </a> -->
      </div>
      <Payments {payments} fund={true} {locale} {user} />
    </div>
  </div>
</div>
