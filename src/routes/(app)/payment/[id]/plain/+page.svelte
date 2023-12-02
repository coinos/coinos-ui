<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import {
    back,
    copy,
    f,
    s,
    fiat,
    post,
    sats,
    success,
    types,
  } from "$lib/utils";
  import { Avatar, Icon } from "$comp";
  import { format } from "date-fns";
  import { PUBLIC_EXPLORER as expl } from "$env/static/public";

  export let data;
  let { user, payment: p } = data;

  let { username } = user;
  let { id, amount, created, rate, type, ref, tip, ourfee, fee, currency } = p;
  let a = Math.abs(amount);

  onMount(() => {
    if (browser) {
      let main = document.querySelector("main");
      main.style.paddingBottom = "0";
      window.onfocus = () => goto(`/payment/${id}`);
      window.print();
    }
  });

  fee = fee || 0;
</script>

<div class="space-y-5">
  <div>
    <span class="text-lg text-secondary">Amount</span>
    <div>
      {f(fiat(a, rate), currency)}
    </div>
  </div>

  {#if tip}
    <div>
      <span class="text-lg text-secondary">Tip</span>
      <div>
        {f(fiat(tip, rate), currency)}
        ({Math.round((tip * 100) / Math.abs(a))}%)
      </div>
    </div>

    <div>
      <span class="text-lg text-secondary">Total</span>
      <div>
        {f(fiat(a + (tip || 0), rate), currency)}
      </div>
    </div>
  {/if}

  <div>
    <span class="text-lg text-secondary">Date</span>
    <div>
      {format(new Date(created), "MMMM d")},
      {format(new Date(created), "h:mm aaa")}
    </div>
  </div>

  {#if type === "bitcoin"}
    <div>
      <span class="text-lg text-secondary">Txid</span>
      <div class="flex">
        <div>
          {id}
        </div>
      </div>
    </div>
  {/if}
</div>

<a href={`/payment/${id}`}>
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50" />
</a>
