<script>
  let { icon, style = undefined } = $props();
</script>

<img src="/icons/{icon}.svg" alt={icon} class={style} />
