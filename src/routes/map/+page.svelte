<script>
  import Icon from "$comp/Icon.svelte";
  import LocationsMap from "$comp/LocationsMap.svelte";
  export let data;

  let { locations } = data;
</script>

<div class="pt-4">
  <div class="w-[243px] mx-auto mb-4">
    <a href="/">
      <Icon icon="logo" />
    </a>
  </div>

  <div class="flex justify-center items-center">
    <LocationsMap {locations} />
  </div>
</div>
