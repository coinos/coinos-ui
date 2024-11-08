<script>
  import { goto } from "$app/navigation";
  import Pin from "$comp/Pin.svelte";
  import { pin } from "$lib/store";

  let { data, children } = $props();

  let { user } = data;
  let cancel = () => goto(`/${user.username}`);
</script>

{#if user?.haspin && (!$pin || $pin?.length !== 6)}
  <Pin bind:value={$pin} {cancel} />
{/if}

{@render children?.()}
