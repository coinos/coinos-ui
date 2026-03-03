<script lang="ts">
  let { image, style, loading = undefined, width = undefined, height = undefined, fetchpriority = undefined }: {
    image: string;
    style?: string;
    loading?: "lazy" | "eager";
    width?: number;
    height?: number;
    fetchpriority?: "high" | "low" | "auto";
  } = $props();
</script>

<img
  src="/images/{image}.webp"
  alt={image}
  class={style}
  {loading}
  {width}
  {height}
  {fetchpriority}
/>
