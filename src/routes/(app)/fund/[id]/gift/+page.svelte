<script>
  import Amount from "$comp/Amount.svelte";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { loc, copy } from "$lib/utils";

  let { data } = $props();
  let { id, user, amount, rate } = $derived(data);
  let text = $page.url.href.replace("gift", "sweep");
  let currency = user ? user.currency : "CAD";
  let locale = loc(user);
</script>

<div class="container px-4 max-w-4xl mx-auto space-y-5 pb-10">
  <h1 class="text-center text-2xl font-semibold">{$t("payments.gift")}</h1>

  <Amount {amount} {currency} {rate} {locale} />

  <div class="text-secondary shadow-lg p-8 mx-auto text-center space-y-2">
    <p>{$t("payments.giftDesc1")}</p>
    <p>{$t("payments.giftDesc2")}</p>
  </div>

  <div class="flex gap-1 min-w-0 items-center">
    <button
      type="button"
      class="btn break-all !h-auto flex-nowrap p-4 font-normal shrink !w-auto max-w-full"
      onclick={() => copy(text)}
    >
      <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
      <div class="my-auto break-all min-w-0 !w-auto max-w-full">{text}</div>
    </button>

    <a href={`/qr/${encodeURIComponent(text)}`} class="btn !w-auto">
      <iconify-icon icon="ph:qr-code-bold" width={32}></iconify-icon>
    </a>
  </div>
</div>
