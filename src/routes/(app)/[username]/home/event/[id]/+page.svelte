<script>
  import Event from "$comp/Event.svelte";
  export let data;
  let { event } = data;
</script>

<Event {event} />
