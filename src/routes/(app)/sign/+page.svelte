<script lang="ts">
  import { copy, focus } from "$lib/utils";
  import { enhance } from "$app/forms";

  let { data, form } = $props();
  let { address } = $derived(data);
  let message = $state();
  let { signature } = $derived(form);
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 text-center">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    Sign message with address
  </h1>

  {#if form}
    <div class="text-2xl break-all">{signature}</div>

    <button onclick={() => copy(signature)} type="button" class="btn grow">
      <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
      <div class="my-auto">Copy</div></button
    >
  {:else}
    <div class="text-2xl break-all">{address}</div>
    <form use:enhance method="POST" class="space-y-5">
      <input name="address" value={address} type="hidden" />
      <input name="message" bind:value={message} />
      <button use:focus type="submit" class="btn btn-accent !w-auto grow">
        <div class="my-auto">Submit</div>
      </button>
    </form>
  {/if}
</div>
