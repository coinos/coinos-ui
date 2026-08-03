<script>
  // Migrate a legacy coinos account to coinos v3.
  //
  // v3 sends the user here with ?to=<their new payment address>&back=<url>.
  // They are already signed in on this site, so nothing has to handle their
  // password: we sweep the balance over Lightning to the new wallet and then
  // release the username, which lets v3 claim it on the new registrar.
  import { post, success } from "$lib/utils";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let { user, to, back } = $derived(data);

  let step = $state("intro"); // intro | working | done | error
  let note = $state("");
  let error = $state("");
  let pin = $state("");
  let sent = $state(0);

  let balance = $derived(user?.balance || 0);
  // Lightning routing takes a cut on the way out; leave a little behind so
  // the sweep can't fail for being a few sats over.
  let reserve = $derived(Math.max(10, Math.ceil(balance * 0.005)));
  let amount = $derived(Math.max(0, balance - reserve));
  let newName = $derived(`${user?.username}_v2`);

  // Ask the v3 registrar for an invoice for this amount (LNURL-pay against
  // the destination address). The registrar is CORS-open.
  async function invoiceFor(address, sats) {
    const [name, domain] = String(address).split("@");
    if (!name || !domain) throw new Error("bad destination address");
    const base = "https://names.coinos.io";
    const p = await fetch(`${base}/.well-known/lnurlp/${name}?domain=${domain}`).then((r) => r.json());
    if (!p?.callback) throw new Error(p?.reason || "destination not found");
    const msat = sats * 1000;
    if (msat < p.minSendable || msat > p.maxSendable) throw new Error("amount out of range for the destination");
    const inv = await fetch(`${p.callback}${p.callback.includes("?") ? "&" : "?"}amount=${msat}`).then((r) => r.json());
    if (!inv?.pr) throw new Error(inv?.reason || "could not get an invoice");
    return inv.pr;
  }

  async function migrate() {
    error = "";
    step = "working";
    try {
      if (amount > 0) {
        note = "Getting an invoice from your new wallet…";
        const payreq = await invoiceFor(to, amount);
        note = `Sending ${amount.toLocaleString()} sats…`;
        await post("/payments", { payreq, ...(pin ? { pin } : {}) });
        sent = amount;
      }
      note = "Releasing your username…";
      await post("/user", { username: newName, ...(pin ? { pin } : {}) });
      step = "done";
      success("Migrated");
    } catch (e) {
      error = e && typeof e === "object" && "message" in e ? String(e.message) : String(e);
      step = "error";
    }
  }

  function goBack() {
    const url = new URL(back || "https://v3.coinos.io/");
    url.searchParams.set("migrated", user.username);
    goto(url.toString(), { replaceState: true });
  }
</script>

<div class="max-w-md mx-auto p-4 space-y-5">
  <h1 class="text-2xl font-bold">Move your account to coinos v3</h1>

  {#if !to}
    <p class="text-red-600">
      This page needs a destination. Start the migration from coinos v3.
    </p>
  {:else if step === "done"}
    <div class="space-y-3">
      <p class="text-xl">✓ All done!</p>
      {#if sent}
        <p>{sent.toLocaleString()} sats are on their way to your new wallet.</p>
      {/if}
      <p>
        Your old username was released, so <strong>{user.username}</strong> can now be
        yours on coinos v3.
      </p>
      <button class="btn btn-primary w-full" onclick={goBack}>Back to coinos v3</button>
    </div>
  {:else if step === "working"}
    <p>{note}</p>
    <progress class="progress w-full"></progress>
  {:else}
    <div class="space-y-3">
      <p>
        This moves your balance to your new wallet and frees up your username so you can
        keep it there. Your old account stays, renamed to
        <strong>{newName}</strong>, and stops receiving payments.
      </p>
      <div class="rounded-xl border p-3 space-y-1">
        <div class="flex justify-between"><span>Balance</span><strong>{balance.toLocaleString()} sats</strong></div>
        <div class="flex justify-between"><span>Sending</span><strong>{amount.toLocaleString()} sats</strong></div>
        <div class="flex justify-between text-sm opacity-60"><span>Left for routing</span><span>{reserve.toLocaleString()} sats</span></div>
        <div class="flex justify-between break-all gap-2"><span>To</span><span>{to}</span></div>
      </div>
      {#if user?.haspin}
        <input class="input input-bordered w-full" type="password" inputmode="numeric"
          placeholder="Your PIN" bind:value={pin} />
      {/if}
      {#if error}<p class="text-red-600">{error}</p>{/if}
      <button class="btn btn-primary w-full" onclick={migrate} disabled={!to}>
        Move {amount.toLocaleString()} sats and release {user.username}
      </button>
      <p class="text-sm opacity-60">
        You can also do nothing — your old account keeps working as it is.
      </p>
    </div>
  {/if}
</div>
