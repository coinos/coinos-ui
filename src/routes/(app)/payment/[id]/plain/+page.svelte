<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import { back, copy, f, s, toFiat, post, sats, success, types } from "$lib/utils";
  import { fiat } from "$lib/store";
  import Avatar from "$comp/Avatar.svelte";
  import { format } from "date-fns";
  import { PUBLIC_EXPLORER as expl } from "$env/static/public";

  let { data } = $props();
  let user = $derived(data.user);
  let p = $derived(data.payment);

  let username = $derived(user.username);
  let id = $derived(p.id);
  let amount = $derived(p.amount);
  let created = $derived(p.created);
  let rate = $derived(p.rate);
  let type = $derived(p.type);
  let ref = $derived(p.ref);
  let tip = $derived(p.tip);
  let ourfee = $derived(p.ourfee);
  let fee = $derived(p.fee || 0);
  let currency = $derived(p.currency);
  let a = $derived(Math.abs(amount));

  onMount(() => {
    if (browser) {
      let main = document.querySelector("main");
      if (main) main.style.paddingBottom = "0";
      window.onfocus = () => goto(`/payment/${id}`);
      window.print();
    }
  });
</script>

<div class="space-y-5">
  <div>
    <span class="text-lg text-secondary">Amount</span>
    <div>
      {#if $fiat}
        {f(toFiat(a, rate), currency)}
      {:else}
        {s(a)}
      {/if}
    </div>
  </div>

  {#if tip}
    <div>
      <span class="text-lg text-secondary">Tip</span>
      <div>
        {#if $fiat}
          {f(toFiat(tip, rate), currency)}
        {:else}
          {s(tip)}
        {/if}
        ({Math.round((tip * 100) / Math.abs(a))}%)
      </div>
    </div>

    <div>
      <span class="text-lg text-secondary">Total</span>
      <div>
        {#if $fiat}
          {f(toFiat(a + (tip || 0), rate), currency)}
        {:else}
          {s(a + (tip || 0))}
        {/if}
      </div>
    </div>
  {/if}

  <div>
    <span class="text-lg text-secondary">Date</span>
    <div>{format(new Date(created), "MMMM d")}, {format(new Date(created), "h:mm aaa")}</div>
  </div>

  {#if type === "bitcoin"}
    <div>
      <span class="text-lg text-secondary">Txid</span>
      <div class="flex">
        <div>{id}</div>
      </div>
    </div>
  {/if}
</div>

<a href={`/payment/${id}`} aria-label="View payment details">
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50"></div>
</a>
