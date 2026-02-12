<script lang="ts">
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { fiat as fiatStore, pin } from "$lib/store";
  import handler from "$lib/handler";
  import { loc, focus, s, f, sats } from "$lib/utils";
  import { applyAction, deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  let { data, form } = $props();
  let amount = $state(data.amount);
  let user = $derived(data.user);
  let balance = $derived(user.balance);
  let currency = $derived(user.currency);
  let name = $derived(data.name);
  let rate = $derived(data.rate);
  let loading = $state();
  let fiat = $state();
  let locale = $derived(loc(user));

  let submit = $state();
  let submitting: boolean = $state(false);
  let toggle = () => (submitting = !submitting);
  $effect(() => {
    if (form?.message?.includes("pin")) $pin = undefined;
    loading = false;
  });
  let formElement = $state();

  let setMax = async (e) => {
    e.preventDefault();
    let body = new FormData(formElement as HTMLFormElement);
    body.set("fiat", String(false));
    body.set("amount", user.balance);

    const response = await fetch((formElement as HTMLFormElement).action, {
      method: "POST",
      body,
    });

    const result = deserialize(await response.text());
    if (result.type === "success") await invalidateAll();
    applyAction(result);
  };
</script>

{#if form?.message}
  <div class="text-red-600 text-center">{form.message}</div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto">
  <Numpad bind:amount {currency} {rate} {fiat} {submit} {locale} />

  <form use:enhance={handler(toggle)} method="POST" class="space-y-5" bind:this={formElement}>
    <input name="fund" value={name} type="hidden" />
    <input name="amount" value={amount} type="hidden" />
    <input name="pin" value={$pin} type="hidden" />

    <div class="flex gap-2">
      <button
        type="button"
        class="btn !w-auto grow"
        onclick={setMax}
        disabled={submitting}
        onkeydown={setMax}
      >
        {#if $fiatStore}
          Max {f((balance * rate) / sats, currency, locale)}
        {:else}
          Max ⚡️{s(balance)}
        {/if}
      </button>

      <button use:focus bind:this={submit} type="submit" class="btn btn-accent !w-auto grow">
        {#if submitting}
          <Spinner />
        {:else}
          <div class="my-auto">{$t("payments.next")}</div>
        {/if}
      </button>
    </div>
  </form>
</div>
