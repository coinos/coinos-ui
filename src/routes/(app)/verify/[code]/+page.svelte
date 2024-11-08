<script>
  import { scale } from "svelte/transition";
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";

  let { data } = $props();
  let { user, error } = data;
</script>

<div class="container px-4 text-center mx-auto">
  {#if error}
    <h1 class="text-3xl md:text-4xl font-bold mb-6">
      Email verification failed
    </h1>
  {:else if user.verified}
    <div
      class="flex w-full py-5 max-w-[200px] mx-auto"
      in:scale={{ start: 0.5 }}
    >
      <Icon icon="check" style="mx-auto" />
    </div>

    <h1 class="text-3xl md:text-4xl font-bold mb-6">
      Email verified successfully!
    </h1>
  {/if}
</div>

<a href={`/${user.username}`}>
  <div class="opacity-0 w-screen h-screen fixed top-0 left-0 z-50"></div>
</a>

<div class="flex justify-center">
  {$t("payments.tapAnywhere")}
</div>
