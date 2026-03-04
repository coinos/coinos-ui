<script lang="ts">
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { fiat as fiatStore, pin } from "$lib/store";
  import handler from "$lib/handler";
  import Toggle from "$comp/Toggle.svelte";
  import { loc, focus, s, f, sats } from "$lib/utils";
  import { applyAction, deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  let { data, form } = $props();
  let amount = $state((() => data.amount)());
  let user = $derived(data.user);
  let balance = $derived(user.balance);
  let currency = $derived(user.currency);
  let name = $derived(data.name);
  let rate = $derived(data.rate);
  let loading = $state();
  let fiat = $state();
  let locale = $derived(loc(user));

  let authorize = $state(false);
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
    <input name="authorize" value={authorize} type="hidden" />
    <input name="currency" value={currency} type="hidden" />
    <input name="rate" value={rate} type="hidden" />

    <div class="flex items-center justify-center gap-3 mt-4">
      <span class="text-sm" class:opacity-40={authorize}>{$t("funds.immediateContribution")}</span>
      <Toggle id="authorizeToggle" bind:value={authorize} />
      <span class="text-sm" class:opacity-40={!authorize}>{$t("funds.fiatAuthorization")}</span>
    </div>
    <p class="text-center text-sm opacity-60 mt-2">
      {#if authorize}
        {$t("funds.authorizeDesc")}
      {:else}
        {$t("funds.contributeDesc")}
      {/if}
    </p>

    <div class="flex gap-2">
      {#if !authorize}
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
      {/if}

      <button bind:this={submit} type="submit" class="btn btn-accent !w-auto grow" disabled={submitting || !amount}>
        {#if submitting}
          <Spinner />
        {:else}
          <div class="my-auto">{authorize ? $t("payments.authorize") : $t("payments.next")}</div>
        {/if}
      </button>
    </div>
  </form>

</div>
