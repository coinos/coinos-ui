<script>
  import Event from "$comp/Event.svelte";

  let { data } = $props();
  let { event } = $derived(data);

  let zap = () => {};
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    Event
  </h1>

  <Event {event} last={true} />
</div>
