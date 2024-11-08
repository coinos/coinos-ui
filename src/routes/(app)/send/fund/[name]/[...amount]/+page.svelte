<script>
  import { run } from 'svelte/legacy';

  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import Icon from "$comp/Icon.svelte";
  import Numpad from "$comp/Numpad.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { page } from "$app/stores";
  import { back } from "$lib/utils";
  import { pin } from "$lib/store";

  let { data, form } = $props();

  let { amount, name } = $state($page.params);
  let { rates } = data;
  let { currency } = data.user;
  let loading = $state();


  let submit = () => (loading = true);
  let update = () => {
    if (form?.message?.includes("pin")) $pin = undefined;
    loading = false;
  };
  let rate;
  run(() => {
    rate = rates[currency];
  });
  run(() => {
    update(form);
  });
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" onclick={back}>
  <Icon icon="arrow-left" style="w-10" />
</button>

{#if form?.message}
  <div class="text-red-600 text-center">
    {form.message}
  </div>
{/if}

<div class="container px-4 mt-20 max-w-xl mx-auto">
  <Numpad bind:amount {currency} bind:rate />

  <form method="POST" use:enhance onsubmit={submit}>
    <input name="name" value={name} type="hidden" />
    <input name="amount" value={amount} type="hidden" />
    <input name="pin" value={$pin} type="hidden" />

    <div class="flex w-full">
      <button
        type="submit"
        class="opacity-100 hover:opacity-80'} rounded-2xl border py-3 font-bold mx-auto mt-2 bg-black text-white px-4 w-24"
      >
        {#if loading}
          <Spinner />
        {:else}
          {$t("payments.send")}
        {/if}
      </button>
    </div>
  </form>
</div>
