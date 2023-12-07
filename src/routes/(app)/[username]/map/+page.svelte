<script>
  import LocationsMap from "$comp/LocationsMap.svelte";
  export let data;

  let { locations } = data;
</script>

<LocationsMap {locations} />
