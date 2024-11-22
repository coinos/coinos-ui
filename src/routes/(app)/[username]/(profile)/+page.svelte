<script>
  import { scale } from "svelte/transition";
  import { btc, f, sat } from "$lib/utils";
  import Icon from "$comp/Icon.svelte";
  import Account from "$comp/Account.svelte";
  import Balance from "$comp/Balance.svelte";
  import Items from "$comp/Items.svelte";
  import { t } from "$lib/translations";
  import { installPrompt } from "$lib/store";
  import { afterNavigate, preloadData } from "$app/navigation";

  let { data } = $props();

  afterNavigate(() => {
    preloadData(`/${user.username}/receive`);
    preloadData("/send");
  });

  let { accounts, subject, user, items, rates } = $state(data);
  let { currency } = $derived(subject);
  let rate = $derived(rates[currency]);
  let total = $derived(items.reduce((a, b) => a + b.price * b.quantity, 0));

  let install = async () => {
    if (!$installPrompt) return;
    await $installPrompt.prompt();
    $installPrompt = null;
  };

  if (user) user.savings = 0;
</script>

<div class="space-y-2">
  {#if user?.id === subject.id}
    <div class="space-y-5" data-sveltekit-preload-data="false">
      {#each accounts as account, i}
        <Account {user} {rate} {account} last={i === accounts.length - 1} />
      {/each}
    </div>

    <a href={`/account/savings`} class="contents">
      <button class="btn btn-lg w-full rounded-2xl whitespace-nowrap">
        <iconify-icon icon="ph:plus-circle-bold" width="32"></iconify-icon>
        {$t("accounts.addAccount")}
      </button>
    </a>

    {#if $installPrompt}
      <button class="btn btn-accent lg:hidden" onclick={install}>
        <iconify-icon icon="ph:floppy-disk-bold" width="32"></iconify-icon>
        {$t("user.install")}
      </button>
    {/if}
  {/if}

  <Items {items} {subject} {user} {total} {currency} {rate} />

  <div
    class="fixed inset-x-0 mx-auto flex bottom-16 px-4"
    class:static={!items.length}
  >
    {#if total > 0}
      <button
        class="rounded-2xl py-5 px-6 font-bold hover:bg-neutral-700 flex bg-black text-white mx-auto"
        onclick={checkout}
      >
        <div class="mx-auto flex">
          <div class="my-auto text-2xl">
            {$t("user.dashboard.checkout")}
            {f(total, currency)}
            <span class="text-base">
              {sat(btc(total, rate), currency)}
            </span>
          </div>
        </div>
      </button>
    {:else if user?.username !== subject.username && (!subject.anon || subject.lud16)}
      <a
        href={subject.anon
          ? `/send/${encodeURIComponent(subject.lud16)}`
          : `/pay/${subject.username}`}
        class="contents"
      >
        <button class="btn btn-accent !text-2xl items-center !w-full sm:!max-w-[400px] mx-auto">
          <iconify-icon icon="ph:lightning-fill" class="text-yellow-300"
          ></iconify-icon>
          <div>
            {$t("user.pay")}
            {subject.username}
          </div>
        </button>
      </a>
    {/if}
  </div>
</div>

<style>
  .custom-shadow-item {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    visibility: visible;
    background: #333;
    opacity: 0.5;
    margin: 0;
  }

  .bottom-half {
    @apply bottom-1/2;
  }
</style>
