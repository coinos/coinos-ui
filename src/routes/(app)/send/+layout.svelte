<script lang="ts">
  import { goto } from "$app/navigation";
  import Pin from "$comp/Pin.svelte";
  import { pin } from "$lib/store";

  let { data, children } = $props();

  let user = $derived(data.user);
  let cancel: any = () => goto(`/${user.username}`);
</script>

{#if user?.haspin && !$pin}
  <Pin bind:value={$pin} {cancel} />
{/if}

{@render children?.()}
