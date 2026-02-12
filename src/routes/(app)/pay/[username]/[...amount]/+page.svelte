<script lang="ts">
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import { goto, invalidateAll } from "$app/navigation";
  import { enhance } from "$app/forms";
  import Numpad from "$comp/Numpad.svelte";
  import { page } from "$app/stores";
  import { f, loc, fail, post, s, sat, sats } from "$lib/utils";
  import { fiat as fiatStore } from "$lib/store";
  import { applyAction, deserialize } from "$app/forms";

  let { data, form } = $props();

  let subject = $derived(data.subject);
  let rate = $derived(data.rate);
  let user = $derived(data.user);
  let currency = $derived(subject?.currency || "USD");
  let locale = $derived(loc(subject));
  let next = $state();

  let initialAmount = $derived((form as any)?.amount || data.amount);
  let amount = $state();
  let fiat = $state();
  let formElement: HTMLFormElement | undefined = $state();

  $effect(() => {
    if (typeof amount === "undefined") amount = initialAmount;
    if (typeof fiat === "undefined") fiat = !initialAmount;
  });

  let setMax = async (e) => {
    e.preventDefault();
    let body = new FormData(formElement);
    body.set("fiat", String(false));
    body.set("amount", user.balance);

    const response = await fetch(formElement!.action, {
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

<div class="container px-4 mt-20 max-w-xl mx-auto space-y-2">
  <Numpad bind:amount bind:fiat {currency} {locale} {rate} submit={next} />

  <form method="POST" use:enhance class="flex gap-2 justify-center" bind:this={formElement}>
    <input name="amount" bind:value={amount} type="hidden" />
    <input name="rate" value={rate} type="hidden" />
    <input name="username" value={subject.username} type="hidden" />
    <input name="prompt" value={subject.prompt} type="hidden" />

    {#if user?.balance}
      <button type="button" class="btn !w-auto grow" onclick={setMax} onkeydown={setMax}>
        {#if $fiatStore}
          Max {f((user.balance * rate) / sats, currency, locale)}
        {:else}
          Max ⚡️{s(user.balance)}
        {/if}
      </button>
    {/if}

    <button type="submit" bind:this={next} class="btn btn-accent !w-auto grow">
      {$t("payments.next")}
    </button>
  </form>
</div>
