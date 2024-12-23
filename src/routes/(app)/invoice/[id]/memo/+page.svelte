<script>
  import { run } from "svelte/legacy";

  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { invoice as inv, request } from "$lib/store";
  import { copy, select, f, sat, get, s, sats } from "$lib/utils";
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";

  let submitting;
  let submit = $state();

  let { data } = $props();
  let { invoice, id, user } = $derived(data);
  let {
    amount,
    hash,
    items,
    memoPrompt,
    type,
    rate,
    received,
    prompt,
    text,
    tip,
    user: { username, currency },
  } = $derived(invoice);
</script>

<form
  method="POST"
  use:enhance
  class:invisible={submitting}
  class="container px-4 max-w-lg mx-auto space-y-5"
>
  <input type="hidden" name="amount" value={amount} />
  <input type="hidden" name="tip" value={tip} />
  <input type="hidden" name="username" value={username} />
  <input type="hidden" name="rate" value={invoice.rate} />
  <input type="hidden" name="memoPrompt" value={invoice.memoPrompt} />
  <input type="hidden" name="prompt" value={invoice.prompt} />
  <input type="hidden" name="type" value={type} />
  <input type="hidden" name="hash" value={hash} />
  <input type="hidden" name="items" value={JSON.stringify(items)} />

  <h1 class="text-4xl font-semibold text-center">{$t("invoice.addMemo")}</h1>
  <div class="space-y-2">
    <input
      use:select
      name="memo"
      class="w-full p-4 border rounded-xl text-xl"
      bind:value={invoice.memo}
      autocapitalize="none"
    />
    <div class="text-secondary">{invoice.memoPrompt}</div>
  </div>

  <button
    type="submit"
    bind:this={submit}
    class="bg-black text-white border rounded-2xl px-6 py-5 w-full font-bold"
  >
    {$t("payments.next")}
  </button>
</form>
