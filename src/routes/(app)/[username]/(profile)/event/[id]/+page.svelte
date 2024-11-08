<script>
  import Event from "$comp/Event.svelte";
  let { data } = $props();
  let { event } = data;
</script>

<Event {event} />
