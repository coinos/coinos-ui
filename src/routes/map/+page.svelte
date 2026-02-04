<script>
  import Icon from "$comp/Icon.svelte";
  import LocationsMap from "$comp/LocationsMap.svelte";
  let { data } = $props();

  let locations = $derived(data.locations);
</script>

<div class="h-screen w-screen">
  <LocationsMap {locations} />
</div>
