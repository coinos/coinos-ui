<script>
  import { scale } from "svelte/transition";
  import { btc, f, sat } from "$lib/utils";
  import Account from "$comp/Account.svelte";
  import Balance from "$comp/Balance.svelte";
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
</div>
