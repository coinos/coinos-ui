<script>
  import Event from "$comp/Event.svelte";

  let { data } = $props();
  let { thread } = $derived(data);
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    Thread
  </h1>

  {#each thread as event}
    <Event {event} minimal={true} />
  {/each}
</div>
