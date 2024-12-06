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

  let { accounts, subject, rate, user } = $state(data);

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

<div class="fixed inset-x-0 mx-auto flex bottom-16 px-4">
  {#if user?.username !== subject.username && (!subject.anon || subject.lud16)}
    <a
      href={subject.anon
        ? `/send/${encodeURIComponent(subject.lud16)}`
        : `/pay/${subject.username}`}
      class="contents"
    >
      <button
        class="btn btn-accent !text-2xl items-center !w-full sm:!max-w-[400px] mx-auto"
      >
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
