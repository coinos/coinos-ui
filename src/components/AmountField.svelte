<script>
  import { t } from "$lib/translations";
  import { tick } from "svelte";
  import Numpad from "$comp/Numpad.svelte";

  let {
    amount = $bindable(),
    none = $t("accounts.none"),
    desc,
    currency,
    rate,
    label,
    name,
  } = $props();

  let setting = $state();
  let set = () => {
    setting = false;
  };
  let done = $state();
  let startSetting = async () => {
    setting = true;
    await tick();
    numpad.focus();
  };
  let numpad = $state();
</script>

<div>
  <label for="name" class="font-bold mb-1 block">{label}</label>

  {#if desc}
    <p class="text-secondary my-2">{desc}</p>
  {/if}

  <button type="button" class="flex w-full" onclick={startSetting}>
    <div class="p-4 border rounded-2xl rounded-r-none border-r-0 bg-base-200">
      <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"
      ></iconify-icon>
    </div>

    <div
      class="border-l-0 rounded-l-none pl-2 w-full p-4 border rounded-2xl text-left"
    >
      {amount || none}
    </div>
    <input type="hidden" {name} bind:value={amount} />
  </button>
</div>

{#if setting}
  <div
    class="fixed bg-base-100 bg-opacity-90 inset-0 overflow-y-auto h-full w-full z-50 max-w-lg mx-auto"
  >
    <div class="relative p-5 border shadow-lg rounded-md bg-base-100 space-y-5">
      <h1 class="text-center text-2xl font-semibold">
        {label}
      </h1>
      <Numpad
        bind:amount
        {currency}
        {rate}
        bind:submit={done}
        bind:element={numpad}
      />

      <button bind:this={done} type="button" onclick={set} class="btn"
        >Ok</button
      >
    </div>
  </div>
{/if}
