<script lang="ts">
  import PhWifiSlashBold from "virtual:icons/ph/wifi-slash-bold";
  import { offline } from "$lib/store";
</script>

{#if $offline}
  <div class="alert alert-warning sticky top-0 z-50 rounded-none justify-center gap-2">
    <PhWifiSlashBold width="20" />
    You're offline — showing cached data
  </div>
{/if}
