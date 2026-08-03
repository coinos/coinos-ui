<script>
  // Migrate a legacy coinos account to coinos v3.
  //
  // v3 sends the user here with ?to=<their new payment address>&back=<url>.
  // They're already signed in here, so no password or key has to travel:
  // the form action (server side, with their session cookie) sweeps the
  // balance over Lightning and then releases the username, which is what
  // lets v3's registrar hand it to them.
  import { enhance } from "$app/forms";

  let { data, form } = $props();
  let { user, to, back } = $derived(data);

  let working = $state(false);
  let balance = $derived(user?.balance || 0);
  let backUrl = $derived.by(() => {
    try {
      const u = new URL(back || "https://v3.coinos.io/");
      u.searchParams.set("migrated", user.username);
      return u.toString();
    } catch {
      return "https://v3.coinos.io/";
    }
  });
</script>

<div class="max-w-md mx-auto p-4 space-y-5">
  <h1 class="text-2xl font-bold">Move your account to coinos v3</h1>

  {#if !to}
    <p class="text-red-600">This page needs a destination — start the move from coinos v3.</p>
  {:else if form?.ok}
    <div class="space-y-3">
      <p class="text-xl">✓ All done!</p>
      {#if form.sent}
        <p>{form.sent.toLocaleString()} sats are on their way to your new wallet.</p>
      {/if}
      <p>
        <strong>{form.released}@coinos.io</strong> now receives into your coinos v3 wallet.
      </p>
      <a class="btn btn-primary w-full" href={backUrl}>Back to coinos v3</a>
    </div>
  {:else}
    <p>
      This sends your balance to your new wallet and points
      <strong>{user.username}@coinos.io</strong> at it, so payments to your address arrive
      there from now on. This account stays exactly as it is — same name, same history —
      you just receive on coinos v3.
    </p>

    <div class="rounded-xl border p-3">
      <div class="flex justify-between"><span>Balance</span><strong>{balance.toLocaleString()} sats</strong></div>
    </div>

    {#if form?.error}<p class="text-red-600">{form.error}</p>{/if}

    <form
      method="POST"
      use:enhance={() => {
        working = true;
        return async ({ update }) => {
          await update({ reset: false });
          working = false;
        };
      }}
      class="space-y-3"
    >
      <input type="hidden" name="to" value={to} />
      <input type="hidden" name="balance" value={balance} />
      <input type="hidden" name="username" value={user.username} />
      {#if user?.haspin}
        <input class="input input-bordered w-full" type="password" inputmode="numeric"
          name="pin" placeholder="Your PIN" />
      {/if}
      <button class="btn btn-primary w-full" disabled={working}>
        {#if working}Migrating…{:else}Migrate{/if}
      </button>
    </form>

    <p class="text-sm opacity-60">You can also do nothing — your old account keeps working as it is.</p>
  {/if}
</div>
