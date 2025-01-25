<script>
  import Event from "$comp/Event.svelte";

  let { data } = $props();
  let { event, user } = $derived(data);
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5">
  <Event {event} {user} />
</div>
