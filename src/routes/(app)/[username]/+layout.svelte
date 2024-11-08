<script>
  let { data, children, fixed } = $props();
</script>

<div class="content">
  {@render children?.()}
</div>

{@render fixed?.()}
