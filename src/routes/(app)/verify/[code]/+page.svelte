<script lang="ts">
  import { scale } from "svelte/transition";
  import { t } from "$lib/translations";

  let { data } = $props();
  let user = $derived(data.user);
  let error = $derived(data.error);
</script>

<div class="container px-4 text-center mx-auto">
  {#if error}
    <h1 class="text-3xl md:text-4xl font-bold mb-6">Email verification failed</h1>
  {:else if user.verified}
    <div class="flex w-full py-5 max-w-[200px] mx-auto" in:scale={{ start: 0.5 }}>
      <iconify-icon noobserver icon="ph:check-bold" class="mx-auto w-full text-[#7ACC8F]"
      ></iconify-icon>
    </div>

    <h1 class="text-3xl md:text-4xl font-bold mb-6">Email verified successfully!</h1>
  {/if}
</div>

<a href={`/${user.username}`} aria-label="Go to profile">
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50"></div>
</a>

<div class="flex justify-center">{$t("payments.tapAnywhere")}</div>
