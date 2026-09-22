<script>
  import { run } from "svelte/legacy";

  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { pin } from "$lib/store";
  import { s } from "$lib/utils";

  let { data, form, send = $bindable(), comment = $bindable() } = $props();
  let { currency } = data.user;
  let { minSendable, maxSendable, commentAllowed, callback, metadata, rate, balance } =
    data;
  let max = $derived(Math.min(balance || 0, Math.floor(maxSendable / 1000)));

  let amount = $state(Math.round(minSendable / 1000)),
    loading = $state();
  let submit = () => (loading = true);
  // An action result (an error, since success redirects) ends the wait
  $effect(() => form && (loading = false));
</script>

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-2">
  <div class="text-center mb-8">
    {#each JSON.parse(metadata) as m}
      <div>
        {#if m[0] === "text/plain"}
          <h1 class="text-3xl md:text-4xl font-semibold mb-2">{m[1]}</h1>
        {/if}
        {#if m[0].includes("image")}
          <img src={`data:image/png;base64,${m[1]}`} alt="Recipient" />
        {/if}
      </div>
    {/each}
  </div>

  {#if form?.error}
    <div class="text-red-600 text-center mb-5">
      {form.error}
    </div>
  {/if}

  <Numpad bind:amount {rate} {currency} bind:submit={send} />

  <form action="?/pay" method="POST" use:enhance onsubmit={submit}>
    <input name="amount" value={amount} type="hidden" />
    <input name="minSendable" value={minSendable} type="hidden" />
    <input name="maxSendable" value={maxSendable} type="hidden" />
    <input name="callback" value={callback} type="hidden" />
    <input name="pin" value={$pin} type="hidden" />

    {#if commentAllowed}
      <textarea
        name="comment"
        placeholder={$t("payments.message")}
        class="w-full p-4 border rounded-xl h-32 text-xl"
        bind:value={comment}
        autocapitalize="none"
      ></textarea>
    {/if}

    <div class="flex w-full gap-2">
      {#if max >= Math.round(minSendable / 1000)}
        <!-- loading is set by the form's onsubmit, not here: flipping
             `disabled` from a click handler lands in the DOM before the
             browser's submit activation runs, and a disabled button submits
             nothing (the page just sat on a spinner). -->
        <button
          type="submit"
          class="btn !w-auto grow"
          formaction="?/max"
          disabled={loading}>Max ⚡️{s(max)}</button
        >
      {/if}
      <button bind:this={send} type="submit" class="btn btn-accent !w-auto grow">
        {#if loading}
          <Spinner />
        {:else}
          {$t("payments.send")}
        {/if}
      </button>
    </div>
  </form>
</div>
