<script lang="ts">
  import type { Snippet } from "svelte";

  let { data, children, fixed }: { data: any; children: Snippet; fixed?: Snippet } = $props();
</script>

<div class="content">
  {@render children?.()}
</div>

{@render fixed?.()}
