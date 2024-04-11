<script>
  import Icon from "$comp/Icon.svelte";
  import LocationsMap from "$comp/LocationsMap.svelte";
  export let data;

  let { locations } = data;
</script>

<div class="h-screen w-screen">
<LocationsMap {locations} />
</div>

