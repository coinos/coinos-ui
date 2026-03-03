<script lang="ts">
  import { offline } from "$lib/store";
</script>

{#if $offline}
  <div class="alert alert-warning sticky top-0 z-50 rounded-none justify-center gap-2">
    <iconify-icon icon="ph:wifi-slash-bold" width="20"></iconify-icon>
    You're offline — showing cached data
  </div>
{/if}
