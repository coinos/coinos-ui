<script lang="ts">
  import InvoiceTypes from "$comp/InvoiceTypes.svelte";
  import { focus } from "$lib/utils";

  let {
    newAmount = $bindable(),
    invoice,
    user,
    submit = $bindable(),
    settingType,
    setAmount,
    setType,
    toggleType,
    activeOnly = false,
    t,
  }: any = $props();

</script>

{#if settingType}
  <div
    class="fixed inset-0 bg-base-100/90 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative mx-auto p-12 max-w-xl shadow-lg rounded-md bg-base-100 space-y-2"
    >
      <InvoiceTypes
        bind:newAmount
        {setAmount}
        {invoice}
        {user}
        {setType}
        {toggleType}
        {t}
      />
    </div>
  </div>
{/if}
